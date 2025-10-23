// This file should be placed in the `api` directory at the root of your project.
// For example: /api/analyze.ts

import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const { image } = req.body;

  if (!image) {
    return res.status(400).json({ message: 'داده تصویر در درخواست وجود ندارد.' });
  }

  const API_KEY = process.env.API_KEY;

  if (!API_KEY) {
    console.error("Vercel API_KEY environment variable not set on the server.");
    return res.status(500).json({ message: 'کلید API در سرور تنظیم نشده است. لطفاً تنظیمات Vercel را بررسی کنید.' });
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  try {
    const stream = await ai.models.generateContentStream({
      model: 'gemini-flash-latest',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: image,
            },
          },
          {
            // Updated prompt for a simpler, faster, line-based streaming format
            text: `این تصویر را تحلیل کن و نتیجه را دقیقاً در قالب زیر ارائه بده. هر مورد باید در یک خط جدید باشد و هیچ متن اضافی تولید نکن. تحلیل باید بسیار سریع باشد:
SCORE: [امتیاز از 0 تا 100]
POSITIVE: [مهم‌ترین ویژگی مثبت]
POSITIVE: [دومین ویژگی مثبت]
TIP: [مهم‌ترین نکته برای بهبود]
TIP: [دومین نکته برای بهبود]`,
          },
        ],
      },
      config: {
        // Removed JSON schema for faster, simpler text streaming
        systemInstruction: `شما یک تحلیلگر زیبایی با هوش مصنوعی هستید. نقش شما ارائه تحلیلی سازنده، مثبت و محترمانه از ویژگی‌های چهره فرد در عکس است. لحنی حمایت‌گر و دلگرم‌کننده داشته باشید. خروجی شما باید دقیقاً مطابق با فرمت خواسته شده (SCORE, POSITIVE, TIP) و بدون هیچ متن اضافی باشد.`,
      },
    });

    // Set headers for a streaming response
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');

    // Stream the response chunks back to the client
    for await (const chunk of stream) {
        const chunkText = chunk.text;
        if (chunkText) {
            res.write(chunkText);
        }
    }
    
    // End the response stream
    res.end();

  } catch (error) {
    console.error("Error calling Gemini API from serverless function:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (!res.headersSent) {
      if (errorMessage.includes("API key not valid") || errorMessage.includes("API_KEY_INVALID")) {
          return res.status(500).json({ message: "کلید API نامعتبر است. لطفاً کلید خود را در تنظیمات Vercel بررسی کنید."});
      }
      return res.status(500).json({ message: "متاسفانه در تحلیل تصویر مشکلی پیش آمد. لطفا دوباره تلاش کنید." });
    }
  }
}
