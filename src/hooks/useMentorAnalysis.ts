import { useState, useCallback, useMemo } from "react";
import {
  MentorAnalysisService,
  MentorConfig,
} from "@/lib/mentor-analysis-service";

export interface UseMentorAnalysisReturn {
  analyzeMentorInput: (
    userInput: string,
    mentorPrompt: string,
    config?: MentorConfig
  ) => Promise<string | null>;
  isAnalyzing: boolean;
  analysisError: string | null;
}

export const useMentorAnalysis = (apiKey?: string): UseMentorAnalysisReturn => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const mentorService = useMemo(() => {
    if (!apiKey) return null;
    return new MentorAnalysisService(apiKey);
  }, [apiKey]);

  const analyzeMentorInput = useCallback(
    async (
      userInput: string,
      mentorPrompt: string,
      config?: MentorConfig
    ): Promise<string | null> => {
      if (!mentorService) {
        const error = "Mentor analysis service not available - API key missing";
        console.error("❌ Mentor analysis error:", error);
        setAnalysisError(error);
        return null;
      }

      setIsAnalyzing(true);
      setAnalysisError(null);

      try {
        console.log("🧭 MENTOR MODEL: Initiating analysis...");
        const result = await mentorService.analyzeMentorInput(
          userInput,
          mentorPrompt,
          config
        );

        setIsAnalyzing(false);

        if (result) {
          console.log("🧭 MENTOR MODEL: Analysis successful");
          return result;
        } else {
          console.warn("⚠️ MENTOR MODEL: Analysis returned null/empty result");
          return null;
        }
      } catch (error) {
        console.error("❌ MENTOR MODEL: Analysis failed:", error);
        setIsAnalyzing(false);
        setAnalysisError(
          error instanceof Error ? error.message : "Unknown error"
        );
        return null;
      }
    },
    [mentorService]
  );

  return {
    analyzeMentorInput,
    isAnalyzing,
    analysisError,
  };
};
