"use client";

import { FC, useState, useRef, useCallback } from "react";
import { IconSend, IconPlayerStopFilled } from "@tabler/icons-react";
import { TextareaAutosize } from "@/components/ui/textarea-autosize";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { PromptSelector } from "@/components/prompts/prompt-selector";
import { AssistantPromptSelector } from "@/components/prompts/assistant-prompt-selector";

interface ChatInputProps {
  onSendMessage: (
    message: string,
    systemPrompt?: string,
    assistantPrompt?: string
  ) => void;
  isGenerating?: boolean;
  isAssistantAnalyzing?: boolean;
  onStopGeneration?: () => void;
  isFirstMessage?: boolean;
}

export const ChatInput: FC<ChatInputProps> = ({
  onSendMessage,
  isGenerating = false,
  isAssistantAnalyzing = false,
  onStopGeneration,
  isFirstMessage = true,
}) => {
  const [userInput, setUserInput] = useState("");
  const [selectedPrompt, setSelectedPrompt] = useState("");
  const [selectedAssistantPrompt, setSelectedAssistantPrompt] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);

  const handleInputChange = useCallback((value: string) => {
    setUserInput(value);
  }, []);

  const handlePromptSelect = useCallback((promptContent: string) => {
    setSelectedPrompt(promptContent);
  }, []);

  const handleAssistantPromptSelect = useCallback((promptContent: string) => {
    setSelectedAssistantPrompt(promptContent);
  }, []);

  const handleSendMessage = useCallback(() => {
    if (!userInput.trim() || isGenerating) return;

    // Send user input to display in chat, and selected prompts as system messages
    onSendMessage(
      userInput.trim(),
      selectedPrompt || undefined,
      selectedAssistantPrompt || undefined
    );
    setUserInput("");

    // Keep prompts selected until manually cleared - do not auto-clear
  }, [
    userInput,
    selectedPrompt,
    selectedAssistantPrompt,
    isGenerating,
    onSendMessage,
  ]);

  const handleClearPrompt = useCallback(() => {
    setSelectedPrompt("");
  }, []);

  const handleClearAssistantPrompt = useCallback(() => {
    setSelectedAssistantPrompt("");
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey && !isTyping) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage, isTyping]
  );

  const handleStopMessage = useCallback(() => {
    if (onStopGeneration) {
      onStopGeneration();
    }
  }, [onStopGeneration]);

  return (
    <motion.div
      className="mx-auto max-w-3xl px-4 pb-4 space-y-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Prompt Selectors - Above the input */}
      <div className="flex justify-between gap-3">
        <PromptSelector onPromptSelect={handlePromptSelect} />
        <AssistantPromptSelector onPromptSelect={handleAssistantPromptSelect} />
      </div>

      {/* Assistant Analyzing Indicator */}
      {isAssistantAnalyzing && (
        <motion.div
          className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-3"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              <div
                className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"
                style={{ animationDelay: "0.2s" }}
              ></div>
              <div
                className="w-2 h-2 bg-purple-300 rounded-full animate-pulse"
                style={{ animationDelay: "0.4s" }}
              ></div>
            </div>
            <div className="text-sm font-medium text-purple-700">
              Assistant is analyzing the conversation...
            </div>
          </div>
        </motion.div>
      )}

      {/* Selected Prompt Indicators - Only show for first message */}
      {isFirstMessage && selectedAssistantPrompt && (
        <motion.div
          className="bg-purple-50 border border-purple-200 rounded-lg p-3"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="text-sm font-medium text-purple-700 mb-1">
                Selected Assistant Prompt:
              </div>
              <div className="text-sm text-purple-600 line-clamp-2">
                {selectedAssistantPrompt.length > 100
                  ? `${selectedAssistantPrompt.substring(0, 100)}...`
                  : selectedAssistantPrompt}
              </div>
            </div>
            <button
              onClick={handleClearAssistantPrompt}
              className="ml-2 text-purple-500 hover:text-purple-700 transition-colors"
            >
              ×
            </button>
          </div>
        </motion.div>
      )}

      {isFirstMessage && selectedPrompt && (
        <motion.div
          className="bg-blue-50 border border-blue-200 rounded-lg p-3"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="text-sm font-medium text-blue-700 mb-1">
                Selected Main Prompt:
              </div>
              <div className="text-sm text-blue-600 line-clamp-2">
                {selectedPrompt.length > 100
                  ? `${selectedPrompt.substring(0, 100)}...`
                  : selectedPrompt}
              </div>
            </div>
            <button
              onClick={handleClearPrompt}
              className="ml-2 text-blue-500 hover:text-blue-700 transition-colors"
            >
              ×
            </button>
          </div>
        </motion.div>
      )}

      {/* Chat Input */}
      <motion.div
        className={cn(
          "relative rounded-2xl border bg-white/90 backdrop-blur-xl shadow-lg transition-all duration-300",
          isFocused
            ? "border-blue-300 shadow-xl ring-2 ring-blue-500/20"
            : "border-white/50 hover:border-white/70"
        )}
        whileHover={{
          scale: 1.01,
          boxShadow:
            "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        }}
        transition={{ duration: 0.2 }}
      >
        <TextareaAutosize
          textareaRef={chatInputRef as React.RefObject<HTMLTextAreaElement>}
          className="w-full resize-none border-none bg-transparent px-4 py-3 pr-12 text-base placeholder-gray-400 focus:outline-none"
          placeholder={
            selectedPrompt && selectedAssistantPrompt
              ? "Add your message to both prompts..."
              : selectedPrompt
                ? "Add your message to the main prompt..."
                : selectedAssistantPrompt
                  ? "Add your message to the assistant prompt..."
                  : "Ask anything..."
          }
          onValueChange={handleInputChange}
          value={userInput}
          minRows={1}
          maxRows={10}
          onKeyDown={handleKeyDown}
          onCompositionStart={() => setIsTyping(true)}
          onCompositionEnd={() => setIsTyping(false)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        <div className="absolute bottom-2 right-2">
          <AnimatePresence mode="wait">
            {isGenerating ? (
              <motion.div
                key="stop"
                initial={{ opacity: 0, scale: 0.8, rotate: -90 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.8, rotate: 90 }}
                transition={{ duration: 0.2 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 backdrop-blur-xl transition-colors duration-200"
                  onClick={handleStopMessage}
                >
                  <IconPlayerStopFilled size={16} />
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="send"
                initial={{ opacity: 0, scale: 0.8, rotate: -90 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.8, rotate: 90 }}
                transition={{ duration: 0.2 }}
                whileHover={{ scale: userInput.trim() ? 1.1 : 1 }}
                whileTap={{ scale: userInput.trim() ? 0.9 : 1 }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-8 w-8 rounded-lg transition-all duration-200 backdrop-blur-xl",
                    userInput.trim()
                      ? "bg-black text-white hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/25"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed hover:bg-gray-100"
                  )}
                  onClick={() => {
                    if (!userInput.trim()) return;
                    handleSendMessage();
                  }}
                  disabled={!userInput.trim()}
                >
                  <motion.div
                    animate={userInput.trim() ? { rotate: [0, -10, 0] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    <IconSend size={16} />
                  </motion.div>
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};
