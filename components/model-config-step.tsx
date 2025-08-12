"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { ArrowRight, ArrowLeft, Settings, Zap, Brain, CheckCircle } from "lucide-react"

interface Project {
  id: string
  name: string
  type: string
}

interface AIModel {
  id: string
  name: string
  provider: "cerebras" | "sambanova"
  description: string
  maxTokens: number
  supportedTasks: string[]
  responseTime: string
  accuracy: string
}

interface ModelConfigStepProps {
  project: Project
  onComplete: () => void
  onNext: () => void
  onPrevious: () => void
}

export default function ModelConfigStep({ project, onComplete, onNext, onPrevious }: ModelConfigStepProps) {
  const [selectedModel, setSelectedModel] = useState("")
  const [availableModels, setAvailableModels] = useState<AIModel[]>([])
  const [recommendedModel, setRecommendedModel] = useState<AIModel | null>(null)
  const [loading, setLoading] = useState(true)
  const [config, setConfig] = useState({
    temperature: 0.7,
    maxTokens: 2048,
  })

  useEffect(() => {
    const loadModels = async () => {
      try {
        const response = await fetch(`/api/ai/models?task=${project.type}`)
        const data = await response.json()
        setAvailableModels(data.models)
        setRecommendedModel(data.recommended)
        if (data.recommended) {
          setSelectedModel(data.recommended.id)
        }
      } catch (error) {
        console.error("Failed to load models:", error)
      } finally {
        setLoading(false)
      }
    }

    loadModels()
  }, [project.type])

  const handleNext = () => {
    if (selectedModel) {
      onComplete()
      onNext()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <Card className="bg-blue-600/20 border-blue-400/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Configure AI Model
          </CardTitle>
          <CardDescription className="text-gray-300">
            Choose the AI model that best fits your {project.type.replace("_", " ")} application. We'll handle the
            technical configuration for you.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Model Selection */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white">Available Models</h3>

        <div className="grid gap-4">
          {availableModels.map((model) => {
            const isRecommended = recommendedModel?.id === model.id
            const isSelected = selectedModel === model.id

            return (
              <Card
                key={model.id}
                className={`bg-white/5 border-white/10 cursor-pointer transition-colors hover:bg-white/10 ${
                  isSelected ? "ring-2 ring-purple-400" : ""
                }`}
                onClick={() => setSelectedModel(model.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          model.provider === "cerebras"
                            ? "bg-gradient-to-r from-orange-500 to-red-500"
                            : "bg-gradient-to-r from-blue-500 to-purple-500"
                        }`}
                      >
                        {model.provider === "cerebras" ? (
                          <Zap className="h-6 w-6 text-white" />
                        ) : (
                          <Brain className="h-6 w-6 text-white" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="text-white font-semibold text-lg">{model.name}</h4>
                          {isRecommended && <Badge className="bg-green-600 text-white text-xs">Recommended</Badge>}
                          {isSelected && <CheckCircle className="h-5 w-5 text-green-400" />}
                        </div>
                        <p className="text-gray-300">{model.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
                          <span>Max tokens: {model.maxTokens.toLocaleString()}</span>
                          <span>Response: {model.responseTime}</span>
                          <span>Accuracy: {model.accuracy}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Model Configuration */}
      {selectedModel && (
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Model Parameters</CardTitle>
            <CardDescription className="text-gray-300">
              Fine-tune the model behavior for your specific use case
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-white">Temperature: {config.temperature}</Label>
                  <p className="text-sm text-gray-400 mb-2">Controls randomness (0 = deterministic, 1 = creative)</p>
                  <Slider
                    value={[config.temperature]}
                    onValueChange={(value) => setConfig({ ...config, temperature: value[0] })}
                    max={1}
                    min={0}
                    step={0.1}
                    className="w-full"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="text-white">Max Tokens: {config.maxTokens}</Label>
                  <p className="text-sm text-gray-400 mb-2">Maximum length of the response</p>
                  <Slider
                    value={[config.maxTokens]}
                    onValueChange={(value) => setConfig({ ...config, maxTokens: value[0] })}
                    max={4096}
                    min={256}
                    step={256}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Configuration Preview */}
      {selectedModel && (
        <Card className="bg-green-600/20 border-green-400/30">
          <CardHeader>
            <CardTitle className="text-white">Configuration Summary</CardTitle>
            <CardDescription className="text-gray-300">
              Your {project.type.replace("_", " ")} application will use these settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h5 className="text-white font-medium mb-2">Model Settings</h5>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• Model: {availableModels.find((m) => m.id === selectedModel)?.name}</li>
                  <li>• Temperature: {config.temperature}</li>
                  <li>• Max tokens: {config.maxTokens.toLocaleString()}</li>
                  <li>• Provider: {availableModels.find((m) => m.id === selectedModel)?.provider}</li>
                </ul>
              </div>
              <div>
                <h5 className="text-white font-medium mb-2">Performance</h5>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• Auto-scaling enabled</li>
                  <li>• Rate limiting: 1000 req/min</li>
                  <li>• Caching: Enabled</li>
                  <li>• Monitoring: Real-time</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          onClick={onPrevious}
          variant="outline"
          className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        <Button
          onClick={handleNext}
          disabled={!selectedModel}
          className="bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue to Testing
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}
