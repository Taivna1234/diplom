import { PrismaClient, ActivityType } from "@prisma/client"

const prisma = new PrismaClient()

export class ActivityService {

  static async track(
    userId: string,
    bookId: string,
    actionType: ActivityType
  ) {

    try {

      await prisma.userBookActivity.create({
        data: {
          userId,
          bookId,
          actionType
        }
      })

    } catch (err) {
      console.error("Activity tracking failed", err)
    }

  }

}