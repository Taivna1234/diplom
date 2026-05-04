import { Request, Response } from "express"
import { LibraryService } from "./library.service"

export class LibraryController {

  static async add(req: Request, res: Response) {
    try {
      const bookId = String(req.params.bookId)
      await LibraryService.addBook(req.user!.userId, bookId)
      res.json({ saved: true })
    } catch (err: any) {
      res.status(400).json({ message: err.message })
    }
  }

  static async remove(req: Request, res: Response) {
    try {
      const bookId = String(req.params.bookId)
      await LibraryService.removeBook(req.user!.userId, bookId)
      res.json({ saved: false })
    } catch {
      res.status(500).json({ message: "Failed to remove" })
    }
  }

  static async status(req: Request, res: Response) {
    try {
      const bookId = String(req.params.bookId)
      const saved = await LibraryService.isInLibrary(req.user!.userId, bookId)
      res.json({ saved })
    } catch {
      res.status(500).json({ message: "Failed to check status" })
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const books = await LibraryService.getUserLibrary(req.user!.userId)
      res.json(books)
    } catch {
      res.status(500).json({ message: "Failed to fetch library" })
    }
  }

}
