import { Request, Response } from "express"
import { CommentsService } from "./comments.service"

export class CommentsController {

  static async create(req: Request, res: Response) {

    try {

      const userId = (req as any).user.userId
      const { postId, content, parentId } = req.body

      if (!postId || !content) {
        return res.status(400).json({ message: "postId and content required" })
      }

      const comment = await CommentsService.createComment(
        userId,
        postId,
        content,
        parentId
      )

      res.status(201).json(comment)

    } catch (error) {
      console.error(error)
      res.status(500).json({ message: "Failed to create comment" })
    }

  }

  static async getByPost(req: Request, res: Response) {

    try {

      const { postId } = req.params

      const comments = await CommentsService.getComments(postId as string)

      res.json(comments)

    } catch (error) {
      console.error(error)
      res.status(500).json({ message: "Failed to fetch comments" })
    }

  }

}