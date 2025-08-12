import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import DashboardHeader from "@/components/dashboard-header"
import ProjectBuilder from "@/components/project-builder"

interface ProjectPageProps {
  params: {
    id: string
  }
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get the project
  const { data: project, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single()

  if (error || !project) {
    notFound()
  }

  // Get project data sources
  const { data: dataSources } = await supabase
    .from("data_sources")
    .select("*")
    .eq("project_id", project.id)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <DashboardHeader user={user} />
      <ProjectBuilder project={project} dataSources={dataSources || []} />
    </div>
  )
}
