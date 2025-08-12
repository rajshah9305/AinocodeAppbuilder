import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import DashboardHeader from "@/components/dashboard-header"
import AnalyticsOverview from "@/components/analytics-overview"
import AnalyticsCharts from "@/components/analytics-charts"
import ProjectAnalytics from "@/components/project-analytics"

export default async function AnalyticsPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user's projects with deployments
  const { data: projects } = await supabase
    .from("projects")
    .select(`
      *,
      deployments (*)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  // Get analytics data for the last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: analytics } = await supabase
    .from("analytics")
    .select("*")
    .eq("user_id", user.id)
    .gte("created_at", thirtyDaysAgo.toISOString())
    .order("created_at", { ascending: true })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <DashboardHeader user={user} />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Analytics & Monitoring</h1>
          <p className="text-gray-300">Monitor your AI applications' performance and usage</p>
        </div>

        <div className="space-y-8">
          <AnalyticsOverview analytics={analytics || []} projects={projects || []} />
          <AnalyticsCharts analytics={analytics || []} />
          <ProjectAnalytics projects={projects || []} analytics={analytics || []} />
        </div>
      </main>
    </div>
  )
}
