"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Area, AreaChart, Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

interface AnalyticsChartsProps {
  analytics: any[]
}

export default function AnalyticsCharts({ analytics }: AnalyticsChartsProps) {
  // Process data for charts
  const dailyUsage = analytics.reduce(
    (acc, item) => {
      const date = new Date(item.created_at).toLocaleDateString()
      acc[date] = (acc[date] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const usageData = Object.entries(dailyUsage)
    .map(([date, requests]) => ({
      date,
      requests,
    }))
    .slice(-7) // Last 7 days

  const responseTimeData = analytics
    .filter((a) => a.response_time)
    .slice(-20)
    .map((item, index) => ({
      request: index + 1,
      responseTime: item.response_time,
    }))

  const chartConfig = {
    requests: {
      label: "Requests",
      color: "hsl(var(--chart-1))",
    },
    responseTime: {
      label: "Response Time (ms)",
      color: "hsl(var(--chart-2))",
    },
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Daily Usage</CardTitle>
          <CardDescription className="text-gray-400">API requests over the last 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={usageData}>
                <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <Area
                  dataKey="requests"
                  type="monotone"
                  fill="url(#colorRequests)"
                  fillOpacity={0.6}
                  stroke="#8B5CF6"
                  strokeWidth={2}
                />
                <defs>
                  <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Response Times</CardTitle>
          <CardDescription className="text-gray-400">Latest 20 API response times</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={responseTimeData}>
                <XAxis dataKey="request" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <Bar dataKey="responseTime" fill="#10B981" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
