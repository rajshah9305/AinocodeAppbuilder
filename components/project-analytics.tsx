import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Activity, Clock, AlertCircle } from "lucide-react"

interface ProjectAnalyticsProps {
  projects: any[]
  analytics: any[]
}

export default function ProjectAnalytics({ projects, analytics }: ProjectAnalyticsProps) {
  const projectsWithAnalytics = projects
    .map((project) => {
      const projectAnalytics = analytics.filter((a) => a.project_id === project.id)
      const totalRequests = projectAnalytics.length
      const avgResponseTime =
        projectAnalytics.length > 0
          ? Math.round(projectAnalytics.reduce((sum, a) => sum + (a.response_time || 0), 0) / projectAnalytics.length)
          : 0
      const errorCount = projectAnalytics.filter((a) => a.status === "error").length
      const errorRate = totalRequests > 0 ? Math.round((errorCount / totalRequests) * 100) : 0

      return {
        ...project,
        analytics: {
          totalRequests,
          avgResponseTime,
          errorCount,
          errorRate,
        },
      }
    })
    .filter((p) => p.deployments?.some((d: any) => d.status === "active"))

  if (projectsWithAnalytics.length === 0) {
    return (
      <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No Active Deployments</h3>
            <p className="text-gray-400">Deploy your projects to start seeing analytics data</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white">Project Performance</CardTitle>
        <CardDescription className="text-gray-400">Individual project metrics and health status</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {projectsWithAnalytics.map((project) => (
            <div key={project.id} className="border border-white/10 rounded-lg p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{project.name}</h3>
                  <p className="text-sm text-gray-400">{project.description || "No description"}</p>
                </div>
                <Badge
                  className={`${
                    project.analytics.errorRate > 10
                      ? "bg-red-500"
                      : project.analytics.errorRate > 5
                        ? "bg-yellow-500"
                        : "bg-green-500"
                  } text-white`}
                >
                  {project.analytics.errorRate > 10
                    ? "Unhealthy"
                    : project.analytics.errorRate > 5
                      ? "Warning"
                      : "Healthy"}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3">
                  <Activity className="h-5 w-5 text-purple-400" />
                  <div>
                    <p className="text-sm text-gray-400">Total Requests</p>
                    <p className="text-lg font-semibold text-white">
                      {project.analytics.totalRequests.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-blue-400" />
                  <div>
                    <p className="text-sm text-gray-400">Avg Response Time</p>
                    <p className="text-lg font-semibold text-white">{project.analytics.avgResponseTime}ms</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <div>
                    <p className="text-sm text-gray-400">Error Rate</p>
                    <p className="text-lg font-semibold text-white">{project.analytics.errorRate}%</p>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Health Score</span>
                  <span>{Math.max(0, 100 - project.analytics.errorRate * 2)}%</span>
                </div>
                <Progress value={Math.max(0, 100 - project.analytics.errorRate * 2)} className="h-2" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
