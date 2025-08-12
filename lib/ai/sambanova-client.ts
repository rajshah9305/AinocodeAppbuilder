// SambaNova AI client implementation
export interface SambaNovaConfig {
  apiKey: string
  baseUrl?: string
}

export interface SambaNovaRequest {
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

export interface SambaNovaResponse {
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

export class SambaNovaClient {
  private apiKey: string
  private baseUrl: string

  constructor(config: SambaNovaConfig) {
    this.apiKey = config.apiKey
    this.baseUrl = config.baseUrl || "https://api.sambanova.ai/v1"
  }

  async chat(request: SambaNovaRequest): Promise<SambaNovaResponse> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      throw new Error(`SambaNova API error: ${response.status} ${response.statusText}`)
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
    const request: SambaNovaRequest = {
      model: options.model || "Meta-Llama-3.1-8B-Instruct",
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
let sambaNovaClient: SambaNovaClient | null = null

export function getSambaNovaClient(): SambaNovaClient {
  if (!sambaNovaClient) {
    const apiKey = process.env.SAMBANOVA_API_KEY
    if (!apiKey) {
      throw new Error("SAMBANOVA_API_KEY environment variable is required")
    }
    sambaNovaClient = new SambaNovaClient({ apiKey })
  }
  return sambaNovaClient
}
