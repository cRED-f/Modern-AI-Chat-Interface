"use client";

import { ChatMessage } from "@/types";
import { FC, useState } from "react";
import {
  IconUser,
  IconRobotFace,
  IconCopy,
  IconEdit,
  IconRepeat,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { WithTooltip } from "@/components/ui/with-tooltip";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";

interface MessageProps {
  message: ChatMessage;
  isLast?: boolean;
  onEdit?: (messageId: string) => void;
  onRegenerate?: (messageId: string) => void;
  index?: number;
}

export const Message: FC<MessageProps> = ({
  message,
  isLast = false,
  onEdit,
  onRegenerate,
  index = 0,
}) => {
  const [isHovering, setIsHovering] = useState(false);
  const [showCheckmark, setShowCheckmark] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setShowCheckmark(true);
    setTimeout(() => setShowCheckmark(false), 2000);
  };

  const isAssistant = message.role === "assistant";

  const messageVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      y: -10,
      scale: 0.95,
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <motion.div
      variants={messageVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      layout
      className={cn(
        "group relative border-b border-white/20 px-4 py-6 backdrop-blur-sm",
        isAssistant ? "bg-gray-50/50" : "bg-white/50"
      )}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      whileHover={{
        backgroundColor: isAssistant
          ? "rgba(249, 250, 251, 0.8)"
          : "rgba(255, 255, 255, 0.8)",
      }}
      transition={{ duration: 0.2 }}
    >
      <div className="mx-auto flex max-w-3xl space-x-4">
        {/* Avatar */}
        <motion.div
          className="flex-shrink-0"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            delay: index * 0.1 + 0.2,
            duration: 0.5,
            type: "spring",
            bounce: 0.3,
          }}
        >
          <motion.div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-xl border border-white/30",
              isAssistant
                ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg"
                : "bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-lg"
            )}
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            {isAssistant ? <IconRobotFace size={16} /> : <IconUser size={16} />}
          </motion.div>
        </motion.div>

        {/* Content */}
        <motion.div
          className="flex-1 space-y-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 + 0.3, duration: 0.4 }}
        >
          <div className="prose prose-sm max-w-none text-gray-900">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className={cn(
            "flex items-start space-x-1 opacity-0 transition-opacity",
            (isHovering || showCheckmark) && "opacity-100"
          )}
          initial={{ opacity: 0, x: 10 }}
          animate={{
            opacity: isHovering || showCheckmark ? 1 : 0,
            x: isHovering || showCheckmark ? 0 : 10,
          }}
          transition={{ duration: 0.2 }}
        >
          <WithTooltip
            delayDuration={1000}
            side="bottom"
            display={<div>{showCheckmark ? "Copied!" : "Copy"}</div>}
            trigger={
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-gray-500 hover:text-gray-700 hover:bg-white/50 backdrop-blur-xl transition-colors duration-200"
                  onClick={handleCopy}
                >
                  <IconCopy size={14} />
                </Button>
              </motion.div>
            }
          />
          {!isAssistant && onEdit && (
            <WithTooltip
              delayDuration={1000}
              side="bottom"
              display={<div>Edit</div>}
              trigger={
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-gray-500 hover:text-gray-700 hover:bg-white/50 backdrop-blur-xl transition-colors duration-200"
                    onClick={() => onEdit(message._id)}
                  >
                    <IconEdit size={14} />
                  </Button>
                </motion.div>
              }
            />
          )}{" "}
          {isAssistant && isLast && onRegenerate && (
            <WithTooltip
              delayDuration={1000}
              side="bottom"
              display={<div>Regenerate</div>}
              trigger={
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-gray-500 hover:text-gray-700 hover:bg-white/50 backdrop-blur-xl transition-colors duration-200"
                    onClick={() => onRegenerate(message._id)}
                  >
                    <IconRepeat size={14} />
                  </Button>
                </motion.div>
              }
            />
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};
