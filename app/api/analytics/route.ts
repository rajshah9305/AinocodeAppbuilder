import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get("project_id")
    const days = Number.parseInt(searchParams.get("days") || "30")

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    let query = supabase
      .from("analytics")
      .select("*")
      .eq("user_id", user.id)
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: true })

    if (projectId) {
      query = query.eq("project_id", projectId)
    }

    const { data: analytics, error } = await query

    if (error) {
      console.error("Error fetching analytics:", error)
      return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
    }

    return NextResponse.json({ analytics })
  } catch (error) {
    console.error("Analytics API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()

    const { project_id, deployment_id, endpoint, method, status, response_time, user_id } = body

    const { data, error } = await supabase
      .from("analytics")
      .insert({
        project_id,
        deployment_id,
        endpoint,
        method,
        status,
        response_time,
        user_id,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating analytics record:", error)
      return NextResponse.json({ error: "Failed to create analytics record" }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Analytics creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
