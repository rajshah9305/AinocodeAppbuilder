import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Brain, Calendar, ExternalLink, Settings } from "lucide-react"
import Link from "next/link"

interface Project {
  id: string
  name: string
  description: string | null
  type: string
  status: string
  created_at: string
}

interface ProjectGridProps {
  projects: Project[]
}

const projectTypeLabels: Record<string, string> = {
  sentiment_analysis: "Sentiment Analysis",
  text_classification: "Text Classification",
  named_entity_recognition: "Named Entity Recognition",
  text_summarization: "Text Summarization",
  question_answering: "Question Answering",
  chatbot: "Chatbot",
  content_generation: "Content Generation",
  custom: "Custom",
}

const statusColors: Record<string, string> = {
  draft: "bg-gray-500",
  building: "bg-yellow-500",
  deployed: "bg-green-500",
  error: "bg-red-500",
}

export default function ProjectGrid({ projects }: ProjectGridProps) {
  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No projects yet</h3>
        <p className="text-gray-400 mb-6">Create your first AI application to get started</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <Card
          key={project.id}
          className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors"
        >
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle className="text-white text-lg mb-2">{project.name}</CardTitle>
                <CardDescription className="text-gray-300 mb-3">
                  {project.description || "No description provided"}
                </CardDescription>
              </div>
              <Badge className={`${statusColors[project.status]} text-white text-xs`}>{project.status}</Badge>
            </div>
            <div className="flex items-center text-sm text-gray-400">
              <Calendar className="h-4 w-4 mr-1" />
              {new Date(project.created_at).toLocaleDateString()}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <Badge variant="outline" className="border-purple-400 text-purple-400">
                {projectTypeLabels[project.type] || project.type}
              </Badge>
              <div className="flex space-x-2">
                <Link href={`/projects/${project.id}`}>
                  <Button size="sm" variant="ghost" className="text-gray-300 hover:text-white hover:bg-white/10">
                    <Settings className="h-4 w-4" />
                  </Button>
                </Link>
                {project.status === "deployed" && (
                  <Button size="sm" variant="ghost" className="text-gray-300 hover:text-white hover:bg-white/10">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
