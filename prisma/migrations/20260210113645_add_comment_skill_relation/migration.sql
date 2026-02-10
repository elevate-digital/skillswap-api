/*
  Warnings:

  - Added the required column `skill_id` to the `comments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `comments` ADD COLUMN `skill_id` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `comments` ADD CONSTRAINT `comments_skill_id_fkey` FOREIGN KEY (`skill_id`) REFERENCES `skills`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
