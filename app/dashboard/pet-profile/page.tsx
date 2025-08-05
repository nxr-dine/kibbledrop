"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { Camera, Upload, X } from "lucide-react"

interface PetProfile {
  id: string
  userId: string
  name: string
  type: string
  breed: string
  birthday?: string | null
  weight: number
  image?: string
  healthTags: string[]
  createdAt: string
  updatedAt: string
}

export default function PetProfilePage() {
  const [petProfiles, setPetProfiles] = useState<PetProfile[]>([])
  const [editingPet, setEditingPet] = useState<PetProfile | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
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

  const calculateAge = (birthday: string | null) => {
    if (!birthday) return "Unknown"
    const birthDate = new Date(birthday)
    const today = new Date()
    const ageInMs = today.getTime() - birthDate.getTime()
    const ageInYears = ageInMs / (1000 * 60 * 60 * 24 * 365.25)
    return Math.floor(ageInYears)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget as HTMLFormElement)
    
    const petData = {
      name: formData.get("name") as string,
      type: formData.get("type") as string,
      breed: formData.get("breed") as string,
      birthday: formData.get("birthday") as string,
      weight: Number.parseFloat(formData.get("weight") as string),
      healthTags: (formData.get("healthNotes") as string).split(',').map(tag => tag.trim()).filter(tag => tag)
    }

    // Create a new FormData for file upload
    const uploadData = new FormData()
    uploadData.append('name', petData.name)
    uploadData.append('type', petData.type)
    uploadData.append('breed', petData.breed)
    uploadData.append('birthday', petData.birthday)
    uploadData.append('weight', petData.weight.toString())
    uploadData.append('healthTags', JSON.stringify(petData.healthTags))
    
    if (selectedImage) {
      uploadData.append('image', selectedImage)
    }

    try {
      if (editingPet) {
        // Update existing pet
        const response = await fetch(`/api/pets/${editingPet.id}`, {
          method: 'PUT',
          body: uploadData
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
          body: uploadData
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
      setSelectedImage(null)
      setImagePreview("")
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
    setSelectedImage(null)
    setImagePreview("")
  }

  const handleEdit = (pet: PetProfile) => {
    setEditingPet(pet)
    setImagePreview(pet.image || "")
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
              
              {/* Image Upload */}
              <div>
                <Label htmlFor="image">Pet Photo</Label>
                <div className="flex items-center gap-4 mt-2">
                  <div className="relative">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={imagePreview || editingPet?.image || ""} alt="Pet" />
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
                          setSelectedImage(null)
                          setImagePreview("")
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
                      onClick={() => document.getElementById('image')?.click()}
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
                  <Label htmlFor="birthday">Birthday</Label>
                  <Input 
                    id="birthday" 
                    name="birthday" 
                    type="date" 
                    defaultValue={editingPet?.birthday ? new Date(editingPet.birthday).toISOString().split('T')[0] : ""} 
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
                        {pet.breed} • {calculateAge(pet.birthday)} years old • {pet.weight} lbs
                      </CardDescription>
                    </div>
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
