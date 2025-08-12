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
    const dataSourceId = formData.get("dataSourceId") as string
    const type = formData.get("type") as string
    const config = JSON.parse((formData.get("config") as string) || "{}")

    // Verify data source ownership
    const { data: dataSource, error: dsError } = await supabase
      .from("data_sources")
      .select("*, projects!inner(user_id)")
      .eq("id", dataSourceId)
      .single()

    if (dsError || !dataSource || dataSource.projects.user_id !== user.id) {
      return NextResponse.json({ error: "Data source not found" }, { status: 404 })
    }

    // Update status to processing
    await supabase.from("data_sources").update({ status: "processing" }).eq("id", dataSourceId)

    let processingResult
    const processor = getDataProcessor(type)

    try {
      switch (type) {
        case "csv":
        case "json":
        case "text": {
          const file = formData.get("file") as File
          if (!file) {
            throw new Error("No file provided")
          }
          const content = await file.text()
          processingResult = await processor.process(content, config)
          break
        }
        case "api": {
          processingResult = await processor.process(config)
          break
        }
        default:
          throw new Error(`Unsupported data source type: ${type}`)
      }

      if (!processingResult.success) {
        throw new Error(`Processing failed: ${processingResult.errors.join(", ")}`)
      }

      // Store processed records (in a real implementation, you'd store these in a separate table)
      const recordsToStore = processingResult.records.map((record) => ({
        data_source_id: dataSourceId,
        content: record.content,
        metadata: record.metadata,
        processed_at: record.processed_at,
      }))

      // Update data source with results
      await supabase
        .from("data_sources")
        .update({
          status: "ready",
          row_count: processingResult.totalRecords,
          source_config: {
            ...dataSource.source_config,
            processing_metadata: processingResult.metadata,
            processed_at: new Date().toISOString(),
          },
        })
        .eq("id", dataSourceId)

      return NextResponse.json({
        success: true,
        data: {
          totalRecords: processingResult.totalRecords,
          errors: processingResult.errors,
          metadata: processingResult.metadata,
          sampleRecords: processingResult.records.slice(0, 3),
        },
      })
    } catch (processingError) {
      // Update status to error
      await supabase
        .from("data_sources")
        .update({
          status: "error",
          source_config: {
            ...dataSource.source_config,
            error: processingError instanceof Error ? processingError.message : "Processing failed",
          },
        })
        .eq("id", dataSourceId)

      throw processingError
    }
  } catch (error) {
    console.error("Data processing error:", error)
    return NextResponse.json(
      {
        error: "Data processing failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
