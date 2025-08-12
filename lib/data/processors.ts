// Data processing utilities for different data source types
export interface DataRecord {
  id: string
  content: string
  metadata: Record<string, any>
  processed_at: string
}

export interface ProcessingResult {
  success: boolean
  records: DataRecord[]
  totalRecords: number
  errors: string[]
  metadata: {
    columns?: string[]
    dataTypes?: Record<string, string>
    sampleData?: any[]
  }
}

export interface DataProcessor {
  process(data: any, config: any): Promise<ProcessingResult>
  validate(data: any): boolean
  getSchema(data: any): Record<string, string>
}

export class CSVProcessor implements DataProcessor {
  async process(csvContent: string, config: any = {}): Promise<ProcessingResult> {
    try {
      const lines = csvContent.trim().split("\n")
      if (lines.length === 0) {
        return {
          success: false,
          records: [],
          totalRecords: 0,
          errors: ["Empty CSV file"],
          metadata: {},
        }
      }

      // Parse header
      const headers = this.parseCSVLine(lines[0])
      const textColumn =
        config.textColumn ||
        headers.find(
          (h) =>
            h.toLowerCase().includes("text") ||
            h.toLowerCase().includes("content") ||
            h.toLowerCase().includes("message"),
        ) ||
        headers[0]

      const records: DataRecord[] = []
      const errors: string[] = []

      // Process data rows
      for (let i = 1; i < lines.length; i++) {
        try {
          const values = this.parseCSVLine(lines[i])
          if (values.length !== headers.length) {
            errors.push(`Row ${i + 1}: Column count mismatch`)
            continue
          }

          const rowData: Record<string, any> = {}
          headers.forEach((header, index) => {
            rowData[header] = values[index]
          })

          const content = rowData[textColumn] || ""
          if (!content.trim()) {
            errors.push(`Row ${i + 1}: Empty content in text column`)
            continue
          }

          records.push({
            id: `csv_${i}_${Date.now()}`,
            content: content.trim(),
            metadata: {
              ...rowData,
              sourceRow: i + 1,
              textColumn,
            },
            processed_at: new Date().toISOString(),
          })
        } catch (error) {
          errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : "Parse error"}`)
        }
      }

      return {
        success: records.length > 0,
        records,
        totalRecords: records.length,
        errors,
        metadata: {
          columns: headers,
          dataTypes: this.getSchema(records),
          sampleData: records.slice(0, 5).map((r) => r.metadata),
        },
      }
    } catch (error) {
      return {
        success: false,
        records: [],
        totalRecords: 0,
        errors: [error instanceof Error ? error.message : "Unknown error"],
        metadata: {},
      }
    }
  }

  private parseCSVLine(line: string): string[] {
    const result: string[] = []
    let current = ""
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]

      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === "," && !inQuotes) {
        result.push(current.trim())
        current = ""
      } else {
        current += char
      }
    }

    result.push(current.trim())
    return result
  }

  validate(data: string): boolean {
    return typeof data === "string" && data.trim().length > 0
  }

  getSchema(records: DataRecord[]): Record<string, string> {
    if (records.length === 0) return {}

    const sample = records[0].metadata
    const schema: Record<string, string> = {}

    Object.keys(sample).forEach((key) => {
      const value = sample[key]
      if (typeof value === "number") {
        schema[key] = "number"
      } else if (typeof value === "boolean") {
        schema[key] = "boolean"
      } else {
        schema[key] = "string"
      }
    })

    return schema
  }
}

export class JSONProcessor implements DataProcessor {
  async process(jsonContent: string, config: any = {}): Promise<ProcessingResult> {
    try {
      const data = JSON.parse(jsonContent)
      const records: DataRecord[] = []
      const errors: string[] = []

      if (Array.isArray(data)) {
        // Array of objects
        data.forEach((item, index) => {
          try {
            const content = this.extractTextContent(item, config.textField)
            if (content) {
              records.push({
                id: `json_${index}_${Date.now()}`,
                content: content.trim(),
                metadata: {
                  ...item,
                  sourceIndex: index,
                },
                processed_at: new Date().toISOString(),
              })
            } else {
              errors.push(`Item ${index}: No text content found`)
            }
          } catch (error) {
            errors.push(`Item ${index}: ${error instanceof Error ? error.message : "Parse error"}`)
          }
        })
      } else if (typeof data === "object") {
        // Single object or nested structure
        const content = this.extractTextContent(data, config.textField)
        if (content) {
          records.push({
            id: `json_single_${Date.now()}`,
            content: content.trim(),
            metadata: data,
            processed_at: new Date().toISOString(),
          })
        } else {
          errors.push("No text content found in JSON object")
        }
      }

      return {
        success: records.length > 0,
        records,
        totalRecords: records.length,
        errors,
        metadata: {
          dataTypes: this.getSchema(records),
          sampleData: records.slice(0, 5).map((r) => r.metadata),
        },
      }
    } catch (error) {
      return {
        success: false,
        records: [],
        totalRecords: 0,
        errors: [error instanceof Error ? error.message : "Invalid JSON"],
        metadata: {},
      }
    }
  }

  private extractTextContent(obj: any, textField?: string): string {
    if (textField && obj[textField]) {
      return String(obj[textField])
    }

    // Try common text field names
    const textFields = ["text", "content", "message", "description", "body", "title"]
    for (const field of textFields) {
      if (obj[field] && typeof obj[field] === "string") {
        return obj[field]
      }
    }

    // If no specific field, concatenate string values
    const stringValues = Object.values(obj).filter((value) => typeof value === "string" && value.trim().length > 0)

    return stringValues.join(" ")
  }

  validate(data: string): boolean {
    try {
      JSON.parse(data)
      return true
    } catch {
      return false
    }
  }

  getSchema(records: DataRecord[]): Record<string, string> {
    if (records.length === 0) return {}

    const sample = records[0].metadata
    const schema: Record<string, string> = {}

    Object.keys(sample).forEach((key) => {
      const value = sample[key]
      if (typeof value === "number") {
        schema[key] = "number"
      } else if (typeof value === "boolean") {
        schema[key] = "boolean"
      } else if (Array.isArray(value)) {
        schema[key] = "array"
      } else if (typeof value === "object") {
        schema[key] = "object"
      } else {
        schema[key] = "string"
      }
    })

    return schema
  }
}

export class TextProcessor implements DataProcessor {
  async process(textContent: string, config: any = {}): Promise<ProcessingResult> {
    try {
      const chunkSize = config.chunkSize || 1000
      const overlap = config.overlap || 100

      const records: DataRecord[] = []
      const errors: string[] = []

      if (config.splitBy === "paragraph") {
        // Split by paragraphs
        const paragraphs = textContent.split(/\n\s*\n/).filter((p) => p.trim().length > 0)
        paragraphs.forEach((paragraph, index) => {
          records.push({
            id: `text_para_${index}_${Date.now()}`,
            content: paragraph.trim(),
            metadata: {
              type: "paragraph",
              index,
              wordCount: paragraph.trim().split(/\s+/).length,
            },
            processed_at: new Date().toISOString(),
          })
        })
      } else if (config.splitBy === "sentence") {
        // Split by sentences
        const sentences = textContent.split(/[.!?]+/).filter((s) => s.trim().length > 0)
        sentences.forEach((sentence, index) => {
          records.push({
            id: `text_sent_${index}_${Date.now()}`,
            content: sentence.trim(),
            metadata: {
              type: "sentence",
              index,
              wordCount: sentence.trim().split(/\s+/).length,
            },
            processed_at: new Date().toISOString(),
          })
        })
      } else {
        // Split by chunks with overlap
        for (let i = 0; i < textContent.length; i += chunkSize - overlap) {
          const chunk = textContent.slice(i, i + chunkSize)
          if (chunk.trim().length > 0) {
            records.push({
              id: `text_chunk_${i}_${Date.now()}`,
              content: chunk.trim(),
              metadata: {
                type: "chunk",
                startIndex: i,
                endIndex: i + chunk.length,
                wordCount: chunk.trim().split(/\s+/).length,
              },
              processed_at: new Date().toISOString(),
            })
          }
        }
      }

      return {
        success: records.length > 0,
        records,
        totalRecords: records.length,
        errors,
        metadata: {
          originalLength: textContent.length,
          totalWords: textContent.split(/\s+/).length,
          splitMethod: config.splitBy || "chunk",
          chunkSize: config.splitBy === "chunk" ? chunkSize : undefined,
        },
      }
    } catch (error) {
      return {
        success: false,
        records: [],
        totalRecords: 0,
        errors: [error instanceof Error ? error.message : "Text processing error"],
        metadata: {},
      }
    }
  }

  validate(data: string): boolean {
    return typeof data === "string" && data.trim().length > 0
  }

  getSchema(): Record<string, string> {
    return {
      type: "string",
      index: "number",
      wordCount: "number",
    }
  }
}

export class APIProcessor implements DataProcessor {
  async process(apiConfig: any): Promise<ProcessingResult> {
    try {
      const { url, method = "GET", headers = {}, apiKey, dataPath } = apiConfig

      const requestHeaders: Record<string, string> = {
        "Content-Type": "application/json",
        ...headers,
      }

      if (apiKey) {
        requestHeaders["Authorization"] = `Bearer ${apiKey}`
      }

      const response = await fetch(url, {
        method,
        headers: requestHeaders,
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      let items = data

      // Navigate to specific data path if provided
      if (dataPath) {
        const pathParts = dataPath.split(".")
        for (const part of pathParts) {
          items = items[part]
          if (!items) break
        }
      }

      if (!Array.isArray(items)) {
        items = [items]
      }

      const records: DataRecord[] = []
      const errors: string[] = []

      items.forEach((item: any, index: number) => {
        try {
          const content = this.extractTextContent(item, apiConfig.textField)
          if (content) {
            records.push({
              id: `api_${index}_${Date.now()}`,
              content: content.trim(),
              metadata: {
                ...item,
                sourceIndex: index,
                apiUrl: url,
              },
              processed_at: new Date().toISOString(),
            })
          } else {
            errors.push(`Item ${index}: No text content found`)
          }
        } catch (error) {
          errors.push(`Item ${index}: ${error instanceof Error ? error.message : "Parse error"}`)
        }
      })

      return {
        success: records.length > 0,
        records,
        totalRecords: records.length,
        errors,
        metadata: {
          apiUrl: url,
          dataPath,
          sampleData: records.slice(0, 5).map((r) => r.metadata),
        },
      }
    } catch (error) {
      return {
        success: false,
        records: [],
        totalRecords: 0,
        errors: [error instanceof Error ? error.message : "API processing error"],
        metadata: {},
      }
    }
  }

  private extractTextContent(obj: any, textField?: string): string {
    if (textField && obj[textField]) {
      return String(obj[textField])
    }

    const textFields = ["text", "content", "message", "description", "body", "title", "name"]
    for (const field of textFields) {
      if (obj[field] && typeof obj[field] === "string") {
        return obj[field]
      }
    }

    const stringValues = Object.values(obj).filter((value) => typeof value === "string" && value.trim().length > 0)

    return stringValues.join(" ")
  }

  validate(config: any): boolean {
    return config && typeof config.url === "string" && config.url.startsWith("http")
  }

  getSchema(records: DataRecord[]): Record<string, string> {
    if (records.length === 0) return {}

    const sample = records[0].metadata
    const schema: Record<string, string> = {}

    Object.keys(sample).forEach((key) => {
      const value = sample[key]
      if (typeof value === "number") {
        schema[key] = "number"
      } else if (typeof value === "boolean") {
        schema[key] = "boolean"
      } else if (Array.isArray(value)) {
        schema[key] = "array"
      } else if (typeof value === "object") {
        schema[key] = "object"
      } else {
        schema[key] = "string"
      }
    })

    return schema
  }
}

// Factory function to get the appropriate processor
export function getDataProcessor(type: string): DataProcessor {
  switch (type) {
    case "csv":
      return new CSVProcessor()
    case "json":
      return new JSONProcessor()
    case "text":
      return new TextProcessor()
    case "api":
      return new APIProcessor()
    default:
      throw new Error(`Unsupported data source type: ${type}`)
  }
}
