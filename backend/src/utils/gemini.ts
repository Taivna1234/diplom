import { GoogleGenerativeAI } from "@google/generative-ai"
import { env } from "../config/env"

export class AIProviderError extends Error {
  statusCode: number

  constructor(message: string, statusCode = 502) {
    super(message)
    this.name = "AIProviderError"
    this.statusCode = statusCode
  }
}

export async function askGemini(prompt: string): Promise<string> {
  if (!env.GEMINI_API_KEY) {
    throw new AIProviderError("GEMINI_API_KEY is not configured", 503)
  }

  try {
    const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({
      model: env.GEMINI_MODEL,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192,
      },
    })

    const result = await model.generateContent(prompt)
    const response = result.response

    const finishReason = response.candidates?.[0]?.finishReason
    if (finishReason === "MAX_TOKENS") {
      console.warn("[Gemini] Response hit token limit - consider reducing prompt or increasing maxOutputTokens")
    }

    return response.text()
  } catch (error: any) {
    if (error instanceof AIProviderError) throw error

    const message = error?.message || "Gemini request failed"
    const statusCode = typeof error?.status === "number" ? error.status : 502
    console.error("[Gemini] request failed", {
      status: error?.status,
      model: env.GEMINI_MODEL,
      message,
    })
    throw new AIProviderError(message, statusCode)
  }
}
