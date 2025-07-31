"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { type PetProfile as PetProfileType, petProfiles as initialPetProfiles } from "@/lib/data"

export default function PetProfilePage() {
  const [petProfiles, setPetProfiles] = useState<PetProfileType[]>(initialPetProfiles)
  const [editingPet, setEditingPet] = useState<PetProfileType | null>(null)
  const [showForm, setShowForm] = useState(false)
  const { toast } = useToast()

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget as HTMLFormElement)
    const newPet: PetProfileType = {
      id: editingPet?.id || `pet_${Date.now()}`,
      name: formData.get("name") as string,
      type: formData.get("type") as "dog" | "cat",
      breed: formData.get("breed") as string,
      age: Number.parseInt(formData.get("age") as string),
      weight: Number.parseInt(formData.get("weight") as string),
      healthNotes: formData.get("healthNotes") as string,
    }

    if (editingPet) {
      setPetProfiles(petProfiles.map((p) => (p.id === newPet.id ? newPet : p)))
      toast({ title: "Pet profile updated!" })
    } else {
      setPetProfiles([...petProfiles, newPet])
      toast({ title: "New pet profile created!" })
    }
    setShowForm(false)
    setEditingPet(null)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingPet(null)
  }

  const handleEdit = (pet: PetProfileType) => {
    setEditingPet(pet)
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this pet profile?")) {
      setPetProfiles(petProfiles.filter((p) => p.id !== id))
      toast({ title: "Pet profile deleted." })
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Pet Profiles</h1>

      {!showForm && (
        <Button onClick={() => setShowForm(true)} className="mb-6">
          Add New Pet
        </Button>
      )}

      {showForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{editingPet ? "Edit Pet Profile" : "Create New Pet Profile"}</CardTitle>
            <CardDescription>
              {editingPet ? "Update your pet's details." : "Tell us about your furry friend."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <Label htmlFor="name">Pet Name</Label>
                <Input id="name" name="name" defaultValue={editingPet?.name || ""} required />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select name="type" defaultValue={editingPet?.type || "dog"}>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="age">Age (Years)</Label>
                  <Input id="age" name="age" type="number" defaultValue={editingPet?.age || 0} min="0" required />
                </div>
                <div>
                  <Label htmlFor="weight">Weight (lbs)</Label>
                  <Input
                    id="weight"
                    name="weight"
                    type="number"
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
                  defaultValue={editingPet?.healthNotes || ""}
                  placeholder="e.g., Allergic to chicken, needs grain-free food"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Save Profile</Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

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
                  <div>
                    <CardTitle>
                      {pet.name} ({pet.type})
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {pet.breed} • {pet.age} years old • {pet.weight} lbs
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(pet)}>
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(pet.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {pet.healthNotes && (
                <CardContent>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Health Notes:</span> {pet.healthNotes}
                  </p>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
