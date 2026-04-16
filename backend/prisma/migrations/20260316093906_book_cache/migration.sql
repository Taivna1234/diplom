/*
  Warnings:

  - A unique constraint covering the columns `[externalId]` on the table `Book` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Book_externalId_key" ON "Book"("externalId");
