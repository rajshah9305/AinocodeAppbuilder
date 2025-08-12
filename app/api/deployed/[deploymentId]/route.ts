import { type NextRequest, NextResponse } from "next/server"
import { deploymentEngine } from "@/lib/deployment/engine"

export async function POST(request: NextRequest, { params }: { params: { deploymentId: string } }) {
  try {
    const { deploymentId } = params

    // Get API key from headers
    const apiKey = request.headers.get("Authorization")?.replace("Bearer ", "")
    if (!apiKey) {
      return NextResponse.json({ error: "API key required" }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()

    // Execute the deployed application
    const result = await deploymentEngine.executeDeployedApplication(deploymentId, body, apiKey)

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error,
          usage: result.usage,
        },
        { status: 400 },
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      usage: result.usage,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Deployed API error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest, { params }: { params: { deploymentId: string } }) {
  try {
    const { deploymentId } = params

    // Get API key from headers
    const apiKey = request.headers.get("Authorization")?.replace("Bearer ", "")
    if (!apiKey) {
      return NextResponse.json({ error: "API key required" }, { status: 401 })
    }

    // Validate API key
    const validDeploymentId = await deploymentEngine.validateApiKey(apiKey)
    if (!validDeploymentId || validDeploymentId !== deploymentId) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 })
    }

    // Get deployment status
    const status = await deploymentEngine.getDeploymentStatus(deploymentId)

    return NextResponse.json({
      success: true,
      data: {
        deploymentId: status.id,
        status: status.status,
        version: status.version,
        endpointUrl: status.endpoint_url,
        projectName: status.projects.name,
        projectType: status.projects.type,
        createdAt: status.created_at,
        analytics: status.analytics,
      },
    })
  } catch (error) {
    console.error("Deployment status error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
