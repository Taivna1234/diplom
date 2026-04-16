import axios from "axios"

export class TranslationService {

  async translate(text: string, targetLang: string = "mn") {

    const response = await axios.post(
      "https://translation.googleapis.com/language/translate/v2",
      {
        q: text,
        target: targetLang,
        format: "text"
      },
      {
        params: {
          key: process.env.GOOGLE_BOOKS_API_KEY
        }
      }
    )
    return response.data.data.translations[0].translatedText
  }

}