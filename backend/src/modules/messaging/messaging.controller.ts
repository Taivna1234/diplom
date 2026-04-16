import { Request, Response } from "express"
import { MessagingService } from "./messaging.service"

export class MessagingController {

  static async start(req: Request, res: Response) {

    try {

      const userId = (req as any).user.userId
      const { otherUserId, listingId } = req.body

      const conversation = await MessagingService.startConversation(
        userId,
        otherUserId,
        listingId
      )

      res.json(conversation)

    } catch (error) {
      console.error(error)
      res.status(500).json({ message: "Failed to start conversation" })
    }
  }

  static async send(req: Request, res: Response) {

    try {

      const userId = (req as any).user.userId
      const { conversationId, content } = req.body

      const message = await MessagingService.sendMessage(
        userId,
        conversationId,
        content
      )

      res.json(message)

    } catch (error) {
      console.error(error)
      res.status(500).json({ message: "Failed to send message" })
    }
  }

  static async getMessages(req: Request, res: Response) {

    try {

      const { conversationId } = req.params

      const messages = await MessagingService.getMessages(conversationId as string)

      res.json(messages)

    } catch (error) {
      console.error(error)
      res.status(500).json({ message: "Failed to fetch messages" })
    }
  }

  static async getUserConversations(req: Request, res: Response) {

    try {

      const userId = (req as any).user.userId

      const conversations = await MessagingService.getUserConversations(userId)

      res.json(conversations)

    } catch (error) {
      console.error(error)
      res.status(500).json({ message: "Failed to fetch conversations" })
    }
  }

}