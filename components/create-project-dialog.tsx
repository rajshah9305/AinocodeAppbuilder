"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

interface CreateProjectDialogProps {
  children: React.ReactNode
  userId: string
}

const projectTypes = [
  { value: "sentiment_analysis", label: "Sentiment Analysis" },
  { value: "text_classification", label: "Text Classification" },
  { value: "named_entity_recognition", label: "Named Entity Recognition" },
  { value: "text_summarization", label: "Text Summarization" },
  { value: "question_answering", label: "Question Answering" },
  { value: "chatbot", label: "Chatbot" },
  { value: "content_generation", label: "Content Generation" },
  { value: "custom", label: "Custom" },
]

export default function CreateProjectDialog({ children, userId }: CreateProjectDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "",
  })
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.type) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("projects")
        .insert({
          name: formData.name,
          description: formData.description || null,
          type: formData.type,
          user_id: userId,
        })
        .select()
        .single()

      if (error) throw error

      setOpen(false)
      setFormData({ name: "", description: "", type: "" })
      router.refresh()
      router.push(`/projects/${data.id}`)
    } catch (error) {
      console.error("Error creating project:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle>Create New AI Project</DialogTitle>
          <DialogDescription className="text-gray-400">
            Choose a project type and provide basic information to get started.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="My AI Application"
              className="bg-slate-700 border-slate-600 text-white"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Project Type</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Select a project type" />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                {projectTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value} className="text-white hover:bg-slate-600">
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what your AI application will do..."
              className="bg-slate-700 border-slate-600 text-white"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-slate-600 text-gray-300 hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.name || !formData.type}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Project"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
