import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { availableModels, getModelsByTask, getRecommendedModel } from "@/lib/ai/models"

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
    const task = searchParams.get("task")
    const recommended = searchParams.get("recommended") === "true"

    let models = availableModels

    if (task) {
      models = getModelsByTask(task)
    }

    const response = {
      models,
      recommended: task ? getRecommendedModel(task) : null,
      total: models.length,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Models API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
