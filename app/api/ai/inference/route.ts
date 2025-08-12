import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { taskHandler } from "@/lib/ai/task-handlers"
import { getRecommendedModel } from "@/lib/ai/models"

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
    const { projectId, taskType, input, config = {} } = body

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

    // Get model configuration
    const modelId = config.modelId || getRecommendedModel(taskType).id
    const taskConfig = {
      modelId,
      temperature: config.temperature || 0.7,
      maxTokens: config.maxTokens || 2048,
      ...config,
    }

    let result
    switch (taskType) {
      case "sentiment_analysis":
        result = await taskHandler.executeSentimentAnalysis(input.text, taskConfig)
        break

      case "text_classification":
        result = await taskHandler.executeTextClassification(
          input.text,
          input.categories || ["positive", "negative", "neutral"],
          taskConfig,
        )
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
        return NextResponse.json({ error: "Unsupported task type" }, { status: 400 })
    }

    // Log the inference request
    await supabase.from("analytics").upsert(
      {
        deployment_id: projectId, // Using project ID as deployment ID for now
        request_count: 1,
        success_count: 1,
        avg_response_time: result.processingTime,
        date: new Date().toISOString().split("T")[0],
      },
      {
        onConflict: "deployment_id,date",
      },
    )

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("AI inference error:", error)

    // Log error analytics
    try {
      const supabase = createClient()
      const body = await request.json()
      await supabase.from("analytics").upsert(
        {
          deployment_id: body.projectId,
          request_count: 1,
          error_count: 1,
          date: new Date().toISOString().split("T")[0],
        },
        {
          onConflict: "deployment_id,date",
        },
      )
    } catch (logError) {
      console.error("Failed to log error analytics:", logError)
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
