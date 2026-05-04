import { Request, Response, NextFunction } from "express"
import { ZodSchema, ZodError } from "zod"

export function validate(schema: ZodSchema, source: "body" | "query" | "params" = "body") {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source])
    if (!result.success) {
      const errors = result.error.issues.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }))
      return res.status(400).json({ message: "Оруулсан мэдээлэл буруу байна", errors })
    }
    Object.defineProperty(req, source, { value: result.data, writable: true, configurable: true })
    next()
  }
}
