import { GoogleGenerativeAI } from "@google/generative-ai"
import { env } from "../config/env"

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY)

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash-lite",
  generationConfig: {
    temperature: 0.7,
    maxOutputTokens: 8192,
  },
})

export async function askGemini(prompt: string): Promise<string> {
  const result = await model.generateContent(prompt)
  const response = result.response

  const finishReason = response.candidates?.[0]?.finishReason
  if (finishReason === "MAX_TOKENS") {
    console.warn("[Gemini] Response hit token limit — consider reducing prompt or increasing maxOutputTokens")
  }

  return response.text()
}
