"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import { Camera, Upload, X, AlertTriangle, Loader2 } from "lucide-react";

interface PetProfile {
  id: string;
  userId: string;
  name: string;
  type: string;
  breed: string;
  birthday?: string | null;
  weight: number;
  image?: string;
  vaccineCardUrl?: string | null;
  healthTags: string[];
  activityLevel?: number | null;
  feedFrequencyPerDay?: number | null;
  createdAt: string;
  updatedAt: string;
}

export default function PetProfilePage() {
  const [petProfiles, setPetProfiles] = useState<PetProfile[]>([]);
  const [editingPet, setEditingPet] = useState<PetProfile | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [vaccineCardFile, setVaccineCardFile] = useState<File | null>(null);
  const [petToDelete, setPetToDelete] = useState<PetProfile | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formValues, setFormValues] = useState({
    type: "dog",
    activityLevel: "",
    feedFrequencyPerDay: "",
  });
  const { toast } = useToast();

  // Fetch pet profiles on component mount
  useEffect(() => {
    fetchPetProfiles();
  }, []);

  const fetchPetProfiles = async () => {
    try {
      const response = await fetch("/api/pets");
      if (response.ok) {
        const data = await response.json();
        setPetProfiles(data);
      }
    } catch (error) {
      console.error("Error fetching pet profiles:", error);
      toast({
        title: "Error",
        description: "Failed to load pet profiles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (birthday: string | null | undefined) => {
    if (!birthday) return "Unknown";
    const birthDate = new Date(birthday);
    const today = new Date();
    const ageInMs = today.getTime() - birthDate.getTime();
    const ageInYears = ageInMs / (1000 * 60 * 60 * 24 * 365.25);
    return Math.floor(ageInYears);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVaccineCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVaccineCardFile(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData(e.currentTarget as HTMLFormElement);

    const petData = {
      name: formData.get("name") as string,
      type: formValues.type,
      breed: formData.get("breed") as string,
      birthday: formData.get("birthday") as string,
      weight: Number.parseFloat(formData.get("weight") as string),
      healthTags: (formData.get("healthNotes") as string)
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag),
      activityLevel: formValues.activityLevel
        ? parseInt(formValues.activityLevel)
        : null,
      feedFrequencyPerDay: formValues.feedFrequencyPerDay
        ? parseInt(formValues.feedFrequencyPerDay)
        : null,
    };

    // Create a new FormData for file upload
    const uploadData = new FormData();
    uploadData.append("name", petData.name);
    uploadData.append("type", petData.type);
    uploadData.append("breed", petData.breed);
    uploadData.append("birthday", petData.birthday);
    uploadData.append("weight", petData.weight.toString());
    uploadData.append("healthTags", JSON.stringify(petData.healthTags));
    if (petData.activityLevel) {
      uploadData.append("activityLevel", petData.activityLevel.toString());
    }
    if (petData.feedFrequencyPerDay) {
      uploadData.append(
        "feedFrequencyPerDay",
        petData.feedFrequencyPerDay.toString()
      );
    }

    if (selectedImage) {
      uploadData.append("image", selectedImage);
    }
    if (vaccineCardFile) {
      uploadData.append("vaccineCard", vaccineCardFile);
    }

    try {
      if (editingPet) {
        // Update existing pet
        const response = await fetch(`/api/pets/${editingPet.id}`, {
          method: "PUT",
          body: uploadData,
        });

        if (response.ok) {
          await fetchPetProfiles(); // Refresh the list
          toast({
            title: "Success!",
            description: "Pet profile updated successfully.",
          });
          setShowForm(false);
          setEditingPet(null);
          setSelectedImage(null);
          setImagePreview("");
          setVaccineCardFile(null);
        } else {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to update pet profile");
        }
      } else {
        // Create new pet
        const response = await fetch("/api/pets", {
          method: "POST",
          body: uploadData,
        });

        if (response.ok) {
          await fetchPetProfiles(); // Refresh the list
          toast({
            title: "Success!",
            description: "New pet profile created successfully.",
          });
          setShowForm(false);
          setEditingPet(null);
          setSelectedImage(null);
          setImagePreview("");
          setVaccineCardFile(null);
        } else {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to create pet profile");
        }
      }
    } catch (error) {
      console.error("Error saving pet profile:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to save pet profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingPet(null);
    setSelectedImage(null);
    setImagePreview("");
    setFormValues({
      type: "dog",
      activityLevel: "",
      feedFrequencyPerDay: "",
    });
  };

  const handleEdit = (pet: PetProfile) => {
    setEditingPet(pet);
    setImagePreview(pet.image || "");
    setFormValues({
      type: pet.type || "dog",
      activityLevel: pet.activityLevel?.toString() || "",
      feedFrequencyPerDay: pet.feedFrequencyPerDay?.toString() || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (pet: PetProfile) => {
    setPetToDelete(pet);
  };

  const confirmDelete = async () => {
    if (!petToDelete) return;

    setDeleting(true);
    const petName = petToDelete.name;

    try {
      const response = await fetch(`/api/pets/${petToDelete.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Optimistically update the list
        setPetProfiles((prev) =>
          prev.filter((pet) => pet.id !== petToDelete.id)
        );
        setPetToDelete(null);
        toast({
          title: "Pet profile deleted",
          description: `${petName}'s profile has been permanently removed.`,
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to delete pet profile");
      }
    } catch (error) {
      console.error("Error deleting pet profile:", error);
      // Refresh list to ensure consistency
      await fetchPetProfiles();
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to delete pet profile",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
      setPetToDelete(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Pet Profiles</h1>

      {!showForm && (
        <Button
          onClick={() => {
            setShowForm(true);
            setFormValues({
              type: "dog",
              activityLevel: "",
              feedFrequencyPerDay: "",
            });
          }}
          className="mb-6"
        >
          Add New Pet
        </Button>
      )}

      {showForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>
              {editingPet ? "Edit Pet Profile" : "Create New Pet Profile"}
            </CardTitle>
            <CardDescription>
              {editingPet
                ? "Update your pet's details."
                : "Tell us about your furry friend."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <Label htmlFor="name">Pet Name</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={editingPet?.name || ""}
                  required
                />
              </div>

              {/* Image Upload */}
              <div>
                <Label htmlFor="image">Pet Photo</Label>
                <div className="flex items-center gap-4 mt-2">
                  <div className="relative">
                    <Avatar className="h-20 w-20">
                      <AvatarImage
                        src={imagePreview || editingPet?.image || ""}
                        alt="Pet"
                      />
                      <AvatarFallback className="bg-gray-100">
                        <Camera className="h-8 w-8 text-gray-400" />
                      </AvatarFallback>
                    </Avatar>
                    {imagePreview && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                        onClick={() => {
                          setSelectedImage(null);
                          setImagePreview("");
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  <div className="flex-1">
                    <Input
                      id="image"
                      name="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("image")?.click()}
                      className="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {imagePreview ? "Change Photo" : "Upload Photo"}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={formValues.type}
                    onValueChange={(value) =>
                      setFormValues({ ...formValues, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select pet type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dog">Dog</SelectItem>
                      <SelectItem value="cat">Cat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="breed">Breed</Label>
                  <Input
                    id="breed"
                    name="breed"
                    defaultValue={editingPet?.breed || ""}
                    placeholder="e.g., Golden Retriever"
                  />
                </div>
              </div>
              {/* Vaccine Card Upload */}
              <div>
                <Label htmlFor="vaccineCard">Vaccine Card (PDF or image)</Label>
                <div className="mt-2 flex flex-col gap-2">
                  <Input
                    id="vaccineCard"
                    name="vaccineCard"
                    type="file"
                    accept="application/pdf,image/*"
                    onChange={handleVaccineCardChange}
                  />
                  {editingPet?.vaccineCardUrl && (
                    <div className="text-sm text-gray-600">
                      Existing:{" "}
                      {editingPet.vaccineCardUrl.startsWith(
                        "data:application/pdf"
                      ) ? (
                        <a
                          href={editingPet.vaccineCardUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 underline"
                        >
                          View PDF
                        </a>
                      ) : (
                        <a
                          href={editingPet.vaccineCardUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 underline"
                        >
                          View Image
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="birthday">Birthday</Label>
                  <Input
                    id="birthday"
                    name="birthday"
                    type="date"
                    defaultValue={
                      editingPet?.birthday
                        ? new Date(editingPet.birthday)
                            .toISOString()
                            .split("T")[0]
                        : ""
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="weight">Weight (lbs)</Label>
                  <Input
                    id="weight"
                    name="weight"
                    type="number"
                    step="0.1"
                    defaultValue={editingPet?.weight || 0}
                    min="0"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="healthNotes">Health Notes / Allergies</Label>
                <Textarea
                  id="healthNotes"
                  name="healthNotes"
                  defaultValue={editingPet?.healthTags?.join(", ") || ""}
                  placeholder="e.g., Allergic to chicken, needs grain-free food"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="activityLevel">Activity Level (1-10)</Label>
                  <Select
                    value={formValues.activityLevel}
                    onValueChange={(value) =>
                      setFormValues({ ...formValues, activityLevel: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select activity level" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                        <SelectItem key={level} value={level.toString()}>
                          {level}{" "}
                          {level === 1
                            ? "(Low)"
                            : level === 10
                            ? "(Very High)"
                            : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    1 = Low, 10 = Very High
                  </p>
                </div>

                <div>
                  <Label htmlFor="feedFrequencyPerDay">
                    Feed Frequency Per Day
                  </Label>
                  <Select
                    value={formValues.feedFrequencyPerDay}
                    onValueChange={(value) =>
                      setFormValues({
                        ...formValues,
                        feedFrequencyPerDay: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 time per day</SelectItem>
                      <SelectItem value="2">2 times per day</SelectItem>
                      <SelectItem value="3">3 times per day</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Profile"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading pet profiles...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {petProfiles.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-gray-500">
                No pet profiles added yet. Click "Add New Pet" to get started!
              </CardContent>
            </Card>
          ) : (
            petProfiles.map((pet) => (
              <Card key={pet.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={pet.image || ""} alt={pet.name} />
                        <AvatarFallback className="bg-gray-100">
                          <Camera className="h-6 w-6 text-gray-400" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle>
                          {pet.name} ({pet.type})
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {pet.breed} • {calculateAge(pet.birthday)} years old •{" "}
                          {pet.weight} lbs
                          {pet.activityLevel &&
                            ` • Activity: ${pet.activityLevel}/10`}
                          {pet.feedFrequencyPerDay &&
                            ` • Feeds: ${pet.feedFrequencyPerDay}x/day`}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(pet)}
                      >
                        Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2">
                              <AlertTriangle className="h-5 w-5 text-red-600" />
                              Delete Pet Profile
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete{" "}
                              <strong>{pet.name}</strong>'s profile? This action
                              cannot be undone and will permanently remove all
                              information about {pet.name}.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel disabled={deleting}>
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(pet)}
                              className="bg-red-600 hover:bg-red-700"
                              disabled={deleting}
                            >
                              {deleting ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                  Deleting...
                                </>
                              ) : (
                                "Delete Profile"
                              )}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                {pet.healthTags && pet.healthTags.length > 0 && (
                  <CardContent>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Health Notes:</span>{" "}
                      {pet.healthTags.join(", ")}
                    </p>
                    {pet.vaccineCardUrl && (
                      <p className="text-sm text-gray-700 mt-2">
                        <span className="font-medium">Vaccine Card:</span>{" "}
                        {pet.vaccineCardUrl.startsWith(
                          "data:application/pdf"
                        ) ? (
                          <a
                            href={pet.vaccineCardUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 underline"
                          >
                            View PDF
                          </a>
                        ) : (
                          <a
                            href={pet.vaccineCardUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 underline"
                          >
                            View Image
                          </a>
                        )}
                      </p>
                    )}
                  </CardContent>
                )}
              </Card>
            ))
          )}
        </div>
      )}

      {/* Confirmation Dialog for Pet Deletion */}
      <AlertDialog
        open={!!petToDelete}
        onOpenChange={() => setPetToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Delete Pet Profile
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong>{petToDelete?.name}</strong>'s profile? This action cannot
              be undone and will permanently remove all information about{" "}
              {petToDelete?.name}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Profile"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
