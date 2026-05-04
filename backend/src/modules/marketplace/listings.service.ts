import { PrismaClient } from "@prisma/client"
import { ActivityService } from "../activity/activity.service"
const prisma = new PrismaClient()

export class ListingsService {

  static async createListing(
    userId: string,
    bookTitle: string,
    type: "SELL" | "RENT" | "EXCHANGE",
    price: number | null,
    condition: string,
    location: string,
    rentDurationDays?: number,
    photoBase64?: string,
    bookExternalId?: string
  ) {

    let book
    if (bookExternalId) {
      book = await prisma.book.findUnique({ where: { externalId: bookExternalId } })
    }
    if (!book) {
      book = await prisma.book.create({
        data: { title: bookTitle, language: "unknown" }
      })
    }

    const listing = await prisma.listing.create({
      data: {
        userId,
        bookId: book.id,
        type,
        price,
        condition,
        location,
        rentDurationDays: rentDurationDays || null,
        photoBase64: photoBase64 || null
      }
    })
    await ActivityService.track(userId, book.id, "LISTING_CREATE")

    return listing
  }

  static async getListings() {

    return prisma.listing.findMany({
      where: {
        status: "ACTIVE"
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true
          }
        },
        book: {
          select: {
            externalId: true,
            title: true,
            thumbnailUrl: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })
  }

  static async getListingsByBook(bookExternalId: string) {

    const book = await prisma.book.findUnique({
      where: {
        externalId: bookExternalId
      }
    })

    if (!book) return []

    return prisma.listing.findMany({
      where: {
        bookId: book.id,
        status: "ACTIVE"
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true
          }
        },
        book: {
          select: {
            externalId: true,
            title: true,
            thumbnailUrl: true
          }
        }
      }
    })
  }

  static async closeListing(userId: string, listingId: string) {

    return prisma.listing.update({
      where: {
        id: listingId
      },
      data: {
        status: "CLOSED"
      }
    })
  }

}
