// AI Model configuration and clients
export interface AIModel {
  id: string
  name: string
  provider: "cerebras" | "sambanova"
  description: string
  maxTokens: number
  supportedTasks: string[]
  responseTime: string
  accuracy: string
}

export const availableModels: AIModel[] = [
  {
    id: "cerebras-llama-3.1-8b",
    name: "Cerebras Llama 3.1 8B",
    provider: "cerebras",
    description: "Ultra-fast inference with industry-leading performance",
    maxTokens: 8192,
    supportedTasks: [
      "sentiment_analysis",
      "text_classification",
      "named_entity_recognition",
      "text_summarization",
      "question_answering",
      "content_generation",
    ],
    responseTime: "~50ms",
    accuracy: "High",
  },
  {
    id: "cerebras-llama-3.1-70b",
    name: "Cerebras Llama 3.1 70B",
    provider: "cerebras",
    description: "Powerful model with exceptional speed and accuracy",
    maxTokens: 8192,
    supportedTasks: [
      "sentiment_analysis",
      "text_classification",
      "named_entity_recognition",
      "text_summarization",
      "question_answering",
      "content_generation",
      "chatbot",
    ],
    responseTime: "~100ms",
    accuracy: "Very High",
  },
  {
    id: "sambanova-meta-llama-3.1-8b",
    name: "SambaNova Meta Llama 3.1 8B",
    provider: "sambanova",
    description: "Advanced AI with superior accuracy and reasoning",
    maxTokens: 4096,
    supportedTasks: [
      "sentiment_analysis",
      "text_classification",
      "named_entity_recognition",
      "text_summarization",
      "question_answering",
      "content_generation",
    ],
    responseTime: "~80ms",
    accuracy: "High",
  },
  {
    id: "sambanova-meta-llama-3.1-70b",
    name: "SambaNova Meta Llama 3.1 70B",
    provider: "sambanova",
    description: "Premium model for complex reasoning and analysis",
    maxTokens: 4096,
    supportedTasks: [
      "sentiment_analysis",
      "text_classification",
      "named_entity_recognition",
      "text_summarization",
      "question_answering",
      "content_generation",
      "chatbot",
    ],
    responseTime: "~150ms",
    accuracy: "Exceptional",
  },
]

export function getModelById(modelId: string): AIModel | undefined {
  return availableModels.find((model) => model.id === modelId)
}

export function getModelsByTask(task: string): AIModel[] {
  return availableModels.filter((model) => model.supportedTasks.includes(task))
}

export function getRecommendedModel(task: string): AIModel {
  const taskModels = getModelsByTask(task)

  // Recommend Cerebras for speed-critical tasks
  if (["sentiment_analysis", "text_classification"].includes(task)) {
    return taskModels.find((m) => m.provider === "cerebras") || taskModels[0]
  }

  // Recommend SambaNova for complex reasoning tasks
  if (["question_answering", "chatbot"].includes(task)) {
    return taskModels.find((m) => m.provider === "sambanova") || taskModels[0]
  }

  // Default to fastest model
  return taskModels[0]
}
