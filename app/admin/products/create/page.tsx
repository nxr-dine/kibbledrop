"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Save, Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

export default function CreateProductPage() {
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    petType: "",
    image: "",
    featured: false,
    // New filtering fields
    brand: "",
    weight: "",
    species: "",
    lifeStage: "",
    productType: "",
    foodType: "",
    // Nutrition Facts
    protein: "Min 28%",
    fat: "Min 15%",
    fiber: "Max 4%",
    moisture: "Max 10%",
    calories: "3,500 kcal/kg",
    omega6: "Min 1.4%",
    // Ingredients
    ingredients:
      "Deboned chicken as the first ingredient, Sweet potatoes and peas for digestible carbohydrates, Chicken meal and salmon meal for added protein, Flaxseed for omega fatty acids, Blueberries and cranberries for antioxidants, No corn, wheat, soy, or artificial preservatives",
  });

  // Weight variants state
  const [weightVariants, setWeightVariants] = useState<Array<{weight: string, price: string, selected: boolean}>>([
    { weight: "300g", price: "", selected: false },
    { weight: "500g", price: "", selected: false },
    { weight: "1kg", price: "", selected: false },
    { weight: "1.5kg", price: "", selected: false },
    { weight: "2kg", price: "", selected: false },
    { weight: "3kg", price: "", selected: false },
    { weight: "5kg", price: "", selected: false },
    { weight: "7kg", price: "", selected: false },
    { weight: "10kg", price: "", selected: false },
    { weight: "15kg", price: "", selected: false },
    { weight: "20kg", price: "", selected: false },
  ]);

  const router = useRouter();
  const { toast } = useToast();

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPEG, PNG, or WebP image.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Upload failed");
      }

      const result = await response.json();

      // Update form data with the uploaded image URL
      setFormData((prev) => ({
        ...prev,
        image: result.url,
      }));

      // Set preview
      setImagePreview(result.url);

      toast({
        title: "Image uploaded successfully",
        description: "Your product image has been uploaded.",
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description:
          error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({
      ...prev,
      image: "",
    }));
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate that at least one weight variant is selected
      const selectedVariants = weightVariants.filter(variant => variant.selected && variant.price);
      if (selectedVariants.length === 0) {
        toast({
          title: "Error",
          description: "Please select at least one weight variant with a price.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          weightVariants: selectedVariants.map(variant => ({
            weight: variant.weight,
            price: parseFloat(variant.price),
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create product");
      }

      const product = await response.json();

      toast({
        title: "Product Created!",
        description: `${product.name} has been added to your catalog with ${selectedVariants.length} weight variant(s).`,
      });

      router.push("/admin/products");
    } catch (error) {
      console.error("Error creating product:", error);
      toast({
        title: "Error",
        description: "Failed to create product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => {
      const newData = {
        ...prev,
        [field]: value,
      };

      // Automatically set species when petType changes
      if (field === "petType" && (value === "Dog" || value === "Cat")) {
        newData.species = value as string;
      }

      return newData;
    });
  };

  // Weight variant handlers
  const handleWeightVariantToggle = (index: number, checked: boolean) => {
    setWeightVariants(prev => prev.map((variant, i) => 
      i === index ? { ...variant, selected: checked } : variant
    ));
  };

  const handleWeightVariantPriceChange = (index: number, price: string) => {
    setWeightVariants(prev => prev.map((variant, i) => 
      i === index ? { ...variant, price } : variant
    ));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/products">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Create New Product
          </h1>
          <p className="text-gray-600 mt-2">
            Add a new product to your catalog
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
          <CardDescription>
            Fill in the details for your new product
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="e.g., Premium Dog Food - Chicken & Rice"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => handleInputChange("price", e.target.value)}
                  placeholder="29.99"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Describe the product, its benefits, and ingredients..."
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    handleInputChange("category", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Food">Food</SelectItem>
                    <SelectItem value="Treats">Treats</SelectItem>
                    <SelectItem value="Accessories">Accessories</SelectItem>
                    <SelectItem value="Supplements">Supplements</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="petType">Pet Type *</Label>
                <Select
                  value={formData.petType}
                  onValueChange={(value) => handleInputChange("petType", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select pet type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dog">Dog</SelectItem>
                    <SelectItem value="Cat">Cat</SelectItem>
                    <SelectItem value="Both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Product Image</Label>

              {imagePreview ? (
                <div className="space-y-4">
                  <div className="relative w-full max-w-sm">
                    <Image
                      src={imagePreview}
                      alt="Product preview"
                      width={300}
                      height={300}
                      className="rounded-lg border object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={handleRemoveImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Change Image
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-sm text-gray-600 mb-4">
                      Click to upload product image or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 mb-4">
                      JPEG, PNG, or WebP (max 5MB)
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {uploadingImage ? "Uploading..." : "Choose Image"}
                    </Button>
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileUpload}
                className="hidden"
              />

              <p className="text-sm text-gray-600">
                Upload a high-quality image of your product. Leave empty to use
                a placeholder image.
              </p>
            </div>

            {/* Additional Product Information */}
            <div className="space-y-4">
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Product Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="brand">Brand</Label>
                    <Select
                      value={formData.brand}
                      onValueChange={(value) =>
                        handleInputChange("brand", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select brand" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Royal Canin">Royal Canin</SelectItem>
                        <SelectItem value="Hill's">Hill's</SelectItem>
                        <SelectItem value="Purina">Purina</SelectItem>
                        <SelectItem value="Blue Buffalo">
                          Blue Buffalo
                        </SelectItem>
                        <SelectItem value="Orijen">Orijen</SelectItem>
                        <SelectItem value="Acana">Acana</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="foodType">Food Type</Label>
                    <Select
                      value={formData.foodType}
                      onValueChange={(value) =>
                        handleInputChange("foodType", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select food type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dry">Dry</SelectItem>
                        <SelectItem value="wet">Wet</SelectItem>
                        <SelectItem value="raw">Raw</SelectItem>
                        <SelectItem value="freeze-dried">Freeze-Dried</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4 md:col-span-2">
                    <Label>Weight Variants</Label>
                    <p className="text-sm text-gray-600">
                      Select the weight options you want to offer for this product and set their prices.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto border rounded-lg p-4">
                      {weightVariants.map((variant, index) => (
                        <div key={variant.weight} className="flex items-center space-x-3 p-3 border rounded-lg">
                          <Checkbox
                            id={`weight-${index}`}
                            checked={variant.selected}
                            onCheckedChange={(checked) => 
                              handleWeightVariantToggle(index, checked as boolean)
                            }
                          />
                          <Label htmlFor={`weight-${index}`} className="flex-shrink-0 min-w-[60px]">
                            {variant.weight}
                          </Label>
                          <Input
                            type="number"
                            placeholder="Price"
                            value={variant.price}
                            onChange={(e) => handleWeightVariantPriceChange(index, e.target.value)}
                            disabled={!variant.selected}
                            className="flex-1"
                            step="0.01"
                            min="0"
                          />
                        </div>
                      ))}
                    </div>
                    <div className="text-sm text-gray-500">
                      Selected variants: {weightVariants.filter(v => v.selected).length}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lifeStage">Life Stage</Label>
                    <Select
                      value={formData.lifeStage}
                      onValueChange={(value) =>
                        handleInputChange("lifeStage", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select life stage" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kitten">Kitten</SelectItem>
                        <SelectItem value="puppy">Puppy</SelectItem>
                        <SelectItem value="adult">Adult</SelectItem>
                        <SelectItem value="senior">Senior</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="productType">Product Type</Label>
                    <Select
                      value={formData.productType}
                      onValueChange={(value) =>
                        handleInputChange("productType", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select product type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cat Treat">Cat Treat</SelectItem>
                        <SelectItem value="Dog Treat">Dog Treat</SelectItem>
                        <SelectItem value="Dry Cat Food">
                          Dry Cat Food
                        </SelectItem>
                        <SelectItem value="Dry Dog Food">
                          Dry Dog Food
                        </SelectItem>
                        <SelectItem value="Wet Cat Food">
                          Wet Cat Food
                        </SelectItem>
                        <SelectItem value="Wet Dog Food">
                          Wet Dog Food
                        </SelectItem>
                        <SelectItem value="Hygiene">Hygiene</SelectItem>
                        <SelectItem value="Litter">Litter</SelectItem>
                        <SelectItem value="Tick & Flea Cats">
                          Tick & Flea Cats
                        </SelectItem>
                        <SelectItem value="Tick & Flea Dogs">
                          Tick & Flea Dogs
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Nutrition Facts Section */}
            <div className="space-y-4">
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Nutrition Facts</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="protein">Protein</Label>
                    <Input
                      id="protein"
                      value={formData.protein}
                      onChange={(e) =>
                        handleInputChange("protein", e.target.value)
                      }
                      placeholder="e.g., Min 28%"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fat">Fat</Label>
                    <Input
                      id="fat"
                      value={formData.fat}
                      onChange={(e) => handleInputChange("fat", e.target.value)}
                      placeholder="e.g., Min 15%"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fiber">Fiber</Label>
                    <Input
                      id="fiber"
                      value={formData.fiber}
                      onChange={(e) =>
                        handleInputChange("fiber", e.target.value)
                      }
                      placeholder="e.g., Max 4%"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="moisture">Moisture</Label>
                    <Input
                      id="moisture"
                      value={formData.moisture}
                      onChange={(e) =>
                        handleInputChange("moisture", e.target.value)
                      }
                      placeholder="e.g., Max 10%"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="calories">Calories</Label>
                    <Input
                      id="calories"
                      value={formData.calories}
                      onChange={(e) =>
                        handleInputChange("calories", e.target.value)
                      }
                      placeholder="e.g., 3,500 kcal/kg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="omega6">Omega-6</Label>
                    <Input
                      id="omega6"
                      value={formData.omega6}
                      onChange={(e) =>
                        handleInputChange("omega6", e.target.value)
                      }
                      placeholder="e.g., Min 1.4%"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Ingredients Section */}
            <div className="space-y-4">
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Ingredients</h3>
                <div className="space-y-2">
                  <Label htmlFor="ingredients">Ingredients List</Label>
                  <Textarea
                    id="ingredients"
                    value={formData.ingredients}
                    onChange={(e) =>
                      handleInputChange("ingredients", e.target.value)
                    }
                    placeholder="List all ingredients separated by commas..."
                    rows={4}
                  />
                  <p className="text-sm text-gray-600">
                    List ingredients in order of weight, separated by commas.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 border-t pt-6">
              <Switch
                id="featured"
                checked={formData.featured}
                onCheckedChange={(checked) =>
                  handleInputChange("featured", checked)
                }
              />
              <Label htmlFor="featured">Featured Product</Label>
            </div>

            <div className="flex gap-4 pt-6">
              <Button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {loading ? "Creating..." : "Create Product"}
              </Button>
              <Button asChild variant="outline" type="button">
                <Link href="/admin/products">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
