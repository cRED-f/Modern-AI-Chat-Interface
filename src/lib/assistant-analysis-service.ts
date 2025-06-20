import { OpenRouterService } from "./openrouter-service";

export interface AnalysisConfig {
  modelName?: string;
  temperature?: number;
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
      const { modelName, temperature } = config;

      if (!modelName || modelName.trim() === "") {
        throw new Error(
          "No assistant model specified. Please configure an assistant model in settings."
        );
      }

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

      const analysis = await this.openRouterService.sendMessage(
        analysisMessages,
        modelName,
        {
          temperature,
        }
      );
      console.log("✅ Assistant analysis completed:", analysis);
      return analysis.trim() || null;
    } catch (error) {
      console.error("❌ Assistant analysis failed:", error);
      throw error;
    }
  }
}
