import { Request, Response } from "express"
import { UsersService } from "./users.service"

export class UsersController {

  static async me(req: Request, res: Response) {
    try {
      const user = await UsersService.getProfile(req.user!.userId)
      res.json(user)
    } catch {
      res.status(500).json({ message: "Failed to fetch profile" })
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { name, bio, avatarUrl, email } = req.body
      const user = await UsersService.updateProfile(req.user!.userId, name, bio, avatarUrl, email)
      res.json(user)
    } catch (err: any) {
      res.status(400).json({ message: err.message || "Failed to update profile" })
    }
  }

  static async changePassword(req: Request, res: Response) {
    try {
      const { currentPassword, newPassword } = req.body
      await UsersService.changePassword(req.user!.userId, currentPassword, newPassword)
      res.json({ message: "Password updated" })
    } catch (err: any) {
      res.status(400).json({ message: err.message || "Failed to change password" })
    }
  }

  static async myPosts(req: Request, res: Response) {
    try {
      const posts = await UsersService.getPostsByUser(req.user!.userId)
      res.json(posts)
    } catch {
      res.status(500).json({ message: "Failed to fetch posts" })
    }
  }

}