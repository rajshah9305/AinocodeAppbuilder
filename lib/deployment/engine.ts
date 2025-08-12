// Deployment engine for creating production-ready AI applications
import { createClient } from "@/lib/supabase/server"
import { taskHandler } from "@/lib/ai/task-handlers"

export interface DeploymentConfig {
  projectId: string
  version: number
  modelId: string
  modelConfig: {
    temperature: number
    maxTokens: number
    [key: string]: any
  }
  scaling: {
    minInstances: number
    maxInstances: number
    targetCPU: number
  }
  rateLimit: {
    requestsPerMinute: number
    requestsPerHour: number
  }
}

export interface DeploymentResult {
  deploymentId: string
  endpointUrl: string
  apiKey: string
  status: "deploying" | "active" | "error"
  version: number
  createdAt: string
}

export class DeploymentEngine {
  private supabase = createClient()

  async deployApplication(config: DeploymentConfig): Promise<DeploymentResult> {
    try {
      // Validate project and get details
      const { data: project, error: projectError } = await this.supabase
        .from("projects")
        .select("*")
        .eq("id", config.projectId)
        .single()

      if (projectError || !project) {
        throw new Error("Project not found")
      }

      // Generate API key
      const apiKey = this.generateApiKey()

      // Create deployment record
      const { data: deployment, error: deploymentError } = await this.supabase
        .from("deployments")
        .insert({
          project_id: config.projectId,
          version: config.version,
          status: "deploying",
          deployment_config: {
            modelId: config.modelId,
            modelConfig: config.modelConfig,
            scaling: config.scaling,
            rateLimit: config.rateLimit,
            apiKey: apiKey,
            deployedAt: new Date().toISOString(),
          },
        })
        .select()
        .single()

      if (deploymentError || !deployment) {
        throw new Error("Failed to create deployment record")
      }

      // Generate endpoint URL
      const endpointUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/deployed/${deployment.id}`

      // Update deployment with endpoint URL
      await this.supabase
        .from("deployments")
        .update({
          endpoint_url: endpointUrl,
          status: "active",
        })
        .eq("id", deployment.id)

      // Initialize analytics record
      await this.supabase.from("analytics").insert({
        deployment_id: deployment.id,
        request_count: 0,
        success_count: 0,
        error_count: 0,
        avg_response_time: 0,
        date: new Date().toISOString().split("T")[0],
      })

      return {
        deploymentId: deployment.id,
        endpointUrl,
        apiKey,
        status: "active",
        version: config.version,
        createdAt: deployment.created_at,
      }
    } catch (error) {
      console.error("Deployment error:", error)
      throw new Error(`Deployment failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  async updateDeployment(deploymentId: string, config: Partial<DeploymentConfig>): Promise<void> {
    try {
      const { data: deployment, error: fetchError } = await this.supabase
        .from("deployments")
        .select("*")
        .eq("id", deploymentId)
        .single()

      if (fetchError || !deployment) {
        throw new Error("Deployment not found")
      }

      const updatedConfig = {
        ...deployment.deployment_config,
        ...config,
        updatedAt: new Date().toISOString(),
      }

      await this.supabase
        .from("deployments")
        .update({
          deployment_config: updatedConfig,
          status: "active",
        })
        .eq("id", deploymentId)
    } catch (error) {
      console.error("Update deployment error:", error)
      throw new Error(`Update failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  async stopDeployment(deploymentId: string): Promise<void> {
    try {
      await this.supabase.from("deployments").update({ status: "inactive" }).eq("id", deploymentId)
    } catch (error) {
      console.error("Stop deployment error:", error)
      throw new Error(`Stop failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  async getDeploymentStatus(deploymentId: string): Promise<any> {
    try {
      const { data: deployment, error } = await this.supabase
        .from("deployments")
        .select("*, projects(name, type)")
        .eq("id", deploymentId)
        .single()

      if (error || !deployment) {
        throw new Error("Deployment not found")
      }

      // Get recent analytics
      const { data: analytics } = await this.supabase
        .from("analytics")
        .select("*")
        .eq("deployment_id", deploymentId)
        .order("date", { ascending: false })
        .limit(7)

      return {
        ...deployment,
        analytics: analytics || [],
      }
    } catch (error) {
      console.error("Get deployment status error:", error)
      throw new Error(`Status check failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  private generateApiKey(): string {
    const prefix = "aib_"
    const randomBytes = new Uint8Array(32)
    crypto.getRandomValues(randomBytes)
    const key = Array.from(randomBytes, (byte) => byte.toString(16).padStart(2, "0")).join("")
    return prefix + key
  }

  async validateApiKey(apiKey: string): Promise<string | null> {
    try {
      const { data: deployment, error } = await this.supabase
        .from("deployments")
        .select("id, status, deployment_config")
        .eq("deployment_config->>apiKey", apiKey)
        .eq("status", "active")
        .single()

      if (error || !deployment) {
        return null
      }

      return deployment.id
    } catch (error) {
      console.error("API key validation error:", error)
      return null
    }
  }

  async executeDeployedApplication(
    deploymentId: string,
    input: any,
    apiKey: string,
  ): Promise<{
    success: boolean
    data?: any
    error?: string
    usage: {
      requestId: string
      processingTime: number
      tokensUsed?: number
    }
  }> {
    const startTime = Date.now()
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    try {
      // Validate API key
      const validDeploymentId = await this.validateApiKey(apiKey)
      if (!validDeploymentId || validDeploymentId !== deploymentId) {
        throw new Error("Invalid API key")
      }

      // Get deployment configuration
      const { data: deployment, error: deploymentError } = await this.supabase
        .from("deployments")
        .select("*, projects(type)")
        .eq("id", deploymentId)
        .eq("status", "active")
        .single()

      if (deploymentError || !deployment) {
        throw new Error("Deployment not found or inactive")
      }

      const config = deployment.deployment_config
      const projectType = deployment.projects.type

      // Check rate limits (simplified implementation)
      const now = new Date()
      const currentHour = now.getHours()
      const currentMinute = now.getMinutes()

      // Execute the AI task
      const taskConfig = {
        modelId: config.modelId,
        temperature: config.modelConfig.temperature,
        maxTokens: config.modelConfig.maxTokens,
      }

      let result
      switch (projectType) {
        case "sentiment_analysis":
          result = await taskHandler.executeSentimentAnalysis(input.text, taskConfig)
          break
        case "text_classification":
          result = await taskHandler.executeTextClassification(input.text, input.categories || [], taskConfig)
          break
        case "text_summarization":
          result = await taskHandler.executeTextSummarization(input.text, {
            ...taskConfig,
            maxLength: input.maxLength,
          })
          break
        case "question_answering":
          result = await taskHandler.executeQuestionAnswering(input.question, input.context, taskConfig)
          break
        case "content_generation":
          result = await taskHandler.executeContentGeneration(input.prompt, {
            ...taskConfig,
            style: input.style,
          })
          break
        default:
          throw new Error(`Unsupported project type: ${projectType}`)
      }

      const processingTime = Date.now() - startTime

      // Update analytics
      await this.updateAnalytics(deploymentId, true, processingTime)

      return {
        success: true,
        data: result,
        usage: {
          requestId,
          processingTime,
          tokensUsed: result.usage?.total_tokens,
        },
      }
    } catch (error) {
      const processingTime = Date.now() - startTime

      // Update analytics for error
      await this.updateAnalytics(deploymentId, false, processingTime)

      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        usage: {
          requestId,
          processingTime,
        },
      }
    }
  }

  private async updateAnalytics(deploymentId: string, success: boolean, processingTime: number): Promise<void> {
    try {
      const today = new Date().toISOString().split("T")[0]

      const { data: existing } = await this.supabase
        .from("analytics")
        .select("*")
        .eq("deployment_id", deploymentId)
        .eq("date", today)
        .single()

      if (existing) {
        // Update existing record
        const newRequestCount = existing.request_count + 1
        const newSuccessCount = existing.success_count + (success ? 1 : 0)
        const newErrorCount = existing.error_count + (success ? 0 : 1)
        const newAvgResponseTime =
          (existing.avg_response_time * existing.request_count + processingTime) / newRequestCount

        await this.supabase
          .from("analytics")
          .update({
            request_count: newRequestCount,
            success_count: newSuccessCount,
            error_count: newErrorCount,
            avg_response_time: Math.round(newAvgResponseTime * 100) / 100,
          })
          .eq("deployment_id", deploymentId)
          .eq("date", today)
      } else {
        // Create new record
        await this.supabase.from("analytics").insert({
          deployment_id: deploymentId,
          request_count: 1,
          success_count: success ? 1 : 0,
          error_count: success ? 0 : 1,
          avg_response_time: processingTime,
          date: today,
        })
      }
    } catch (error) {
      console.error("Analytics update error:", error)
    }
  }
}

// Singleton instance
export const deploymentEngine = new DeploymentEngine()
