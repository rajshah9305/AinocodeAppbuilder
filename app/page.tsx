import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, Zap, Database, BarChart3, Rocket, Shield } from "lucide-react"
import Link from "next/link"

export default async function LandingPage() {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If user is logged in, redirect to dashboard
  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-purple-400" />
            <span className="text-2xl font-bold text-white">AI Builder</span>
          </div>
          <div className="space-x-4">
            <Link href="/auth/login">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
          Build AI Apps
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
            {" "}
            Without Code
          </span>
        </h1>
        <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
          Create powerful NLP applications with our guided, prompt-based interface. From sentiment analysis to chatbots,
          deploy AI solutions in minutes.
        </p>
        <div className="space-x-4">
          <Link href="/auth/sign-up">
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 text-lg">
              Start Building Free
            </Button>
          </Link>
          <Button
            size="lg"
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10 px-8 py-4 text-lg bg-transparent"
          >
            View Demo
          </Button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          Everything you need to build AI applications
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <Zap className="h-12 w-12 text-purple-400 mb-4" />
              <CardTitle className="text-white">Guided Interface</CardTitle>
              <CardDescription className="text-gray-300">
                Prompt-based workflow that guides you through building complex AI applications step by step.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <Brain className="h-12 w-12 text-purple-400 mb-4" />
              <CardTitle className="text-white">Advanced AI Models</CardTitle>
              <CardDescription className="text-gray-300">
                Integrated with Cerebras and Sambanova for lightning-fast inference and cutting-edge performance.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <Database className="h-12 w-12 text-purple-400 mb-4" />
              <CardTitle className="text-white">Data Ingestion</CardTitle>
              <CardDescription className="text-gray-300">
                Connect multiple data sources: CSV, JSON, APIs, databases, and more with automatic preprocessing.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <Rocket className="h-12 w-12 text-purple-400 mb-4" />
              <CardTitle className="text-white">One-Click Deploy</CardTitle>
              <CardDescription className="text-gray-300">
                Deploy your AI applications instantly with scalable infrastructure and automatic API generation.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <BarChart3 className="h-12 w-12 text-purple-400 mb-4" />
              <CardTitle className="text-white">Analytics & Monitoring</CardTitle>
              <CardDescription className="text-gray-300">
                Real-time performance metrics, usage analytics, and comprehensive monitoring dashboards.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <Shield className="h-12 w-12 text-purple-400 mb-4" />
              <CardTitle className="text-white">Enterprise Ready</CardTitle>
              <CardDescription className="text-gray-300">
                Built-in security, compliance features, and enterprise-grade infrastructure from day one.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl p-12 border border-white/10">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to build your first AI application?</h2>
          <p className="text-gray-300 mb-8 text-lg">Join thousands of developers already building with AI Builder</p>
          <Link href="/auth/sign-up">
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 text-lg">
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8 text-center text-gray-400">
          <p>&copy; 2024 AI Builder. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
