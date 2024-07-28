/*
  Warnings:

  - Added the required column `clientGroupID` to the `ReplicacheClient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `version` to the `ReplicacheClient` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ReplicacheClient" ADD COLUMN     "clientGroupID" TEXT NOT NULL,
ADD COLUMN     "version" INTEGER NOT NULL;
