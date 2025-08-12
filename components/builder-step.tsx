import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface BuilderStepProps {
  step: {
    id: string
    title: string
    description: string
    icon: LucideIcon
    required: boolean
  }
  stepNumber: number
  totalSteps: number
  isCompleted: boolean
  children: React.ReactNode
}

export default function BuilderStep({ step, stepNumber, totalSteps, isCompleted, children }: BuilderStepProps) {
  const Icon = step.icon

  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-600">
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-white flex items-center space-x-2">
                <span>{step.title}</span>
                {isCompleted && <CheckCircle className="h-5 w-5 text-green-400" />}
              </CardTitle>
              <CardDescription className="text-gray-300">{step.description}</CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="border-gray-600 text-gray-300">
              Step {stepNumber} of {totalSteps}
            </Badge>
            {step.required && <Badge className="bg-orange-600 text-white">Required</Badge>}
          </div>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
