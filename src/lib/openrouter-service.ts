import {
  OPENROUTER_CONFIG,
  OpenRouterMessage,
  OpenRouterRequest,
  OpenRouterResponse,
} from "./openrouter";

export class OpenRouterService {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.baseUrl = OPENROUTER_CONFIG.apiUrl;
  }
  async sendMessage(
    messages: OpenRouterMessage[],
    model: string = OPENROUTER_CONFIG.defaultModel,
    options: {
      temperature?: number;
      maxTokens?: number;
      stream?: boolean;
    } = {}
  ): Promise<string> {
    const { temperature = 0.0, maxTokens = 0, stream = false } = options;

    const request: OpenRouterRequest = {
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream,
    };

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": window.location.origin,
          "X-Title": "ChatBot UI Clone",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Unknown error" }));

        console.error("OpenRouter API Error Details:", errorData);

        // Handle different error response formats
        const errorMessage =
          errorData.error?.message ||
          errorData.message ||
          errorData.error ||
          JSON.stringify(errorData) ||
          "Request failed";

        throw new Error(
          `OpenRouter API error: ${response.status} - ${errorMessage}`
        );
      }

      const data: OpenRouterResponse = await response.json();

      if (!data.choices || data.choices.length === 0) {
        throw new Error("No response from OpenRouter API");
      }

      return data.choices[0].message.content;
    } catch (error) {
      console.error("OpenRouter API Error:", error);

      // Fallback to a different model if the primary fails
      if (model !== OPENROUTER_CONFIG.fallbackModel) {
        console.log("Attempting fallback with free model...");
        return this.sendMessage(
          messages,
          OPENROUTER_CONFIG.fallbackModel,
          options
        );
      }

      throw error;
    }
  }
  async sendMessageStream(
    messages: OpenRouterMessage[],
    model: string = OPENROUTER_CONFIG.defaultModel,
    onChunk: (chunk: string) => void,
    options: {
      temperature?: number;
      maxTokens?: number;
    } = {}
  ): Promise<void> {
    const { temperature = 0.0, maxTokens = 0 } = options;

    const request: OpenRouterRequest = {
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: true,
    };

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": window.location.origin,
          "X-Title": "ChatBot UI Clone",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Unknown error" }));
        throw new Error(
          `OpenRouter API error: ${response.status} - ${errorData.error || "Request failed"}`
        );
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response stream available");
      }

      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6).trim();
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                onChunk(content);
              }
            } catch {
              // Skip invalid JSON chunks
              continue;
            }
          }
        }
      }
    } catch (error) {
      console.error("OpenRouter Streaming Error:", error);
      throw error;
    }
  }
}
