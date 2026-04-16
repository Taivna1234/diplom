import { Request, Response } from "express"
import { PostsService } from "./posts.service"

export class PostsController {

  static async create(req: Request, res: Response) {

    try {

      const userId = (req as any).user.userId
      const { bookId, content } = req.body

      if (!content) {
        return res.status(400).json({ message: "Content required" })
      }

      const post = await PostsService.createPost(
        userId,
        bookId || null,
        content
      )

      res.status(201).json(post)

    } catch (error) {
      console.error(error)
      res.status(500).json({ message: "Failed to create post" })
    }

  }

  static async getAll(req: Request, res: Response) {

    try {

      const posts = await PostsService.getAllPosts()

      res.json(posts)

    } catch (error) {
      console.error(error)
      res.status(500).json({ message: "Failed to fetch posts" })
    }

  }

  static async getByBook(req: Request, res: Response) {

    try {

      const { bookId } = req.params

      const posts = await PostsService.getPostsByBook(bookId as string)

      res.json(posts)

    } catch (error) {
      console.error(error)
      res.status(500).json({ message: "Failed to fetch posts" })
    }

  }

}