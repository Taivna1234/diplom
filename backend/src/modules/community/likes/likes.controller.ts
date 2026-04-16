import { Request, Response } from "express"
import { LikesService } from "./likes.service"


export class LikesController {

  static async like(req: Request, res: Response) {

    try {

      const userId = (req as any).user.userId
      const { postId } = req.params

      const like = await LikesService.likePost(userId, postId as string)
      
      res.json(like)

    } catch (error) {
      console.error(error)
      res.status(500).json({ message: "Failed to like post" })
    }

  }

  static async unlike(req: Request, res: Response) {

    try {

      const userId = (req as any).user.userId
      const { postId } = req.params

      await LikesService.unlikePost(userId, postId as string)

      res.json({ message: "Post unliked" })

    } catch (error) {
      console.error(error)
      res.status(500).json({ message: "Failed to unlike post" })
    }

  }

  static async count(req: Request, res: Response) {

    try {

      const { postId } = req.params

      const count = await LikesService.getLikes(postId as string)

      res.json({ count })

    } catch (error) {
      console.error(error)
      res.status(500).json({ message: "Failed to fetch likes" })
    }

  }

}