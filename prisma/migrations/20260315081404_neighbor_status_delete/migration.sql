/*
  Warnings:

  - You are about to drop the column `status` on the `Neighbors` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "idx_status_neighbors";

-- AlterTable
ALTER TABLE "Neighbors" DROP COLUMN "status";

-- DropEnum
DROP TYPE "NeighborStatus";
