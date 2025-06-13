"use client";

import { FC, useState, useRef, useCallback } from "react";
import { IconSend, IconPlayerStopFilled } from "@tabler/icons-react";
import { TextareaAutosize } from "@/components/ui/textarea-autosize";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { PromptSelector } from "@/components/prompts/prompt-selector";

interface ChatInputProps {
  onSendMessage: (message: string, systemPrompt?: string) => void;
  isGenerating?: boolean;
  onStopGeneration?: () => void;
}

export const ChatInput: FC<ChatInputProps> = ({
  onSendMessage,
  isGenerating = false,
  onStopGeneration,
}) => {
  const [userInput, setUserInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedPromptContent, setSelectedPromptContent] = useState("");
  const chatInputRef = useRef<HTMLTextAreaElement>(null);

  const handleInputChange = useCallback((value: string) => {
    setUserInput(value);
  }, []);
  const handleSendMessage = useCallback(() => {
    if (!userInput.trim() || isGenerating) return;

    // Send user message and prompt separately
    onSendMessage(userInput, selectedPromptContent || undefined);
    setUserInput("");
    setSelectedPromptContent(""); // Clear prompt after sending
  }, [userInput, selectedPromptContent, isGenerating, onSendMessage]);

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
      className="mx-auto max-w-3xl px-4 pb-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {" "}
      {/* Prompt Selector */}
      <div className="mb-3 flex justify-start">
        <PromptSelector onPromptSelect={setSelectedPromptContent} />
      </div>
      {/* Selected Prompt Indicator */}
      <AnimatePresence>
        {selectedPromptContent && (
          <motion.div
            className="mb-3 p-3 rounded-lg bg-blue-50/80 backdrop-blur-sm border border-blue-200/50"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs text-blue-600 font-medium mb-1">
                  Selected Prompt:
                </p>
                <p className="text-sm text-blue-800 line-clamp-2">
                  {selectedPromptContent.substring(0, 100)}
                  {selectedPromptContent.length > 100 ? "..." : ""}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                onClick={() => setSelectedPromptContent("")}
              >
                ×
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
        {" "}
        <TextareaAutosize
          textareaRef={chatInputRef as React.RefObject<HTMLTextAreaElement>}
          className="w-full resize-none border-none bg-transparent px-4 py-3 pr-12 text-base placeholder-gray-400 focus:outline-none"
          placeholder={
            selectedPromptContent
              ? "Add your message to the prompt..."
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
