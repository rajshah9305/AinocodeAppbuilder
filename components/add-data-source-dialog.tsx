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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Loader2, FileText, Globe, Database, Upload, Eye, CheckCircle, AlertCircle } from "lucide-react"

interface AddDataSourceDialogProps {
  projectId: string
  children: React.ReactNode
  open: boolean
  onOpenChange: (open: boolean) => void
}

const dataSourceTypes = [
  { value: "csv", label: "CSV File", icon: FileText, description: "Upload a CSV file with your data" },
  { value: "json", label: "JSON Data", icon: FileText, description: "Paste or upload JSON data" },
  { value: "text", label: "Text Document", icon: FileText, description: "Upload text files or documents" },
  { value: "api", label: "API Endpoint", icon: Globe, description: "Connect to a REST API" },
  { value: "database", label: "Database", icon: Database, description: "Connect to a database" },
]

export default function AddDataSourceDialog({ projectId, children, open, onOpenChange }: AddDataSourceDialogProps) {
  const [loading, setLoading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [selectedType, setSelectedType] = useState("")
  const [step, setStep] = useState<"configure" | "preview" | "confirm">("configure")
  const [previewData, setPreviewData] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    config: {} as any,
  })
  const [file, setFile] = useState<File | null>(null)
  const router = useRouter()

  const handlePreview = async () => {
    if (!selectedType) return

    setProcessing(true)
    try {
      const formDataToSend = new FormData()
      formDataToSend.append("type", selectedType)
      formDataToSend.append("config", JSON.stringify(formData.config))

      if (file) {
        formDataToSend.append("file", file)
      }

      const response = await fetch("/api/data/preview", {
        method: "POST",
        body: formDataToSend,
      })

      const result = await response.json()
      if (result.success) {
        setPreviewData(result.data)
        setStep("preview")
      } else {
        throw new Error(result.message || "Preview failed")
      }
    } catch (error) {
      console.error("Preview error:", error)
      alert("Preview failed: " + (error instanceof Error ? error.message : "Unknown error"))
    } finally {
      setProcessing(false)
    }
  }

  const handleSubmit = async () => {
    if (!formData.name || !selectedType) return

    setLoading(true)
    try {
      // First create the data source record
      const { data: dataSource, error: createError } = await supabase
        .from("data_sources")
        .insert({
          project_id: projectId,
          name: formData.name,
          type: selectedType,
          source_config: formData.config,
          status: "pending",
        })
        .select()
        .single()

      if (createError) throw createError

      // Then process the data
      const formDataToSend = new FormData()
      formDataToSend.append("dataSourceId", dataSource.id)
      formDataToSend.append("type", selectedType)
      formDataToSend.append("config", JSON.stringify(formData.config))

      if (file) {
        formDataToSend.append("file", file)
      }

      const response = await fetch("/api/data/process", {
        method: "POST",
        body: formDataToSend,
      })

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.message || "Processing failed")
      }

      onOpenChange(false)
      setFormData({ name: "", config: {} })
      setSelectedType("")
      setStep("configure")
      setPreviewData(null)
      setFile(null)
      router.refresh()
    } catch (error) {
      console.error("Error creating data source:", error)
      alert("Failed to create data source: " + (error instanceof Error ? error.message : "Unknown error"))
    } finally {
      setLoading(false)
    }
  }

  const renderConfigFields = () => {
    switch (selectedType) {
      case "csv":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="file">CSV File</Label>
              <Input
                id="file"
                type="file"
                accept=".csv"
                className="bg-slate-700 border-slate-600 text-white"
                onChange={(e) => {
                  const selectedFile = e.target.files?.[0]
                  if (selectedFile) {
                    setFile(selectedFile)
                    setFormData({
                      ...formData,
                      config: { ...formData.config, fileName: selectedFile.name, fileSize: selectedFile.size },
                    })
                  }
                }}
              />
            </div>
            <div>
              <Label htmlFor="textColumn">Text Column (Optional)</Label>
              <Input
                id="textColumn"
                placeholder="Column name containing text data"
                className="bg-slate-700 border-slate-600 text-white"
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    config: { ...formData.config, textColumn: e.target.value },
                  })
                }}
              />
            </div>
          </div>
        )
      case "json":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="jsonFile">JSON File (Optional)</Label>
              <Input
                id="jsonFile"
                type="file"
                accept=".json"
                className="bg-slate-700 border-slate-600 text-white"
                onChange={(e) => {
                  const selectedFile = e.target.files?.[0]
                  if (selectedFile) {
                    setFile(selectedFile)
                  }
                }}
              />
            </div>
            <div>
              <Label htmlFor="jsonData">Or Paste JSON Data</Label>
              <Textarea
                id="jsonData"
                placeholder="Paste your JSON data here..."
                className="bg-slate-700 border-slate-600 text-white"
                rows={6}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    config: { ...formData.config, data: e.target.value },
                  })
                }}
              />
            </div>
            <div>
              <Label htmlFor="textField">Text Field (Optional)</Label>
              <Input
                id="textField"
                placeholder="Field name containing text data"
                className="bg-slate-700 border-slate-600 text-white"
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    config: { ...formData.config, textField: e.target.value },
                  })
                }}
              />
            </div>
          </div>
        )
      case "text":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="textFile">Text File</Label>
              <Input
                id="textFile"
                type="file"
                accept=".txt,.md"
                className="bg-slate-700 border-slate-600 text-white"
                onChange={(e) => {
                  const selectedFile = e.target.files?.[0]
                  if (selectedFile) {
                    setFile(selectedFile)
                  }
                }}
              />
            </div>
            <div>
              <Label htmlFor="splitBy">Split Method</Label>
              <Select
                value={formData.config.splitBy || "chunk"}
                onValueChange={(value) => {
                  setFormData({
                    ...formData,
                    config: { ...formData.config, splitBy: value },
                  })
                }}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="chunk" className="text-white">
                    Fixed-size chunks
                  </SelectItem>
                  <SelectItem value="paragraph" className="text-white">
                    By paragraphs
                  </SelectItem>
                  <SelectItem value="sentence" className="text-white">
                    By sentences
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.config.splitBy === "chunk" && (
              <div>
                <Label htmlFor="chunkSize">Chunk Size (characters)</Label>
                <Input
                  id="chunkSize"
                  type="number"
                  placeholder="1000"
                  className="bg-slate-700 border-slate-600 text-white"
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      config: { ...formData.config, chunkSize: Number.parseInt(e.target.value) || 1000 },
                    })
                  }}
                />
              </div>
            )}
          </div>
        )
      case "api":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="apiUrl">API URL</Label>
              <Input
                id="apiUrl"
                placeholder="https://api.example.com/data"
                className="bg-slate-700 border-slate-600 text-white"
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    config: { ...formData.config, url: e.target.value },
                  })
                }}
              />
            </div>
            <div>
              <Label htmlFor="apiKey">API Key (Optional)</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="Your API key"
                className="bg-slate-700 border-slate-600 text-white"
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    config: { ...formData.config, apiKey: e.target.value },
                  })
                }}
              />
            </div>
            <div>
              <Label htmlFor="dataPath">Data Path (Optional)</Label>
              <Input
                id="dataPath"
                placeholder="data.items (for nested JSON)"
                className="bg-slate-700 border-slate-600 text-white"
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    config: { ...formData.config, dataPath: e.target.value },
                  })
                }}
              />
            </div>
            <div>
              <Label htmlFor="textField">Text Field (Optional)</Label>
              <Input
                id="textField"
                placeholder="Field name containing text data"
                className="bg-slate-700 border-slate-600 text-white"
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    config: { ...formData.config, textField: e.target.value },
                  })
                }}
              />
            </div>
          </div>
        )
      default:
        return null
    }
  }

  const renderPreview = () => {
    if (!previewData) return null

    return (
      <div className="space-y-4">
        <Card className="bg-slate-700 border-slate-600">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Eye className="h-5 w-5 mr-2" />
              Data Preview
            </CardTitle>
            <CardDescription className="text-gray-300">Preview of your data processing results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <Label className="text-gray-400">Total Records</Label>
                <p className="text-white font-semibold">{previewData.totalRecords.toLocaleString()}</p>
              </div>
              <div>
                <Label className="text-gray-400">Status</Label>
                <div className="flex items-center space-x-2">
                  {previewData.errors.length === 0 ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span className="text-green-400">Ready</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 text-yellow-400" />
                      <span className="text-yellow-400">Warnings</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {previewData.errors.length > 0 && (
              <div className="mb-4">
                <Label className="text-gray-400">Warnings</Label>
                <div className="bg-yellow-600/20 border border-yellow-600/30 rounded p-2 mt-1">
                  {previewData.errors.slice(0, 3).map((error: string, index: number) => (
                    <p key={index} className="text-yellow-300 text-sm">
                      {error}
                    </p>
                  ))}
                  {previewData.errors.length > 3 && (
                    <p className="text-yellow-300 text-sm">... and {previewData.errors.length - 3} more</p>
                  )}
                </div>
              </div>
            )}

            <div>
              <Label className="text-gray-400">Sample Records</Label>
              <div className="space-y-2 mt-2">
                {previewData.previewRecords.slice(0, 3).map((record: any, index: number) => (
                  <div key={index} className="bg-slate-800 rounded p-3">
                    <p className="text-white text-sm">{record.content.substring(0, 200)}...</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400">
                      <span>Words: {record.content.split(/\s+/).length}</span>
                      <span>Characters: {record.content.length}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Data Source</DialogTitle>
          <DialogDescription className="text-gray-400">
            {step === "configure" && "Configure your data source"}
            {step === "preview" && "Preview your data"}
            {step === "confirm" && "Confirm and create data source"}
          </DialogDescription>
        </DialogHeader>

        {step === "configure" && (
          <form className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Data Source Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="My Data Source"
                className="bg-slate-700 border-slate-600 text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Data Source Type</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Select a data source type" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  {dataSourceTypes.map((type) => {
                    const Icon = type.icon
                    return (
                      <SelectItem key={type.value} value={type.value} className="text-white hover:bg-slate-600">
                        <div className="flex items-center space-x-2">
                          <Icon className="h-4 w-4" />
                          <div>
                            <div className="font-medium">{type.label}</div>
                            <div className="text-xs text-gray-400">{type.description}</div>
                          </div>
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            {selectedType && renderConfigFields()}

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-slate-600 text-gray-300 hover:bg-slate-700"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handlePreview}
                disabled={processing || !formData.name || !selectedType}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {processing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Eye className="mr-2 h-4 w-4" />
                    Preview Data
                  </>
                )}
              </Button>
            </div>
          </form>
        )}

        {step === "preview" && (
          <div className="space-y-6">
            {renderPreview()}
            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep("configure")}
                className="border-slate-600 text-gray-300 hover:bg-slate-700"
              >
                Back to Configure
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Create Data Source
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
