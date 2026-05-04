import { PrismaClient } from "@prisma/client"
import { ActivityService } from "../../activity/activity.service"
const prisma = new PrismaClient()

export class LikesService {

  static async likePost(userId: string, postId: string) {

  const post = await prisma.post.findUnique({
    where: { id: postId }
  })

  if (!post) {
    throw new Error("Post not found")
  }

  const like = await prisma.postLike.create({
    data: {
      userId,
      postId
    }
  })

  if (post.bookId) {
    await ActivityService.track(userId, post.bookId, "POST_LIKE")
  }

  return like
}
  static async unlikePost(userId: string, postId: string) {

    return prisma.postLike.delete({
      where: {
        postId_userId: {
          postId,
          userId
        }
      }
    })

  }

  static async getLikes(postId: string) {

    return prisma.postLike.count({
      where: {
        postId
      }
    })

  }

  static async isLiked(userId: string, postId: string) {
    const like = await prisma.postLike.findUnique({
      where: { postId_userId: { postId, userId } }
    })
    return !!like
  }

}