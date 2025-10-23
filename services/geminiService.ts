import { GoogleGenAI } from "@google/genai";

export type AnalysisUpdate =
  | { type: 'SCORE'; value: number }
  | { type: 'POSITIVE'; value: string }
  | { type: 'TIP'; value: string }
  | { type: 'DONE' }
  | { type: 'ERROR'; value: string };


const processLine = (line: string, onUpdate: (update: AnalysisUpdate) => void) => {
  if (line.startsWith('SCORE:')) {
    const score = parseInt(line.substring(6).trim(), 10);
    if (!isNaN(score)) {
      onUpdate({ type: 'SCORE', value: score });
    }
  } else if (line.startsWith('POSITIVE:')) {
    onUpdate({ type: 'POSITIVE', value: line.substring(9).trim() });
  } else if (line.startsWith('TIP:')) {
    onUpdate({ type: 'TIP', value: line.substring(4).trim() });
  }
};

export async function analyzeImageForBeauty(
  base64Image: string,
  onUpdate: (update: AnalysisUpdate) => void
): Promise<void> {
  try {
    const API_KEY = process.env.API_KEY;
    if (!API_KEY) {
      // It's better to show the error in the UI.
      onUpdate({ type: 'ERROR', value: 'کلید API در محیط کلاینت تنظیم نشده است.' });
      return;
    }

    const ai = new GoogleGenAI({ apiKey: API_KEY });

    const stream = await ai.models.generateContentStream({
      model: 'gemini-flash-latest',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image,
            },
          },
          {
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
        systemInstruction: `شما یک تحلیلگر زیبایی با هوش مصنوعی هستید. نقش شما ارائه تحلیلی سازنده، مثبت و محترمانه از ویژگی‌های چهره فرد در عکس است. لحنی حمایت‌گر و دلگرم‌کننده داشته باشید. خروجی شما باید دقیقاً مطابق با فرمت خواسته شده (SCORE, POSITIVE, TIP) و بدون هیچ متن اضافی باشد.`,
      },
    });

    let buffer = '';
    for await (const chunk of stream) {
        const chunkText = chunk.text;
        if (chunkText) {
            buffer += chunkText;
            let newlineIndex;
            while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
                const line = buffer.substring(0, newlineIndex).trim();
                buffer = buffer.substring(newlineIndex + 1);
                if (line) {
                    processLine(line, onUpdate);
                }
            }
        }
    }
    // Process any remaining text in the buffer after the stream ends
    if (buffer.trim()) {
      processLine(buffer.trim(), onUpdate);
    }
    
    onUpdate({ type: 'DONE' });

  } catch (error) {
    console.error("Error calling Gemini API from client:", error);
    let errorMessage = "متاسفانه در تحلیل تصویر مشکلی پیش آمد. لطفا دوباره تلاش کنید.";
    if (error instanceof Error) {
        if (error.message.includes("API key not valid") || error.message.includes("API_KEY_INVALID")) {
            errorMessage = "کلید API نامعتبر است. لطفاً از یک کلید معتبر استفاده کنید.";
        } else {
            errorMessage = error.message;
        }
    }
    onUpdate({ type: 'ERROR', value: errorMessage });
  }
}