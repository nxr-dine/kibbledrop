-- AlterTable
ALTER TABLE "public"."PetProfile" ADD COLUMN     "vaccineCardUrl" TEXT;

-- AlterTable
ALTER TABLE "public"."Subscription" ADD COLUMN     "petProfileId" TEXT;

-- CreateTable
CREATE TABLE "public"."Trade" (
    "id" TEXT NOT NULL,
    "tradeId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'CREATED',
    "buyerEmail" TEXT NOT NULL,
    "sellerEmail" TEXT NOT NULL,
    "amount" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'ZAR',
    "title" TEXT,
    "reference" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Trade_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Trade_tradeId_key" ON "public"."Trade"("tradeId");

-- CreateIndex
CREATE INDEX "Trade_tradeId_idx" ON "public"."Trade"("tradeId");

-- CreateIndex
CREATE INDEX "Trade_status_idx" ON "public"."Trade"("status");

-- AddForeignKey
ALTER TABLE "public"."Subscription" ADD CONSTRAINT "Subscription_petProfileId_fkey" FOREIGN KEY ("petProfileId") REFERENCES "public"."PetProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
