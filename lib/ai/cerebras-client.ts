// Cerebras AI client implementation
export interface CerebrasConfig {
  apiKey: string
  baseUrl?: string
}

export interface CerebrasRequest {
  model: string
  messages: Array<{
    role: "system" | "user" | "assistant"
    content: string
  }>
  temperature?: number
  max_tokens?: number
  top_p?: number
  stream?: boolean
}

export interface CerebrasResponse {
  id: string
  object: string
  created: number
  model: string
  choices: Array<{
    index: number
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export class CerebrasClient {
  private apiKey: string
  private baseUrl: string

  constructor(config: CerebrasConfig) {
    this.apiKey = config.apiKey
    this.baseUrl = config.baseUrl || "https://api.cerebras.ai/v1"
  }

  async chat(request: CerebrasRequest): Promise<CerebrasResponse> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      throw new Error(`Cerebras API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async generateText(
    prompt: string,
    options: {
      model?: string
      temperature?: number
      maxTokens?: number
    } = {},
  ): Promise<string> {
    const request: CerebrasRequest = {
      model: options.model || "llama3.1-8b",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 2048,
    }

    const response = await this.chat(request)
    return response.choices[0]?.message?.content || ""
  }
}

// Create singleton instance
let cerebrasClient: CerebrasClient | null = null

export function getCerebrasClient(): CerebrasClient {
  if (!cerebrasClient) {
    const apiKey = process.env.CEREBRAS_API_KEY
    if (!apiKey) {
      throw new Error("CEREBRAS_API_KEY environment variable is required")
    }
    cerebrasClient = new CerebrasClient({ apiKey })
  }
  return cerebrasClient
}
