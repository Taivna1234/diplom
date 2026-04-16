import { Router } from "express"
import { LibraryController } from "./library.controller"
import { authMiddleware } from "../../middleware/auth.middleware"

const router = Router()

router.get("/", authMiddleware, LibraryController.getAll)
router.get("/:bookId/status", authMiddleware, LibraryController.status)
router.post("/:bookId", authMiddleware, LibraryController.add)
router.delete("/:bookId", authMiddleware, LibraryController.remove)

export default router
