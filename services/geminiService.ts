
import { GoogleGenAI } from "@google/genai";
import { PaymentRequest } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY not found in environment variables");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const summarizeRequest = async (request: PaymentRequest): Promise<string> => {
  const ai = getClient();
  if (!ai) return "Gemini API key missing. Cannot generate summary.";

  const prompt = `
    You are an executive assistant helping an Executive Director review payment requests quickly.
    Summarize the following payment request into 2-3 concise sentences. 
    Highlight the vendor, the amount, the project, and the purpose (description).
    
    Request Details:
    - Subject: ${request.requestSubject}
    - Billing Project: ${request.billingProject}
    - Vendor: ${request.vendorName}
    - Amount: ${request.currency} ${request.amount}
    - Department: ${request.department}
    - Description/Memo: ${request.description}
    - Requester: ${request.requesterName}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "No summary available.";
  } catch (error) {
    console.error("Gemini summarization failed:", error);
    return "Failed to generate summary due to an error.";
  }
};
