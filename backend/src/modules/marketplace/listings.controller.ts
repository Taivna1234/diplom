import { Request, Response } from "express"
import { ListingsService } from "./listings.service"

export class ListingsController {

  static async create(req: Request, res: Response) {

    try {

      const userId = (req as any).user.userId

      const {
        bookTitle,
        type,
        price,
        condition,
        location,
        rentDurationDays,
        photoBase64,
        bookExternalId,
      } = req.body

      const listing = await ListingsService.createListing(
        userId,
        bookTitle,
        type,
        price || null,
        condition,
        location,
        rentDurationDays,
        photoBase64,
        bookExternalId
      )

      res.status(201).json(listing)

    } catch (error) {
      console.error(error)
      res.status(500).json({ message: "Failed to create listing" })
    }

  }

  static async getAll(req: Request, res: Response) {

    try {

      const listings = await ListingsService.getListings()

      res.json(listings)

    } catch (error) {
      console.error(error)
      res.status(500).json({ message: "Failed to fetch listings" })
    }

  }

  static async getByBook(req: Request, res: Response) {

    try {

      const { bookId } = req.params

      const listings = await ListingsService.getListingsByBook(bookId as string)

      res.json(listings)

    } catch (error) {
      console.error(error)
      res.status(500).json({ message: "Failed to fetch listings" })
    }

  }

  static async close(req: Request, res: Response) {

    try {

      const userId = (req as any).user.userId
      const { id } = req.params

      const listing = await ListingsService.closeListing(userId, id as string)

      res.json(listing)

    } catch (error) {
      console.error(error)
      res.status(500).json({ message: "Failed to close listing" })
    }

  }

}