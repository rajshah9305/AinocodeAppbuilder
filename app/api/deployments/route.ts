import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { deploymentEngine } from "@/lib/deployment/engine"

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { projectId, modelId, modelConfig, scaling, rateLimit } = body

    // Verify project ownership
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .single()

    if (projectError || !project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Get next version number
    const { data: existingDeployments } = await supabase
      .from("deployments")
      .select("version")
      .eq("project_id", projectId)
      .order("version", { ascending: false })
      .limit(1)

    const nextVersion = existingDeployments && existingDeployments.length > 0 ? existingDeployments[0].version + 1 : 1

    // Deploy the application
    const deploymentResult = await deploymentEngine.deployApplication({
      projectId,
      version: nextVersion,
      modelId,
      modelConfig: modelConfig || {
        temperature: 0.7,
        maxTokens: 2048,
      },
      scaling: scaling || {
        minInstances: 1,
        maxInstances: 10,
        targetCPU: 70,
      },
      rateLimit: rateLimit || {
        requestsPerMinute: 100,
        requestsPerHour: 1000,
      },
    })

    return NextResponse.json({
      success: true,
      data: deploymentResult,
    })
  } catch (error) {
    console.error("Deployment creation error:", error)
    return NextResponse.json(
      {
        error: "Deployment failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get("projectId")

    let query = supabase
      .from("deployments")
      .select("*, projects!inner(name, type, user_id)")
      .eq("projects.user_id", user.id)
      .order("created_at", { ascending: false })

    if (projectId) {
      query = query.eq("project_id", projectId)
    }

    const { data: deployments, error } = await query

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      data: deployments || [],
    })
  } catch (error) {
    console.error("Get deployments error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch deployments",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
