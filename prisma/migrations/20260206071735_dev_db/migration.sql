/*
  Warnings:

  - You are about to drop the column `profile_img` on the `Blogs` table. All the data in the column will be lost.
  - You are about to alter the column `nickname` on the `Users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - A unique constraint covering the columns `[nickname]` on the table `Users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `Users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Blogs" DROP COLUMN "profile_img";

-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "name" VARCHAR(100) NOT NULL,
ADD COLUMN     "profile_img" VARCHAR(500),
ALTER COLUMN "nickname" SET DATA TYPE VARCHAR(50);

-- CreateIndex
CREATE UNIQUE INDEX "Users_nickname_key" ON "Users"("nickname");
