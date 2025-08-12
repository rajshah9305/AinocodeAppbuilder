"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ArrowRight, ArrowLeft, Play, CheckCircle, AlertCircle } from "lucide-react"

interface Project {
  id: string
  name: string
  type: string
}

interface TestingStepProps {
  project: Project
  onComplete: () => void
  onNext: () => void
  onPrevious: () => void
}

export default function TestingStep({ project, onComplete, onNext, onPrevious }: TestingStepProps) {
  const [testInput, setTestInput] = useState("")
  const [testResult, setTestResult] = useState<any>(null)
  const [testing, setTesting] = useState(false)

  const handleTest = async () => {
    if (!testInput.trim()) return

    setTesting(true)
    // Simulate API call
    setTimeout(() => {
      setTestResult({
        success: true,
        result: "This is a positive sentiment with 85% confidence",
        confidence: 0.85,
        processingTime: "45ms",
      })
      setTesting(false)
    }, 2000)
  }

  const handleNext = () => {
    onComplete()
    onNext()
  }

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <Card className="bg-blue-600/20 border-blue-400/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Play className="h-5 w-5 mr-2" />
            Test Your AI Application
          </CardTitle>
          <CardDescription className="text-gray-300">
            Test your {project.type.replace("_", " ")} application with sample data to ensure it's working correctly.
            This step is optional but recommended.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Test Interface */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Test Input</CardTitle>
            <CardDescription className="text-gray-300">Enter some sample text to test your application</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              placeholder="Enter your test text here..."
              className="bg-slate-700 border-slate-600 text-white min-h-[120px]"
            />
            <Button
              onClick={handleTest}
              disabled={!testInput.trim() || testing}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              {testing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Testing...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Run Test
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Test Results</CardTitle>
            <CardDescription className="text-gray-300">Results will appear here after running a test</CardDescription>
          </CardHeader>
          <CardContent>
            {!testResult ? (
              <div className="text-center py-8 text-gray-400">
                <Play className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Run a test to see results</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  {testResult.success ? (
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-400" />
                  )}
                  <span className="text-white font-medium">
                    {testResult.success ? "Test Successful" : "Test Failed"}
                  </span>
                </div>

                <div className="bg-slate-700 rounded-lg p-4">
                  <h5 className="text-white font-medium mb-2">Result:</h5>
                  <p className="text-gray-300">{testResult.result}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Confidence:</span>
                    <span className="text-white ml-2">{(testResult.confidence * 100).toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Processing Time:</span>
                    <span className="text-white ml-2">{testResult.processingTime}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sample Test Cases */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Sample Test Cases</CardTitle>
          <CardDescription className="text-gray-300">
            Try these sample inputs to test different scenarios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            {[
              "I love this product! It's amazing and works perfectly.",
              "This is terrible. I hate it and want my money back.",
              "The weather is nice today, but I'm feeling neutral about it.",
            ].map((sample, index) => (
              <Button
                key={index}
                variant="outline"
                className="justify-start text-left border-gray-600 text-gray-300 hover:bg-gray-700 h-auto p-3 bg-transparent"
                onClick={() => setTestInput(sample)}
              >
                <span className="truncate">{sample}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

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
        <Button onClick={handleNext} className="bg-purple-600 hover:bg-purple-700 text-white">
          Continue to Deployment
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}
