// NLP task handlers for different AI applications
import { getCerebrasClient } from "./cerebras-client"
import { getSambaNovaClient } from "./sambanova-client"
import { getModelById } from "./models"

export interface TaskResult {
  result: any
  confidence?: number
  processingTime: number
  model: string
}

export interface TaskConfig {
  modelId: string
  temperature?: number
  maxTokens?: number
}

export class TaskHandler {
  async executeSentimentAnalysis(text: string, config: TaskConfig): Promise<TaskResult> {
    const startTime = Date.now()
    const model = getModelById(config.modelId)

    if (!model) {
      throw new Error(`Model ${config.modelId} not found`)
    }

    const prompt = `Analyze the sentiment of the following text. Respond with a JSON object containing:
- sentiment: "positive", "negative", or "neutral"
- confidence: a number between 0 and 1
- reasoning: brief explanation

Text: "${text}"

Response:`

    let result: string
    if (model.provider === "cerebras") {
      const client = getCerebrasClient()
      result = await client.generateText(prompt, {
        model: model.id.split("-").slice(-2).join("-"),
        temperature: config.temperature || 0.3,
        maxTokens: config.maxTokens || 500,
      })
    } else {
      const client = getSambaNovaClient()
      result = await client.generateText(prompt, {
        model: model.id.split("-").slice(-3).join("-"),
        temperature: config.temperature || 0.3,
        maxTokens: config.maxTokens || 500,
      })
    }

    const processingTime = Date.now() - startTime

    try {
      const parsed = JSON.parse(result.trim())
      return {
        result: {
          sentiment: parsed.sentiment,
          reasoning: parsed.reasoning,
        },
        confidence: parsed.confidence,
        processingTime,
        model: model.id,
      }
    } catch (error) {
      // Fallback parsing if JSON is malformed
      const sentiment = result.toLowerCase().includes("positive")
        ? "positive"
        : result.toLowerCase().includes("negative")
          ? "negative"
          : "neutral"

      return {
        result: {
          sentiment,
          reasoning: result.trim(),
        },
        confidence: 0.8,
        processingTime,
        model: model.id,
      }
    }
  }

  async executeTextClassification(text: string, categories: string[], config: TaskConfig): Promise<TaskResult> {
    const startTime = Date.now()
    const model = getModelById(config.modelId)

    if (!model) {
      throw new Error(`Model ${config.modelId} not found`)
    }

    const prompt = `Classify the following text into one of these categories: ${categories.join(", ")}.
Respond with a JSON object containing:
- category: the most appropriate category
- confidence: a number between 0 and 1
- reasoning: brief explanation

Text: "${text}"

Response:`

    let result: string
    if (model.provider === "cerebras") {
      const client = getCerebrasClient()
      result = await client.generateText(prompt, {
        model: model.id.split("-").slice(-2).join("-"),
        temperature: config.temperature || 0.3,
        maxTokens: config.maxTokens || 500,
      })
    } else {
      const client = getSambaNovaClient()
      result = await client.generateText(prompt, {
        model: model.id.split("-").slice(-3).join("-"),
        temperature: config.temperature || 0.3,
        maxTokens: config.maxTokens || 500,
      })
    }

    const processingTime = Date.now() - startTime

    try {
      const parsed = JSON.parse(result.trim())
      return {
        result: {
          category: parsed.category,
          reasoning: parsed.reasoning,
        },
        confidence: parsed.confidence,
        processingTime,
        model: model.id,
      }
    } catch (error) {
      // Fallback parsing
      const category = categories.find((cat) => result.toLowerCase().includes(cat.toLowerCase())) || categories[0]

      return {
        result: {
          category,
          reasoning: result.trim(),
        },
        confidence: 0.7,
        processingTime,
        model: model.id,
      }
    }
  }

  async executeTextSummarization(text: string, config: TaskConfig & { maxLength?: number }): Promise<TaskResult> {
    const startTime = Date.now()
    const model = getModelById(config.modelId)

    if (!model) {
      throw new Error(`Model ${config.modelId} not found`)
    }

    const maxLength = config.maxLength || 150
    const prompt = `Summarize the following text in approximately ${maxLength} words. Make it concise and capture the key points.

Text: "${text}"

Summary:`

    let result: string
    if (model.provider === "cerebras") {
      const client = getCerebrasClient()
      result = await client.generateText(prompt, {
        model: model.id.split("-").slice(-2).join("-"),
        temperature: config.temperature || 0.5,
        maxTokens: config.maxTokens || Math.ceil(maxLength * 1.5),
      })
    } else {
      const client = getSambaNovaClient()
      result = await client.generateText(prompt, {
        model: model.id.split("-").slice(-3).join("-"),
        temperature: config.temperature || 0.5,
        maxTokens: config.maxTokens || Math.ceil(maxLength * 1.5),
      })
    }

    const processingTime = Date.now() - startTime

    return {
      result: {
        summary: result.trim(),
        originalLength: text.length,
        summaryLength: result.trim().length,
        compressionRatio: Math.round((1 - result.trim().length / text.length) * 100),
      },
      processingTime,
      model: model.id,
    }
  }

  async executeQuestionAnswering(question: string, context: string, config: TaskConfig): Promise<TaskResult> {
    const startTime = Date.now()
    const model = getModelById(config.modelId)

    if (!model) {
      throw new Error(`Model ${config.modelId} not found`)
    }

    const prompt = `Answer the following question based on the provided context. If the answer cannot be found in the context, say "I cannot find the answer in the provided context."

Context: "${context}"

Question: "${question}"

Answer:`

    let result: string
    if (model.provider === "cerebras") {
      const client = getCerebrasClient()
      result = await client.generateText(prompt, {
        model: model.id.split("-").slice(-2).join("-"),
        temperature: config.temperature || 0.3,
        maxTokens: config.maxTokens || 1000,
      })
    } else {
      const client = getSambaNovaClient()
      result = await client.generateText(prompt, {
        model: model.id.split("-").slice(-3).join("-"),
        temperature: config.temperature || 0.3,
        maxTokens: config.maxTokens || 1000,
      })
    }

    const processingTime = Date.now() - startTime

    return {
      result: {
        answer: result.trim(),
        question,
        hasAnswer: !result.toLowerCase().includes("cannot find the answer"),
      },
      processingTime,
      model: model.id,
    }
  }

  async executeContentGeneration(prompt: string, config: TaskConfig & { style?: string }): Promise<TaskResult> {
    const startTime = Date.now()
    const model = getModelById(config.modelId)

    if (!model) {
      throw new Error(`Model ${config.modelId} not found`)
    }

    const style = config.style || "professional"
    const fullPrompt = `Generate content based on the following prompt. Use a ${style} tone and style.

Prompt: "${prompt}"

Generated content:`

    let result: string
    if (model.provider === "cerebras") {
      const client = getCerebrasClient()
      result = await client.generateText(fullPrompt, {
        model: model.id.split("-").slice(-2).join("-"),
        temperature: config.temperature || 0.7,
        maxTokens: config.maxTokens || 2000,
      })
    } else {
      const client = getSambaNovaClient()
      result = await client.generateText(fullPrompt, {
        model: model.id.split("-").slice(-3).join("-"),
        temperature: config.temperature || 0.7,
        maxTokens: config.maxTokens || 2000,
      })
    }

    const processingTime = Date.now() - startTime

    return {
      result: {
        content: result.trim(),
        wordCount: result.trim().split(/\s+/).length,
        style,
      },
      processingTime,
      model: model.id,
    }
  }
}

// Create singleton instance
export const taskHandler = new TaskHandler()
