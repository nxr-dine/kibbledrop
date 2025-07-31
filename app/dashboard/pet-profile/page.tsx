"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

interface PetProfile {
  id: string
  userId: string
  name: string
  type: string
  breed: string
  age: number
  weight: number
  healthTags: string[]
  createdAt: string
  updatedAt: string
}

export default function PetProfilePage() {
  const [petProfiles, setPetProfiles] = useState<PetProfile[]>([])
  const [editingPet, setEditingPet] = useState<PetProfile | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  // Fetch pet profiles on component mount
  useEffect(() => {
    fetchPetProfiles()
  }, [])

  const fetchPetProfiles = async () => {
    try {
      const response = await fetch('/api/pets')
      if (response.ok) {
        const data = await response.json()
        setPetProfiles(data)
      }
    } catch (error) {
      console.error('Error fetching pet profiles:', error)
      toast({
        title: "Error",
        description: "Failed to load pet profiles",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget as HTMLFormElement)
    
    const petData = {
      name: formData.get("name") as string,
      type: formData.get("type") as string,
      breed: formData.get("breed") as string,
      age: Number.parseInt(formData.get("age") as string),
      weight: Number.parseFloat(formData.get("weight") as string),
      healthTags: (formData.get("healthNotes") as string).split(',').map(tag => tag.trim()).filter(tag => tag)
    }

    try {
      if (editingPet) {
        // Update existing pet
        const response = await fetch(`/api/pets/${editingPet.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(petData)
        })
        
        if (response.ok) {
          await fetchPetProfiles() // Refresh the list
          toast({ title: "Pet profile updated!" })
        } else {
          throw new Error('Failed to update pet profile')
        }
      } else {
        // Create new pet
        const response = await fetch('/api/pets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(petData)
        })
        
        if (response.ok) {
          await fetchPetProfiles() // Refresh the list
          toast({ title: "New pet profile created!" })
        } else {
          throw new Error('Failed to create pet profile')
        }
      }
      
      setShowForm(false)
      setEditingPet(null)
    } catch (error) {
      console.error('Error saving pet profile:', error)
      toast({
        title: "Error",
        description: "Failed to save pet profile",
        variant: "destructive"
      })
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingPet(null)
  }

  const handleEdit = (pet: PetProfile) => {
    setEditingPet(pet)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this pet profile?")) {
      try {
        const response = await fetch(`/api/pets/${id}`, {
          method: 'DELETE'
        })
        
        if (response.ok) {
          await fetchPetProfiles() // Refresh the list
          toast({ title: "Pet profile deleted." })
        } else {
          throw new Error('Failed to delete pet profile')
        }
      } catch (error) {
        console.error('Error deleting pet profile:', error)
        toast({
          title: "Error",
          description: "Failed to delete pet profile",
          variant: "destructive"
        })
      }
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
                  defaultValue={editingPet?.healthTags?.join(', ') || ""}
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
              {pet.healthTags && pet.healthTags.length > 0 && (
                <CardContent>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Health Notes:</span> {pet.healthTags.join(', ')}
                  </p>
                </CardContent>
              )}
            </Card>
          ))
        )}
        </div>
      )}
    </div>
  )
}
