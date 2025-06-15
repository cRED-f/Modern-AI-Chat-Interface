import { OpenRouterService } from "./openrouter-service";

export interface AnalysisConfig {
  modelName?: string;
  temperature?: number;
  maxContextLength?: number;
}

export interface ConversationMessage {
  role: "user" | "ai" | "assistant";
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
      const {
        modelName = "anthropic/claude-3.5-sonnet:beta",
        temperature = 0.3,
        maxContextLength = 2000,
      } = config;

      // Prepare messages for assistant analysis
      const analysisMessages = [
        {
          role: "system" as const,
          content: assistantPrompt,
        },
        ...conversationHistory.map((msg) => ({
          role:
            msg.role === "ai" || msg.role === "assistant"
              ? ("assistant" as const)
              : (msg.role as "user"),
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
