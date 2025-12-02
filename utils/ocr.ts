// import * as FileSystem from "expo-file-system";
// import { ExpenseCategory } from "@/types/expense";
// import { CATEGORY_KEYWORDS } from "@/constants/categories";

// const OCR_API = "https://api.ocr.space/parse/image";
// const API_KEY = "YAIzaSyAfkAoZl9NcAz0OSSxzhqDJOtmRtCbEShQ"; // You can replace later

// export async function extractReceiptData(imageUri: string) {
//   try {
//     console.log("Starting OCR extraction...");

//     // Convert image to Base64 (Expo SDK 51+ uses string literal)
//     const base64Img = await FileSystem.readAsStringAsync(imageUri, {
//       encoding: "base64",
//     });

//     const form = new FormData();
//     form.append("apikey", API_KEY);
//     form.append("base64Image", `data:image/jpg;base64,${base64Img}`);
//     form.append("scale", "true");
//     form.append("isTable", "true");

//     const response = await fetch(OCR_API, {
//       method: "POST",
//       body: form,
//     });

//     const data = await response.json();
//     console.log("OCR raw:", data);

//     const text: string = data?.ParsedResults?.[0]?.ParsedText || "";

//     if (!text || text.trim().length < 2) {
//       throw new Error("Receipt text unreadable");
//     }

//     console.log("Extracted TEXT:\n", text);

//     // -----------------------------
//     // 1️⃣ Extract Amount
//     // -----------------------------
//     let amount = 0;

//     const amountRegex = /(?:₹|INR|Rs\.?)\s*([0-9]+(?:\.[0-9]+)?)/i;
//     const amountMatch = text.match(amountRegex);

//     if (amountMatch) {
//       amount = Number(amountMatch[1]);
//     } else {
//       // fallback → pick last decimal number
//       const fallback = text.match(/([0-9]+\.[0-9]{2})/);
//       if (fallback) amount = Number(fallback[1]);
//     }

//     // -----------------------------
//     // 2️⃣ Extract Store Name
//     // -----------------------------
//     const lines: string[] = text.split("\n").map((line: string) => line.trim());
//     const storeName: string =
//       lines.find((line: string) => line.length > 3) || "Unknown Store";

//     // -----------------------------
//     // 3️⃣ Extract Date
//     // -----------------------------
//     const dateRegex = /\b(20\d{2}[-/.]\d{1,2}[-/.]\d{1,2})\b/;
//     const dateMatch = text.match(dateRegex);

//     const date: string = dateMatch
//       ? dateMatch[1].replace(/\./g, "-").replace(/\//g, "-")
//       : "2025-01-01";

//     // -----------------------------
//     // 4️⃣ Suggested Category
//     // -----------------------------
//     const suggestedCategory = detectCategory(storeName);

//     return {
//       amount,
//       storeName,
//       date,
//       suggestedCategory,
//       rawText: text,
//     };
//   } catch (error) {
//     console.error("OCR extraction error:", error);
//     throw new Error("Failed to extract receipt data. Try again.");
//   }
// }

// function detectCategory(storeName: string): ExpenseCategory {
//   const lower = storeName.toLowerCase();

//   for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
//     if (keywords.some((keyword) => lower.includes(keyword))) {
//       return category as ExpenseCategory;
//     }
//   }
//   return "Other";
// }

import { CATEGORY_KEYWORDS } from "@/constants/categories";
import { ExpenseCategory } from "@/types/expense";
import * as ImageManipulator from "expo-image-manipulator";
const GEMINI_API_KEY = "AIzaSyAfkAoZl9NcAz0OSSxzhqDJOtmRtCbEShQ"; // Replace with your actual API key

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";


// Convert ANY URI → Base64 with optimization for faster OCR
async function imageToBase64(uri: string): Promise<string> {
  // Resize image to max 1024px width for faster processing
  // OCR doesn't need full resolution
  const manipulated = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 1024 } }], // Resize to max 1024px width
    {
      compress: 0.7, // Compress to 70% quality (good balance)
      format: ImageManipulator.SaveFormat.JPEG,
      base64: true
    }
  );

  if (!manipulated.base64) {
    throw new Error("Base64 conversion failed");
  }

  return manipulated.base64;
}

export async function extractReceiptData(imageUri: string) {
  try {
    console.log("Starting Gemini OCR...");

    const base64Img = await imageToBase64(imageUri);

    const payload = {
      contents: [
        {
          parts: [
            {
              text:
                "You are an OCR system that extracts data from receipt images. Analyze this receipt and return ONLY a valid JSON object with these exact keys: {amount:number, storeName:string, date:YYYY-MM-DD}. Do not include any markdown, explanations, or code blocks. Return only the raw JSON object.",
            },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: base64Img,
              },
            },
          ],
        },
      ],
    };

    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    console.log("Gemini Result:", result);

    if (result.error) {
      throw new Error(result.error.message);
    }

    let textResponse =
      result?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!textResponse) throw new Error("No OCR response");

    console.log("Raw OCR Text:", textResponse);

    // Remove markdown code blocks if present
    textResponse = textResponse.trim();
    if (textResponse.startsWith("```json")) {
      textResponse = textResponse.replace(/^```json\s*/, "").replace(/```\s*$/, "");
    } else if (textResponse.startsWith("```")) {
      textResponse = textResponse.replace(/^```\s*/, "").replace(/```\s*$/, "");
    }
    textResponse = textResponse.trim();

    console.log("Cleaned Text:", textResponse);

    let parsed;
    try {
      parsed = JSON.parse(textResponse);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      throw new Error("Invalid OCR JSON");
    }

    return {
      amount: Number(parsed.amount || 0),
      storeName: parsed.storeName || "Unknown Store",
      date: parsed.date || "2025-01-01",
      suggestedCategory: detectCategory(parsed.storeName || ""),
      rawText: textResponse,
    };
  } catch (error) {
    console.error("Gemini OCR error:", error);
    throw new Error("Failed to extract receipt data. Try again.");
  }
}

function detectCategory(name: string): ExpenseCategory {
  const lower = name.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((k) => lower.includes(k))) return category as ExpenseCategory;
  }
  return "Other";
}
