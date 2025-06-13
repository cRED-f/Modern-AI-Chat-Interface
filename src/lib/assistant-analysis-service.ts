import { OpenRouterService } from "./openrouter-service";

export interface AnalysisConfig {
  modelName?: string;
  temperature?: number;
  maxContextLength?: number;
}

export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

export class AssistantAnalysisService {
  private openRouterService: OpenRouterService;

  constructor(apiKey: string) {
    this.openRouterService = new OpenRouterService(apiKey);
  }
  async analyzeConversation(
    conversationHistory: ConversationMessage[],
    assistantPrompt: string,
    config: AnalysisConfig = {}
  ): Promise<string | null> {
    try {
      // Use database values from config, with fallbacks only if not provided
      const {
        modelName = "anthropic/claude-3.5-sonnet:beta", // Fallback if no database value
        temperature = 0.3, // Fallback if no database value
        maxContextLength = 2000, // Fallback if no database value
      } = config;

      console.log("🤖 ASSISTANT MODEL: Starting conversation analysis...");
      console.log(
        `📊 Model: ${modelName} ${config.modelName ? "(from database)" : "(fallback)"}`
      );
      console.log(
        `🌡️ Temperature: ${temperature} ${config.temperature !== undefined ? "(from database)" : "(fallback)"}`
      );
      console.log(
        `📏 Max Context: ${maxContextLength} ${config.maxContextLength !== undefined ? "(from database)" : "(fallback)"}`
      );

      // Prepare messages for assistant analysis
      const analysisMessages = [
        {
          role: "system" as const,
          content: assistantPrompt,
        },
        ...conversationHistory.map((msg) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        })),
      ];

      console.log(
        `📤 Sending ${analysisMessages.length} messages to assistant model`
      );

      // Get analysis from the assistant model
      const analysis = await this.openRouterService.sendMessage(
        analysisMessages,
        modelName,
        {
          temperature,
          maxTokens: maxContextLength,
        }
      );

      if (analysis && analysis.trim()) {
        console.log("✅ Assistant analysis completed successfully");
        console.log(`📝 Analysis length: ${analysis.length} characters`);
        return analysis.trim();
      } else {
        console.log("⚠️ Assistant model returned empty analysis");
        return null;
      }
    } catch (error) {
      console.error("❌ Assistant analysis failed:", error);
      throw error;
    }
  }
}
