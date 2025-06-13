"use client";

import { FC, useState, useRef, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { IconChevronDown, IconSparkles } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface AssistantPromptSelectorProps {
  onPromptSelect: (promptContent: string) => void;
  className?: string;
}

export const AssistantPromptSelector: FC<AssistantPromptSelectorProps> = ({
  onPromptSelect,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPromptName, setSelectedPromptName] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch only assistant prompts
  const prompts = useQuery(api.prompts.getPromptsByTarget, {
    targetModel: "assistant",
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const handlePromptSelect = (prompt: {
    _id: string;
    name: string;
    content: string;
  }) => {
    onPromptSelect(prompt.content);
    setSelectedPromptName(prompt.name);
    setIsOpen(false);
  };

  const handleClear = () => {
    onPromptSelect("");
    setSelectedPromptName("");
  };

  if (!prompts || prompts.length === 0) {
    return null;
  }

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "h-9 px-3 text-sm font-medium transition-all duration-200",
          "border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100",
          "flex items-center gap-2 min-w-[140px] justify-between",
          selectedPromptName && "bg-purple-100 border-purple-300"
        )}
      >
        {" "}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <IconSparkles size={16} className="text-purple-600 flex-shrink-0" />
          <span className="truncate">{selectedPromptName || "Assistant"}</span>
        </div>
        <IconChevronDown
          size={16}
          className={cn(
            "transition-transform duration-200 flex-shrink-0",
            isOpen && "rotate-180"
          )}
        />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full mb-1 right-0 w-80 bg-white border border-purple-200 rounded-lg shadow-lg z-50 max-h-60 overflow-hidden"
          >
            <div className="flex items-center justify-between">
              {selectedPromptName && (
                <button
                  onClick={handleClear}
                  className="text-xs text-purple-600 hover:text-purple-800 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="max-h-44 overflow-y-auto">
              {prompts.map(
                (prompt: { _id: string; name: string; content: string }) => (
                  <motion.button
                    key={prompt._id}
                    onClick={() => handlePromptSelect(prompt)}
                    className={cn(
                      "w-full text-left p-3 hover:bg-purple-50 transition-colors border-b border-gray-100 last:border-b-0",
                      selectedPromptName === prompt.name &&
                        "bg-purple-100 border-purple-200"
                    )}
                    whileHover={{ backgroundColor: "rgb(245 243 255)" }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="font-medium text-sm text-purple-700 mb-1">
                      {prompt.name}
                    </div>
                    <div className="text-xs text-purple-600 line-clamp-2">
                      {prompt.content.length > 100
                        ? `${prompt.content.substring(0, 100)}...`
                        : prompt.content}
                    </div>
                  </motion.button>
                )
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
