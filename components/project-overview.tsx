"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Brain, Target, Zap } from "lucide-react"

interface Project {
  id: string
  name: string
  description: string | null
  type: string
  status: string
  config: any
  created_at: string
}

interface ProjectOverviewProps {
  project: Project
  onComplete: () => void
  onNext: () => void
}

const projectTypeInfo: Record<string, { description: string; capabilities: string[]; useCase: string }> = {
  sentiment_analysis: {
    description: "Analyze the emotional tone and sentiment in text data",
    capabilities: ["Positive/Negative/Neutral classification", "Confidence scoring", "Batch processing"],
    useCase: "Perfect for social media monitoring, customer feedback analysis, and brand sentiment tracking",
  },
  text_classification: {
    description: "Categorize text into predefined classes or labels",
    capabilities: ["Multi-class classification", "Custom categories", "Confidence scoring"],
    useCase: "Ideal for content categorization, spam detection, and document organization",
  },
  named_entity_recognition: {
    description: "Extract and identify named entities from text",
    capabilities: ["Person, Organization, Location detection", "Custom entity types", "Entity linking"],
    useCase: "Great for information extraction, content analysis, and data mining",
  },
  text_summarization: {
    description: "Generate concise summaries from longer text content",
    capabilities: ["Extractive and abstractive summarization", "Length control", "Key point extraction"],
    useCase: "Perfect for document summarization, news briefings, and content curation",
  },
  question_answering: {
    description: "Build systems that can answer questions based on context",
    capabilities: ["Context-based answers", "Confidence scoring", "Multiple answer formats"],
    useCase: "Ideal for customer support, knowledge bases, and educational applications",
  },
  chatbot: {
    description: "Create conversational AI agents for interactive experiences",
    capabilities: ["Natural conversation flow", "Context awareness", "Multi-turn dialogue"],
    useCase: "Perfect for customer service, virtual assistants, and interactive applications",
  },
  content_generation: {
    description: "Generate human-like text content for various purposes",
    capabilities: ["Creative writing", "Template-based generation", "Style control"],
    useCase: "Great for content marketing, creative writing, and automated reporting",
  },
  custom: {
    description: "Build a custom AI application tailored to your specific needs",
    capabilities: ["Flexible configuration", "Custom workflows", "Specialized processing"],
    useCase: "Perfect for unique use cases that don't fit standard categories",
  },
}

export default function ProjectOverview({ project, onComplete, onNext }: ProjectOverviewProps) {
  const typeInfo = projectTypeInfo[project.type] || projectTypeInfo.custom

  const handleGetStarted = () => {
    onComplete()
    onNext()
  }

  return (
    <div className="space-y-6">
      {/* Project Type Information */}
      <Card className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-400/30">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <Brain className="h-8 w-8 text-purple-400" />
            <div>
              <CardTitle className="text-white text-xl">
                {project.type
                  .split("_")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")}
              </CardTitle>
              <CardDescription className="text-gray-300 text-base">{typeInfo.description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-white font-semibold mb-3 flex items-center">
                <Zap className="h-4 w-4 mr-2 text-yellow-400" />
                Key Capabilities
              </h4>
              <ul className="space-y-2">
                {typeInfo.capabilities.map((capability, index) => (
                  <li key={index} className="text-gray-300 text-sm flex items-start">
                    <span className="w-2 h-2 bg-purple-400 rounded-full mt-2 mr-3 flex-shrink-0" />
                    {capability}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3 flex items-center">
                <Target className="h-4 w-4 mr-2 text-green-400" />
                Use Case
              </h4>
              <p className="text-gray-300 text-sm">{typeInfo.useCase}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Details */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Project Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-gray-400">Name</label>
              <p className="text-white font-medium">{project.name}</p>
            </div>
            <div>
              <label className="text-sm text-gray-400">Description</label>
              <p className="text-gray-300">{project.description || "No description provided"}</p>
            </div>
            <div>
              <label className="text-sm text-gray-400">Status</label>
              <Badge className="bg-gray-600 text-white">{project.status}</Badge>
            </div>
            <div>
              <label className="text-sm text-gray-400">Created</label>
              <p className="text-gray-300">{new Date(project.created_at).toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Next Steps</CardTitle>
            <CardDescription className="text-gray-300">Here's what we'll help you configure</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-gray-300">
                <span className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  1
                </span>
                <span>Connect your data sources</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <span className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  2
                </span>
                <span>Configure AI model settings</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <span className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  3
                </span>
                <span>Test your application</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <span className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  4
                </span>
                <span>Deploy to production</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Button */}
      <div className="flex justify-end">
        <Button onClick={handleGetStarted} className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3">
          Get Started
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}
