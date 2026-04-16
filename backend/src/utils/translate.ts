import axios from "axios"

export async function translateToMongolian(text: string) {

  const response = await axios.post(
    "https://translation.googleapis.com/language/translate/v2",
    {
      q: text,
      target: "mn",
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