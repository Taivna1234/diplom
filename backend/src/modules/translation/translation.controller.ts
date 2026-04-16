import { Request, Response } from "express"
import { TranslationService } from "./translation.service"

const translationService = new TranslationService()

export class TranslationController {

  async translate(req: Request, res: Response) {

    try {
      const { text, targetLang } = req.body

      if (!text) {
        return res.status(400).json({ message: "Text is required" })
      }
      const translated = await translationService.translate(text, targetLang)
      res.json({
        translatedText: translated
      })
    } catch {
      res.status(500).json({ message: "Translation failed" })
    }

  }
}