-- Bring deployed databases in line with the current Prisma schema.
-- These statements are intentionally tolerant because older local/dev
-- databases may already have some of these columns from prisma db push.

ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "resetToken" TEXT,
  ADD COLUMN IF NOT EXISTS "resetTokenExpiry" TIMESTAMP(3);

ALTER TABLE "Book"
  ADD COLUMN IF NOT EXISTS "detailFetched" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "Listing"
  ADD COLUMN IF NOT EXISTS "photoBase64" TEXT;

CREATE TABLE IF NOT EXISTS "UserLibrary" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "bookId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "UserLibrary_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "UserLibrary_userId_bookId_key"
  ON "UserLibrary"("userId", "bookId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'UserLibrary_userId_fkey'
  ) THEN
    ALTER TABLE "UserLibrary"
      ADD CONSTRAINT "UserLibrary_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'UserLibrary_bookId_fkey'
  ) THEN
    ALTER TABLE "UserLibrary"
      ADD CONSTRAINT "UserLibrary_bookId_fkey"
      FOREIGN KEY ("bookId") REFERENCES "Book"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
