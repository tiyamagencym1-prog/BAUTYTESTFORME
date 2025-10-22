
import { GoogleGenAI, Type } from "@google/genai";
import { BeautyAnalysis } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

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

export async function analyzeImageForBeauty(base64Image: string): Promise<BeautyAnalysis> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image,
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
      },
      systemInstruction: 'شما یک تحلیلگر زیبایی با هوش مصنوعی هستید. نقش شما ارائه تحلیلی سازنده، مثبت و محترمانه از ویژگی‌های چهره فرد در عکس است. لحنی حمایت‌گر و دلگرم‌کننده داشته باشید. از تولید محتوای توهین‌آمیز، مضر یا تبعیض‌آمیز خودداری کنید. بر اصول جهانی زیبایی‌شناسی مانند تقارن، شفافیت پوست و هماهنگی ویژگی‌ها تمرکز کنید. خروجی شما باید در قالب JSON باشد.',
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText) as BeautyAnalysis;
    return result;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("متاسفانه در تحلیل تصویر مشکلی پیش آمد. لطفا دوباره تلاش کنید.");
  }
}
