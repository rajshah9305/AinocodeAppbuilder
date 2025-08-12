"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, ArrowLeft, Plus, Database, FileText, Globe, Upload } from "lucide-react"
import AddDataSourceDialog from "@/components/add-data-source-dialog"

interface Project {
  id: string
  name: string
  type: string
}

interface DataSource {
  id: string
  name: string
  type: string
  status: string
  row_count: number
}

interface DataSourceStepProps {
  project: Project
  dataSources: DataSource[]
  onComplete: () => void
  onNext: () => void
  onPrevious: () => void
}

const dataSourceIcons: Record<string, any> = {
  csv: FileText,
  json: FileText,
  text: FileText,
  api: Globe,
  database: Database,
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500",
  processing: "bg-blue-500",
  ready: "bg-green-500",
  error: "bg-red-500",
}

export default function DataSourceStep({ project, dataSources, onComplete, onNext, onPrevious }: DataSourceStepProps) {
  const [showAddDialog, setShowAddDialog] = useState(false)

  const hasReadyDataSources = dataSources.some((ds) => ds.status === "ready")
  const canProceed = hasReadyDataSources

  const handleNext = () => {
    if (canProceed) {
      onComplete()
      onNext()
    }
  }

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <Card className="bg-blue-600/20 border-blue-400/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Database className="h-5 w-5 mr-2" />
            Connect Your Data Sources
          </CardTitle>
          <CardDescription className="text-gray-300">
            Your AI application needs data to work with. Connect at least one data source to continue. We support CSV
            files, JSON data, text documents, APIs, and databases.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Data Sources List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold text-white">Connected Data Sources</h3>
          <AddDataSourceDialog projectId={project.id} open={showAddDialog} onOpenChange={setShowAddDialog}>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Data Source
            </Button>
          </AddDataSourceDialog>
        </div>

        {dataSources.length === 0 ? (
          <Card className="bg-white/5 border-white/10 border-dashed">
            <CardContent className="py-12 text-center">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-white font-semibold mb-2">No data sources connected</h4>
              <p className="text-gray-400 mb-6">Add your first data source to start building your AI application</p>
              <Button onClick={() => setShowAddDialog(true)} className="bg-purple-600 hover:bg-purple-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Data Source
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {dataSources.map((dataSource) => {
              const Icon = dataSourceIcons[dataSource.type] || FileText
              return (
                <Card key={dataSource.id} className="bg-white/5 border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Icon className="h-8 w-8 text-purple-400" />
                        <div>
                          <h4 className="text-white font-medium">{dataSource.name}</h4>
                          <p className="text-gray-400 text-sm capitalize">
                            {dataSource.type} • {dataSource.row_count.toLocaleString()} records
                          </p>
                        </div>
                      </div>
                      <Badge className={`${statusColors[dataSource.status]} text-white`}>{dataSource.status}</Badge>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Requirements Check */}
      {dataSources.length > 0 && (
        <Card
          className={`${canProceed ? "bg-green-600/20 border-green-400/30" : "bg-yellow-600/20 border-yellow-400/30"}`}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-white font-medium">
                  {canProceed ? "✓ Ready to proceed" : "⚠ Waiting for data processing"}
                </h4>
                <p className="text-gray-300 text-sm">
                  {canProceed
                    ? "Your data sources are ready. You can now configure your AI model."
                    : "Please wait for your data sources to finish processing before continuing."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          onClick={onPrevious}
          variant="outline"
          className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        <Button
          onClick={handleNext}
          disabled={!canProceed}
          className="bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue to Model Config
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}
