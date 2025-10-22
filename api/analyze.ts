// This file should be placed in the `api` directory at the root of your project.
// For example: /api/analyze.ts

import { GoogleGenAI, Type } from "@google/genai";

// The BeautyAnalysis interface should be consistent with your frontend types.
interface BeautyAnalysis {
  score: number;
  positive_points: string[];
  improvement_tips: string[];
}

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    score: {
      type: Type.INTEGER,
      description: "امتیاز زیبایی از 0 تا 100.",
    },
    positive_points: {
      type: Type.ARRAY,
      description: "آرایه‌ای از سه رشته که هر کدام یک ویژگی مثبت چهره را توصیف می‌کنند.",
      items: { type: Type.STRING },
    },
    improvement_tips: {
      type: Type.ARRAY,
      description: "آرایه‌ای از سه رشته که هر کدام یک نکته مفید برای بهبود ارائه می‌دهند.",
      items: { type: Type.STRING },
    },
  },
  required: ["score", "positive_points", "improvement_tips"],
};

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
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: image,
            },
          },
          {
            text: 'این تصویر را تحلیل کن. یک امتیاز زیبایی از 0 تا 100 بده. سه ویژگی مثبت چهره را لیست کن و دلیل زیبایی آن‌ها را توضیح بده. سه نکته کاربردی و مفید برای بهبود ظاهر ارائه بده.',
          },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: analysisSchema,
        systemInstruction: 'شما یک تحلیلگر زیبایی با هوش مصنوعی هستید. نقش شما ارائه تحلیلی سازنده، مثبت و محترمانه از ویژگی‌های چهره فرد در عکس است. لحنی حمایت‌گر و دلگرم‌کننده داشته باشید. از تولید محتوای توهین‌آمیز، مضر یا تبعیض‌آمیز خودداری کنید. بر اصول جهانی زیبایی‌شناسی مانند تقارن، شفافیت پوست و هماهنگی ویژگی‌ها تمرکز کنید. خروجی شما باید در قالب JSON باشد.',
      },
    });

    const jsonText = response.text.trim();
    if (!jsonText.startsWith('{') && !jsonText.startsWith('[')) {
        console.error("Received non-JSON response from Gemini:", jsonText);
        throw new Error("پاسخ دریافتی از سرویس هوش مصنوعی معتبر نبود.");
    }
    const result = JSON.parse(jsonText) as BeautyAnalysis;
    return res.status(200).json(result);

  } catch (error) {
    console.error("Error calling Gemini API from serverless function:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
     if (errorMessage.includes("API key not valid") || errorMessage.includes("API_KEY_INVALID")) {
        return res.status(500).json({ message: "کلید API نامعتبر است. لطفاً کلید خود را در تنظیمات Vercel بررسی کنید."});
    }
    return res.status(500).json({ message: "متاسفانه در تحلیل تصویر مشکلی پیش آمد. لطفا دوباره تلاش کنید." });
  }
}
