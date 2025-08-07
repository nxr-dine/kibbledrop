-- CreateTable
CREATE TABLE "public"."ProductWeightVariant" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "weight" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "inStock" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductWeightVariant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductWeightVariant_productId_weight_key" ON "public"."ProductWeightVariant"("productId", "weight");

-- AddForeignKey
ALTER TABLE "public"."ProductWeightVariant" ADD CONSTRAINT "ProductWeightVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
