import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Users, Zap, AlertTriangle } from "lucide-react"

interface AnalyticsOverviewProps {
  analytics: any[]
  projects: any[]
}

export default function AnalyticsOverview({ analytics, projects }: AnalyticsOverviewProps) {
  const totalRequests = analytics.length
  const totalProjects = projects.length
  const deployedProjects = projects.filter((p) => p.deployments?.some((d: any) => d.status === "active")).length
  const avgResponseTime =
    analytics.length > 0
      ? Math.round(analytics.reduce((sum, a) => sum + (a.response_time || 0), 0) / analytics.length)
      : 0
  const errorRate =
    analytics.length > 0
      ? Math.round((analytics.filter((a) => a.status === "error").length / analytics.length) * 100)
      : 0

  const metrics = [
    {
      title: "Total Requests",
      value: totalRequests.toLocaleString(),
      icon: Activity,
      change: "+12%",
      changeType: "positive" as const,
    },
    {
      title: "Active Projects",
      value: `${deployedProjects}/${totalProjects}`,
      icon: Users,
      change: "+2",
      changeType: "positive" as const,
    },
    {
      title: "Avg Response Time",
      value: `${avgResponseTime}ms`,
      icon: Zap,
      change: "-5%",
      changeType: "positive" as const,
    },
    {
      title: "Error Rate",
      value: `${errorRate}%`,
      icon: AlertTriangle,
      change: "-0.2%",
      changeType: errorRate > 5 ? ("negative" as const) : ("positive" as const),
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric) => (
        <Card key={metric.title} className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">{metric.title}</CardTitle>
            <metric.icon className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{metric.value}</div>
            <p className={`text-xs ${metric.changeType === "positive" ? "text-green-400" : "text-red-400"}`}>
              {metric.change} from last month
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
