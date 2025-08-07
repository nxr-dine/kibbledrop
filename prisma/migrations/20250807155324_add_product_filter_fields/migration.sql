-- AlterTable
ALTER TABLE "public"."Product" ADD COLUMN     "brand" TEXT,
ADD COLUMN     "calories" TEXT DEFAULT '3,500 kcal/kg',
ADD COLUMN     "fat" TEXT DEFAULT 'Min 15%',
ADD COLUMN     "fiber" TEXT DEFAULT 'Max 4%',
ADD COLUMN     "foodType" TEXT,
ADD COLUMN     "ingredients" TEXT DEFAULT 'Deboned chicken as the first ingredient, Sweet potatoes and peas for digestible carbohydrates, Chicken meal and salmon meal for added protein, Flaxseed for omega fatty acids, Blueberries and cranberries for antioxidants, No corn, wheat, soy, or artificial preservatives',
ADD COLUMN     "lifeStage" TEXT,
ADD COLUMN     "moisture" TEXT DEFAULT 'Max 10%',
ADD COLUMN     "omega6" TEXT DEFAULT 'Min 1.4%',
ADD COLUMN     "productType" TEXT,
ADD COLUMN     "protein" TEXT DEFAULT 'Min 28%',
ADD COLUMN     "species" TEXT,
ADD COLUMN     "weight" TEXT;
