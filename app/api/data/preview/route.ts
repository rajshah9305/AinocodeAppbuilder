import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getDataProcessor } from "@/lib/data/processors"

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

    const formData = await request.formData()
    const type = formData.get("type") as string
    const config = JSON.parse((formData.get("config") as string) || "{}")

    const processor = getDataProcessor(type)
    let previewResult

    switch (type) {
      case "csv":
      case "json":
      case "text": {
        const file = formData.get("file") as File
        if (!file) {
          throw new Error("No file provided")
        }

        // For preview, only process first part of the file
        const content = await file.text()
        const previewContent = content.length > 10000 ? content.substring(0, 10000) : content

        previewResult = await processor.process(previewContent, config)
        break
      }
      case "api": {
        previewResult = await processor.process(config)
        // Limit preview to first 10 records
        previewResult.records = previewResult.records.slice(0, 10)
        break
      }
      default:
        throw new Error(`Unsupported data source type: ${type}`)
    }

    return NextResponse.json({
      success: true,
      data: {
        totalRecords: previewResult.totalRecords,
        previewRecords: previewResult.records.slice(0, 5),
        metadata: previewResult.metadata,
        errors: previewResult.errors.slice(0, 5), // Limit errors shown
        isPreview: true,
      },
    })
  } catch (error) {
    console.error("Data preview error:", error)
    return NextResponse.json(
      {
        error: "Data preview failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
