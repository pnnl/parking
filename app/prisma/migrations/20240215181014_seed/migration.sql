-- CreateTable
CREATE TABLE "Seed" (
    "filename" VARCHAR(1024) NOT NULL,
    "timestamp" TIMESTAMPTZ(6) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Seed_filename_key" ON "Seed"("filename");
