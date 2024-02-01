-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "enum_log" ADD VALUE 'Trace';
ALTER TYPE "enum_log" ADD VALUE 'Debug';
ALTER TYPE "enum_log" ADD VALUE 'Fatal';

-- CreateTable
CREATE TABLE "Occupancy" (
    "objectId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "blockId" TEXT,
    "blockfaceId" TEXT,
    "cvlzId" TEXT NOT NULL,
    "occupancy" INTEGER NOT NULL,
    "sensors" TEXT,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Occupancy_pkey" PRIMARY KEY ("objectId")
);

-- CreateTable
CREATE TABLE "Prediction" (
    "objectId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "blockId" TEXT,
    "blockfaceId" TEXT,
    "cvlzId" TEXT NOT NULL,
    "maxOccupancy" INTEGER NOT NULL,
    "minOccupancy" INTEGER NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "probability" DOUBLE PRECISION NOT NULL,
    "sensors" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Prediction_pkey" PRIMARY KEY ("objectId")
);

-- CreateTable
CREATE TABLE "Space" (
    "objectId" TEXT NOT NULL,
    "label" TEXT,
    "blockId" TEXT,
    "blockfaceId" TEXT,
    "cvlzId" TEXT,
    "cvcpct" TEXT,
    "rowNbr" TEXT,
    "blockStart" DOUBLE PRECISION,
    "blockEnd" DOUBLE PRECISION,
    "widthOffset" DOUBLE PRECISION,
    "geoBasys" TEXT,
    "spaceLength" INTEGER,
    "spaceType" TEXT,
    "spaceTyped" TEXT,
    "timeLimit" TEXT,
    "spaceNb" TEXT,
    "category" TEXT,
    "side" TEXT,
    "currentSt" TEXT,
    "elementKey" INTEGER,
    "shapeLength" DOUBLE PRECISION,
    "geometry" geometry,
    "geojson" JSONB NOT NULL,
    "occupancy" INTEGER,
    "sensors" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Space_pkey" PRIMARY KEY ("objectId")
);

-- CreateIndex
CREATE INDEX "occupancy_cvlzId" ON "Occupancy"("cvlzId");

-- CreateIndex
CREATE INDEX "occupancy_objectId_cvlzId" ON "Occupancy"("objectId", "cvlzId");

-- CreateIndex
CREATE INDEX "occupancy_objectId_cvlzId_date_time" ON "Occupancy"("objectId", "cvlzId", "date", "time");

-- CreateIndex
CREATE INDEX "prediction_cvlzId" ON "Prediction"("cvlzId");

-- CreateIndex
CREATE INDEX "prediction_objectId_cvlzId" ON "Prediction"("objectId", "cvlzId");

-- CreateIndex
CREATE INDEX "prediction_objectId_cvlzId_date_time" ON "Prediction"("objectId", "cvlzId", "date", "time");

-- CreateIndex
CREATE INDEX "space_cvlzId" ON "Space"("cvlzId");

-- CreateIndex
CREATE INDEX "space_category_cvlzId" ON "Space"("category", "cvlzId");

-- CreateIndex
CREATE INDEX "space_spaceType" ON "Space"("spaceType");

-- CreateIndex
CREATE INDEX "space_spaceTyped" ON "Space"("spaceTyped");

-- CreateIndex
CREATE INDEX "space_spaceType_spaceTyped" ON "Space"("spaceType", "spaceTyped");

-- CreateIndex
CREATE INDEX "space_geometry" ON "Space"("geometry");
