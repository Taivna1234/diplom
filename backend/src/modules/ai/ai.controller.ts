import { Request, Response } from "express"
import { AIService } from "./ai.service"
import { AIProviderError } from "../../utils/gemini"

function handleAIError(res: Response, error: unknown, fallback: string) {
  console.error(error)

  if (error instanceof AIProviderError) {
    return res.status(error.statusCode).json({ message: error.message })
  }

  return res.status(500).json({ message: fallback })
}

export class AIController {

  static async getSummary(req: Request, res: Response) {

    try {

      const { bookId } = req.params

      const summary = await AIService.getBookSummary(bookId as string)

      res.json({ summary })

    } catch (error) {
      return handleAIError(res, error, "Failed to generate summary")
    }

  }
  static async getSummaryByTitle(req: Request, res: Response) {
    try {
      const { title } = req.body
      const summary = await AIService.getSummaryByTitle(title)
      res.json({ summary })
    } catch (error) {
      return handleAIError(res, error, "Failed to generate summary")
    }
  }

static async askQuestion(req: Request, res: Response) {
  try {

    const { question, bookId } = req.body
    const userId = req.user?.userId

    const answer = await AIService.askBookQuestion(
      question,
      userId,
      bookId
    )

    res.json({ answer })

  } catch (error) {
    return handleAIError(res, error, "Failed to generate answer")
  }
}

  static async getRecommendations(req: Request, res: Response) {
    try {
      const userId = req.user?.userId
      if (!userId) return res.status(401).json({ message: "Unauthorized" })

      const bookId = req.query.bookId as string | undefined
      const result = await AIService.getRecommendations(userId, bookId)
      res.json(result)
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: "Failed to get recommendations" })
    }
  }

}
