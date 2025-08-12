"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Rocket, Globe, Key, CheckCircle, Copy, ExternalLink, Code } from "lucide-react"

interface Project {
  id: string
  name: string
  type: string
}

interface DeploymentStepProps {
  project: Project
  onComplete: () => void
  onPrevious: () => void
}

export default function DeploymentStep({ project, onComplete, onPrevious }: DeploymentStepProps) {
  const [deploying, setDeploying] = useState(false)
  const [deployed, setDeployed] = useState(false)
  const [deploymentData, setDeploymentData] = useState<any>(null)

  const handleDeploy = async () => {
    setDeploying(true)
    try {
      const response = await fetch("/api/deployments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId: project.id,
          modelId: "cerebras-llama-3.1-8b", // Default model
          modelConfig: {
            temperature: 0.7,
            maxTokens: 2048,
          },
          scaling: {
            minInstances: 1,
            maxInstances: 10,
            targetCPU: 70,
          },
          rateLimit: {
            requestsPerMinute: 100,
            requestsPerHour: 1000,
          },
        }),
      })

      const result = await response.json()
      if (result.success) {
        setDeploymentData(result.data)
        setDeployed(true)
        onComplete()
      } else {
        throw new Error(result.message || "Deployment failed")
      }
    } catch (error) {
      console.error("Deployment error:", error)
      alert("Deployment failed: " + (error instanceof Error ? error.message : "Unknown error"))
    } finally {
      setDeploying(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const generateCurlExample = () => {
    if (!deploymentData) return ""

    const examples: Record<string, string> = {
      sentiment_analysis: `curl -X POST "${deploymentData.endpointUrl}" \\
  -H "Authorization: Bearer ${deploymentData.apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "text": "I love this product! It works perfectly."
  }'`,
      text_classification: `curl -X POST "${deploymentData.endpointUrl}" \\
  -H "Authorization: Bearer ${deploymentData.apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "text": "This is a great product review",
    "categories": ["positive", "negative", "neutral"]
  }'`,
      text_summarization: `curl -X POST "${deploymentData.endpointUrl}" \\
  -H "Authorization: Bearer ${deploymentData.apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "text": "Your long text to summarize...",
    "maxLength": 150
  }'`,
      question_answering: `curl -X POST "${deploymentData.endpointUrl}" \\
  -H "Authorization: Bearer ${deploymentData.apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "question": "What is the main topic?",
    "context": "Your context text here..."
  }'`,
      content_generation: `curl -X POST "${deploymentData.endpointUrl}" \\
  -H "Authorization: Bearer ${deploymentData.apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "Write a blog post about AI",
    "style": "professional"
  }'`,
    }

    return examples[project.type] || examples.sentiment_analysis
  }

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <Card className="bg-blue-600/20 border-blue-400/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Rocket className="h-5 w-5 mr-2" />
            Deploy Your AI Application
          </CardTitle>
          <CardDescription className="text-gray-300">
            Deploy your {project.type.replace("_", " ")} application to production with a single click. We'll handle
            scaling, monitoring, and maintenance for you.
          </CardDescription>
        </CardHeader>
      </Card>

      {!deployed ? (
        <>
          {/* Deployment Configuration */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Deployment Configuration</CardTitle>
              <CardDescription className="text-gray-300">
                Your application will be deployed with these settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-gray-300">Application Name</Label>
                    <Input value={project.name} disabled className="bg-slate-700 border-slate-600 text-gray-400" />
                  </div>
                  <div>
                    <Label className="text-gray-300">Environment</Label>
                    <Input value="Production" disabled className="bg-slate-700 border-slate-600 text-gray-400" />
                  </div>
                  <div>
                    <Label className="text-gray-300">Model</Label>
                    <Input
                      value="Cerebras Llama 3.1 8B"
                      disabled
                      className="bg-slate-700 border-slate-600 text-gray-400"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-gray-300">Region</Label>
                    <Input
                      value="US East (N. Virginia)"
                      disabled
                      className="bg-slate-700 border-slate-600 text-gray-400"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Scaling</Label>
                    <Input
                      value="Auto (1-10 instances)"
                      disabled
                      className="bg-slate-700 border-slate-600 text-gray-400"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Rate Limit</Label>
                    <Input
                      value="100 req/min, 1000 req/hour"
                      disabled
                      className="bg-slate-700 border-slate-600 text-gray-400"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features Included */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">What's Included</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-gray-300">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span>REST API endpoint</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-300">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span>Auto-scaling infrastructure</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-300">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span>SSL/TLS encryption</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-300">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span>Rate limiting</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-gray-300">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span>Real-time monitoring</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-300">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span>Usage analytics</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-300">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span>API key management</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-300">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span>99.9% uptime SLA</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Deploy Button */}
          <Card className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-400/30">
            <CardContent className="p-6 text-center">
              <h3 className="text-white font-semibold text-lg mb-2">Ready to Deploy</h3>
              <p className="text-gray-300 mb-6">
                Your AI application is configured and ready for production deployment
              </p>
              <Button
                onClick={handleDeploy}
                disabled={deploying}
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
              >
                {deploying ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                    Deploying...
                  </>
                ) : (
                  <>
                    <Rocket className="h-5 w-5 mr-2" />
                    Deploy Application
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </>
      ) : (
        /* Deployment Success */
        <div className="space-y-6">
          <Card className="bg-green-600/20 border-green-400/30">
            <CardContent className="p-8 text-center">
              <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-white font-bold text-2xl mb-2">Deployment Successful!</h3>
              <p className="text-gray-300 mb-6">Your AI application is now live and ready to receive requests</p>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-800 rounded-lg p-4">
                  <Key className="h-6 w-6 text-yellow-400 mb-2" />
                  <h5 className="text-white font-medium">API Key</h5>
                  <p className="text-gray-400 text-sm mb-2">Use this key to authenticate requests</p>
                  <div className="flex items-center space-x-2">
                    <code className="text-yellow-400 font-mono text-sm bg-slate-900 px-2 py-1 rounded flex-1 truncate">
                      {deploymentData?.apiKey}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(deploymentData?.apiKey)}
                      className="border-gray-600 text-gray-300 bg-transparent"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="bg-slate-800 rounded-lg p-4">
                  <Rocket className="h-6 w-6 text-blue-400 mb-2" />
                  <h5 className="text-white font-medium">Status</h5>
                  <p className="text-green-400 text-sm">Live and healthy</p>
                  <Badge className="bg-green-600 text-white mt-2">Version {deploymentData?.version}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* API Endpoint */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Globe className="h-5 w-5 mr-2" />
                API Endpoint
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-800 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Endpoint URL:</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(deploymentData?.endpointUrl)}
                    className="border-gray-600 text-gray-300 bg-transparent"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </Button>
                </div>
                <code className="text-purple-400 font-mono text-sm break-all">{deploymentData?.endpointUrl}</code>
              </div>
            </CardContent>
          </Card>

          {/* Code Example */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Code className="h-5 w-5 mr-2" />
                Example Usage
              </CardTitle>
              <CardDescription className="text-gray-300">Here's how to call your API using cURL</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-900 rounded-lg p-4 relative">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(generateCurlExample())}
                  className="absolute top-2 right-2 border-gray-600 text-gray-300 bg-transparent"
                >
                  <Copy className="h-3 w-3" />
                </Button>
                <pre className="text-green-400 font-mono text-sm overflow-x-auto whitespace-pre-wrap">
                  {generateCurlExample()}
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white">
              <ExternalLink className="h-4 w-4 mr-2" />
              View Documentation
            </Button>
            <Button
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
              onClick={() => (window.location.href = "/dashboard")}
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          onClick={onPrevious}
          variant="outline"
          className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
          disabled={deploying}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        {deployed && (
          <Button className="bg-green-600 hover:bg-green-700 text-white">
            <CheckCircle className="h-4 w-4 mr-2" />
            Complete
          </Button>
        )}
      </div>
    </div>
  )
}
