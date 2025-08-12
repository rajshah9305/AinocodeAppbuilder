import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { deploymentEngine } from "@/lib/deployment/engine"

export async function GET(request: NextRequest, { params }: { params: { deploymentId: string } }) {
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

    const { deploymentId } = params

    // Verify deployment ownership
    const { data: deployment, error: deploymentError } = await supabase
      .from("deployments")
      .select("*, projects!inner(user_id, name, type)")
      .eq("id", deploymentId)
      .eq("projects.user_id", user.id)
      .single()

    if (deploymentError || !deployment) {
      return NextResponse.json({ error: "Deployment not found" }, { status: 404 })
    }

    // Get analytics
    const { data: analytics } = await supabase
      .from("analytics")
      .select("*")
      .eq("deployment_id", deploymentId)
      .order("date", { ascending: false })
      .limit(30)

    return NextResponse.json({
      success: true,
      data: {
        ...deployment,
        analytics: analytics || [],
      },
    })
  } catch (error) {
    console.error("Get deployment error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch deployment",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: { deploymentId: string } }) {
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

    const { deploymentId } = params
    const body = await request.json()

    // Verify deployment ownership
    const { data: deployment, error: deploymentError } = await supabase
      .from("deployments")
      .select("*, projects!inner(user_id)")
      .eq("id", deploymentId)
      .eq("projects.user_id", user.id)
      .single()

    if (deploymentError || !deployment) {
      return NextResponse.json({ error: "Deployment not found" }, { status: 404 })
    }

    // Update deployment
    await deploymentEngine.updateDeployment(deploymentId, body)

    return NextResponse.json({
      success: true,
      message: "Deployment updated successfully",
    })
  } catch (error) {
    console.error("Update deployment error:", error)
    return NextResponse.json(
      {
        error: "Failed to update deployment",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { deploymentId: string } }) {
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

    const { deploymentId } = params

    // Verify deployment ownership
    const { data: deployment, error: deploymentError } = await supabase
      .from("deployments")
      .select("*, projects!inner(user_id)")
      .eq("id", deploymentId)
      .eq("projects.user_id", user.id)
      .single()

    if (deploymentError || !deployment) {
      return NextResponse.json({ error: "Deployment not found" }, { status: 404 })
    }

    // Stop deployment
    await deploymentEngine.stopDeployment(deploymentId)

    return NextResponse.json({
      success: true,
      message: "Deployment stopped successfully",
    })
  } catch (error) {
    console.error("Stop deployment error:", error)
    return NextResponse.json(
      {
        error: "Failed to stop deployment",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
