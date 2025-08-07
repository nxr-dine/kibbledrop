// Test script to create a product with weight variants
const testProduct = {
  name: "Premium Dog Food Test",
  description: "High-quality dog food with multiple weight options",
  price: 29.99, // Base price
  category: "Food",
  petType: "Dog",
  image: "",
  featured: false,
  brand: "Test Brand",
  weight: "Various", // Legacy field
  species: "Dog",
  lifeStage: "adult",
  productType: "Dry Dog Food",
  foodType: "dry",
  protein: "Min 28%",
  fat: "Min 15%",
  fiber: "Max 4%",
  moisture: "Max 10%",
  calories: "3,500 kcal/kg",
  omega6: "Min 1.4%",
  ingredients: "Premium chicken, sweet potatoes, peas",
  weightVariants: [
    { weight: "2kg", price: 29.99 },
    { weight: "5kg", price: 65.99 },
    { weight: "10kg", price: 119.99 },
    { weight: "15kg", price: 169.99 },
  ],
};

async function createTestProduct() {
  try {
    const response = await fetch("http://localhost:3000/api/admin/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testProduct),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Failed to create product:", error);
      return;
    }

    const product = await response.json();
    console.log("Product created successfully:", product);
  } catch (error) {
    console.error("Error:", error);
  }
}

createTestProduct();
