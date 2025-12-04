
import { CATEGORY_KEYWORDS } from "@/constants/categories";
import { ExpenseCategory } from "@/types/expense";
import * as ImageManipulator from "expo-image-manipulator";
const GEMINI_API_KEY = "AIzaSyCFBXvHiqpK-DXSfWRhr3ZluaSLQRh5iow";

console.log("🔑 Gemini API Key loaded:", GEMINI_API_KEY ? "✅ Yes" : "❌ No");

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
