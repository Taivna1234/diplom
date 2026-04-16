import { Request, Response } from "express";
import { BooksService } from "./books.service";
import { TranslationService } from "../translation/translation.service";
import { ActivityService } from "../activity/activity.service";
const translationService = new TranslationService();

export class BooksController {

  static async search(req: Request, res: Response) {
    try {
      const { q } = req.query;

      if (!q) {
        return res.status(400).json({ message: "Query required" });
      }

      const books = await BooksService.searchBooks(q as string);

      res.json(books);

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to search books" });
    }
  }

  static async getById(req: Request, res: Response) {
    try {

      const { id } = req.params;
      const { lang } = req.query;

      const book = await BooksService.getBookById(id as string);

      if (req.user && book.id) {
      await ActivityService.track(req.user.userId, book.id, "SEARCH");
      }

      if (lang === "mn") {

        if (book.title) {
          book.title = await translationService.translate(book.title, "mn");
        }

        if (book.description) {
          book.description = await translationService.translate(book.description, "mn");
        }

      }

      res.json(book);

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to fetch book" });
    }
  }
}