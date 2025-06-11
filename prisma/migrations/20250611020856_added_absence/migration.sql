/*
  Warnings:

  - You are about to drop the column `description` on the `schedule` table. All the data in the column will be lost.
  - You are about to drop the column `finish` on the `schedule` table. All the data in the column will be lost.
  - You are about to drop the column `start` on the `schedule` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `ship` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[token]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `staffId` to the `schedule` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "user" ADD COLUMN "token" TEXT;

-- CreateTable
CREATE TABLE "Absence" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reason" TEXT,
    "date" DATETIME NOT NULL,
    "scheduleId" TEXT NOT NULL,
    CONSTRAINT "Absence_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "schedule" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_schedule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "embark" TEXT NOT NULL,
    "desembark" TEXT NOT NULL,
    "shipId" TEXT,
    "staffId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "schedule_shipId_fkey" FOREIGN KEY ("shipId") REFERENCES "ship" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "schedule_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "staff" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_schedule" ("createdAt", "desembark", "embark", "id", "shipId", "updatedAt") SELECT "createdAt", "desembark", "embark", "id", "shipId", "updatedAt" FROM "schedule";
DROP TABLE "schedule";
ALTER TABLE "new_schedule" RENAME TO "schedule";
CREATE TABLE "new_ship" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);
INSERT INTO "new_ship" ("id", "name") SELECT "id", "name" FROM "ship";
DROP TABLE "ship";
ALTER TABLE "new_ship" RENAME TO "ship";
CREATE UNIQUE INDEX "ship_name_key" ON "ship"("name");
CREATE TABLE "new_staff" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "role" TEXT NOT NULL,
    "salary" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "shipId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "staff_shipId_fkey" FOREIGN KEY ("shipId") REFERENCES "ship" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_staff" ("code", "createdAt", "email", "firstName", "id", "isActive", "lastName", "phone", "role", "salary", "shipId", "updatedAt") SELECT "code", "createdAt", "email", "firstName", "id", "isActive", "lastName", "phone", "role", "salary", "shipId", "updatedAt" FROM "staff";
DROP TABLE "staff";
ALTER TABLE "new_staff" RENAME TO "staff";
CREATE UNIQUE INDEX "staff_code_key" ON "staff"("code");
CREATE UNIQUE INDEX "staff_code_email_key" ON "staff"("code", "email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "user_token_key" ON "user"("token");
