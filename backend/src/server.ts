import { createServer } from "http"
import app from "./app"
import { initSocket } from "./utils/socket"
import dotenv from "dotenv"

dotenv.config()

const PORT = process.env.PORT || 5000

const httpServer = createServer(app)

initSocket(httpServer)

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
