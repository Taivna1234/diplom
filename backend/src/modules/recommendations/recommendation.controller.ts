import { Request, Response } from "express"
import { RecommendationService } from "./recommendation.service"

export class RecommendationController {

  static async trending(req: Request, res: Response) {

    try {

      const books = await RecommendationService.getTrendingBooks()

      res.json(books)

    } catch (error) {

      console.error(error)
      res.status(500).json({ message: "Failed to fetch trending books" })

    }

  }
  static async personal(req: Request, res: Response) {

  try {

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    const books = await RecommendationService.getPersonalRecommendations(
      req.user.userId
    )

    res.json(books)

  } catch (error) {

    console.error(error)
    res.status(500).json({ message: "Failed to fetch recommendations" })

  }

}

}