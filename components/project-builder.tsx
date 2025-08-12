"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Brain, Database, Settings, Rocket, CheckCircle, Circle, Sparkles } from "lucide-react"
import BuilderStep from "@/components/builder-step"
import ProjectOverview from "@/components/project-overview"
import DataSourceStep from "@/components/data-source-step"
import ModelConfigStep from "@/components/model-config-step"
import TestingStep from "@/components/testing-step"
import DeploymentStep from "@/components/deployment-step"

interface Project {
  id: string
  name: string
  description: string | null
  type: string
  status: string
  config: any
  created_at: string
}

interface DataSource {
  id: string
  name: string
  type: string
  status: string
  row_count: number
}

interface ProjectBuilderProps {
  project: Project
  dataSources: DataSource[]
}

const builderSteps = [
  {
    id: "overview",
    title: "Project Overview",
    description: "Review your project details and requirements",
    icon: Brain,
    required: true,
  },
  {
    id: "data",
    title: "Data Sources",
    description: "Connect and configure your data sources",
    icon: Database,
    required: true,
  },
  {
    id: "model",
    title: "Model Configuration",
    description: "Configure AI model settings and parameters",
    icon: Settings,
    required: true,
  },
  {
    id: "testing",
    title: "Testing & Validation",
    description: "Test your AI application with sample data",
    icon: Sparkles,
    required: false,
  },
  {
    id: "deployment",
    title: "Deployment",
    description: "Deploy your AI application to production",
    icon: Rocket,
    required: true,
  },
]

const projectTypeLabels: Record<string, string> = {
  sentiment_analysis: "Sentiment Analysis",
  text_classification: "Text Classification",
  named_entity_recognition: "Named Entity Recognition",
  text_summarization: "Text Summarization",
  question_answering: "Question Answering",
  chatbot: "Chatbot",
  content_generation: "Content Generation",
  custom: "Custom",
}

export default function ProjectBuilder({ project, dataSources }: ProjectBuilderProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<string[]>(project.config?.completedSteps || [])

  const progress = (completedSteps.length / builderSteps.length) * 100

  const isStepCompleted = (stepId: string) => completedSteps.includes(stepId)
  const canAccessStep = (stepIndex: number) => {
    if (stepIndex === 0) return true
    return isStepCompleted(builderSteps[stepIndex - 1].id)
  }

  const markStepCompleted = (stepId: string) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId])
    }
  }

  const goToNextStep = () => {
    if (currentStep < builderSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const renderStepContent = () => {
    const step = builderSteps[currentStep]

    switch (step.id) {
      case "overview":
        return (
          <ProjectOverview project={project} onComplete={() => markStepCompleted("overview")} onNext={goToNextStep} />
        )
      case "data":
        return (
          <DataSourceStep
            project={project}
            dataSources={dataSources}
            onComplete={() => markStepCompleted("data")}
            onNext={goToNextStep}
            onPrevious={goToPreviousStep}
          />
        )
      case "model":
        return (
          <ModelConfigStep
            project={project}
            onComplete={() => markStepCompleted("model")}
            onNext={goToNextStep}
            onPrevious={goToPreviousStep}
          />
        )
      case "testing":
        return (
          <TestingStep
            project={project}
            onComplete={() => markStepCompleted("testing")}
            onNext={goToNextStep}
            onPrevious={goToPreviousStep}
          />
        )
      case "deployment":
        return (
          <DeploymentStep
            project={project}
            onComplete={() => markStepCompleted("deployment")}
            onPrevious={goToPreviousStep}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Project Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{project.name}</h1>
            <p className="text-gray-300">{project.description || "No description provided"}</p>
          </div>
          <Badge className="bg-purple-600 text-white">{projectTypeLabels[project.type] || project.type}</Badge>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-300">Progress</span>
            <span className="text-sm text-gray-300">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Step Navigation */}
        <div className="lg:col-span-1">
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white text-lg">Build Steps</CardTitle>
              <CardDescription className="text-gray-300">
                Follow these steps to build your AI application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {builderSteps.map((step, index) => {
                const Icon = step.icon
                const completed = isStepCompleted(step.id)
                const current = index === currentStep
                const accessible = canAccessStep(index)

                return (
                  <button
                    key={step.id}
                    onClick={() => accessible && setCurrentStep(index)}
                    disabled={!accessible}
                    className={`w-full p-3 rounded-lg text-left transition-colors ${
                      current
                        ? "bg-purple-600 text-white"
                        : accessible
                          ? "bg-white/5 text-gray-300 hover:bg-white/10"
                          : "bg-gray-800 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {completed ? (
                          <CheckCircle className="h-5 w-5 text-green-400" />
                        ) : (
                          <Circle className="h-5 w-5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <Icon className="h-4 w-4" />
                          <span className="text-sm font-medium truncate">{step.title}</span>
                        </div>
                        <p className="text-xs opacity-75 truncate">{step.description}</p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </CardContent>
          </Card>
        </div>

        {/* Step Content */}
        <div className="lg:col-span-3">
          <BuilderStep
            step={builderSteps[currentStep]}
            stepNumber={currentStep + 1}
            totalSteps={builderSteps.length}
            isCompleted={isStepCompleted(builderSteps[currentStep].id)}
          >
            {renderStepContent()}
          </BuilderStep>
        </div>
      </div>
    </div>
  )
}
