"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Filter } from "lucide-react";

interface ProductFilterProps {
  filters: {
    category?: string;
    petType?: string;
    brand?: string;
    weight?: string;
    species?: string;
    lifeStage?: string;
    productType?: string;
    foodType?: string;
  };
  onFiltersChange: (filters: any) => void;
}

export function ProductFilter({
  filters,
  onFiltersChange,
}: ProductFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "Food", label: "Food" },
    { value: "Treats", label: "Treats" },
    { value: "Accessories", label: "Accessories" },
    { value: "Hygiene", label: "Hygiene" },
    { value: "Tick & Flea", label: "Tick & Flea" },
    { value: "Litter", label: "Litter" },
  ];

  const species = [
    { value: "all", label: "All Species" },
    { value: "Dog", label: "Dog" },
    { value: "Cat", label: "Cat" },
  ];

  const brands = [
    { value: "all", label: "All Brands" },
    { value: "Royal Canin", label: "Royal Canin" },
    { value: "Hill's", label: "Hill's" },
    { value: "Purina", label: "Purina" },
    { value: "Blue Buffalo", label: "Blue Buffalo" },
    { value: "Orijen", label: "Orijen" },
    { value: "Acana", label: "Acana" },
  ];

  const weights = [
    { value: "all", label: "All Weights" },
    { value: "0-500g", label: "0-500g" },
    { value: "500g-1kg", label: "500g-1kg" },
    { value: "1-2kg", label: "1-2kg" },
    { value: "2-5kg", label: "2-5kg" },
    { value: "5kg+", label: "5kg+" },
  ];

  const lifeStages = [
    { value: "all", label: "All Life Stages" },
    { value: "kitten", label: "Kitten" },
    { value: "puppy", label: "Puppy" },
    { value: "adult", label: "Adult" },
    { value: "senior", label: "Senior" },
  ];

  const productTypes = [
    { value: "all", label: "All Product Types" },
    { value: "Cat Treat", label: "Cat Treat" },
    { value: "Dog Treat", label: "Dog Treat" },
    { value: "Dry Cat Food", label: "Dry Cat Food" },
    { value: "Dry Dog Food", label: "Dry Dog Food" },
    { value: "Wet Cat Food", label: "Wet Cat Food" },
    { value: "Wet Dog Food", label: "Wet Dog Food" },
    { value: "Hygiene", label: "Hygiene" },
    { value: "Litter", label: "Litter" },
    { value: "Tick & Flea Cats", label: "Tick & Flea Cats" },
    { value: "Tick & Flea Dogs", label: "Tick & Flea Dogs" },
  ];

  const foodTypes = [
    { value: "all", label: "All Food Types" },
    { value: "dry", label: "Dry" },
    { value: "wet", label: "Wet" },
  ];

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters };
    if (value === "all") {
      delete newFilters[key as keyof typeof filters];
    } else {
      newFilters[key as keyof typeof filters] = value;
    }
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                className="flex items-center gap-1"
              >
                <X className="h-4 w-4" />
                Clear All
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? "Less" : "More"} Filters
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Basic Filters - Always Visible */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Category</label>
            <Select
              value={filters.category || "all"}
              onValueChange={(value) => handleFilterChange("category", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Species</label>
            <Select
              value={filters.species || "all"}
              onValueChange={(value) => handleFilterChange("species", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select species" />
              </SelectTrigger>
              <SelectContent>
                {species.map((specie) => (
                  <SelectItem key={specie.value} value={specie.value}>
                    {specie.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Product Type
            </label>
            <Select
              value={filters.productType || "all"}
              onValueChange={(value) =>
                handleFilterChange("productType", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select product type" />
              </SelectTrigger>
              <SelectContent>
                {productTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Life Stage</label>
            <Select
              value={filters.lifeStage || "all"}
              onValueChange={(value) => handleFilterChange("lifeStage", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select life stage" />
              </SelectTrigger>
              <SelectContent>
                {lifeStages.map((stage) => (
                  <SelectItem key={stage.value} value={stage.value}>
                    {stage.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Advanced Filters - Expandable */}
        {isExpanded && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t">
            <div>
              <label className="text-sm font-medium mb-2 block">Brand</label>
              <Select
                value={filters.brand || "all"}
                onValueChange={(value) => handleFilterChange("brand", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select brand" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((brand) => (
                    <SelectItem key={brand.value} value={brand.value}>
                      {brand.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Weight</label>
              <Select
                value={filters.weight || "all"}
                onValueChange={(value) => handleFilterChange("weight", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select weight" />
                </SelectTrigger>
                <SelectContent>
                  {weights.map((weight) => (
                    <SelectItem key={weight.value} value={weight.value}>
                      {weight.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Food Type
              </label>
              <Select
                value={filters.foodType || "all"}
                onValueChange={(value) => handleFilterChange("foodType", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select food type" />
                </SelectTrigger>
                <SelectContent>
                  {foodTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 pt-4 border-t">
            <span className="text-sm font-medium">Active filters:</span>
            {Object.entries(filters).map(([key, value]) => (
              <Button
                key={key}
                variant="secondary"
                size="sm"
                onClick={() => handleFilterChange(key, "all")}
                className="flex items-center gap-1 text-xs"
              >
                {key}: {value}
                <X className="h-3 w-3" />
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
