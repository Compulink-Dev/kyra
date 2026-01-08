"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowDown, RefreshCw, Sparkles } from "lucide-react";
import type { ComponentProps } from "react";
import { useCallback } from "react";
import { StickToBottom, useStickToBottomContext } from "use-stick-to-bottom";
import { motion, HTMLMotionProps } from "framer-motion";

export type ConversationProps = ComponentProps<typeof StickToBottom>;

export const Conversation = ({ className, children, ...props }: ConversationProps) => (
  <StickToBottom
    className={cn("relative flex-1 overflow-y-hidden", className)}
    initial="smooth"
    resize="smooth"
    role="log"
    {...props}
  >
    {children}
  </StickToBottom>
);

export type ConversationContentProps = ComponentProps<
  typeof StickToBottom.Content
>;

export const ConversationContent = ({
  className,
  children,
  ...props
}: ConversationContentProps) => (
  <StickToBottom.Content
    className={cn("flex flex-col gap-6 p-4", className)}
    {...props}
  >
    {children}
  </StickToBottom.Content>
);

export type ConversationEmptyStateProps = ComponentProps<"div"> & {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
};

export const ConversationEmptyState = ({
  className,
  title = "No messages yet",
  description = "Start a conversation to see messages here",
  icon,
  children,
  ...props
}: ConversationEmptyStateProps) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className={cn(
      "flex size-full flex-col items-center justify-center gap-4 p-8 text-center",
      className
    )}
    {...props}
  >
    {children ?? (
      <>
        <div className="size-16 rounded-2xl bg-linear-to-br from-primary/10 to-primary/5 flex items-center justify-center">
          {icon || <Sparkles className="size-7 text-primary" />}
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold text-lg">{title}</h3>
          {description && (
            <p className="text-muted-foreground text-sm max-w-xs">{description}</p>
          )}
        </div>
      </>
    )}
  </motion.div>
);

export type ConversationScrollButtonProps = ComponentProps<typeof Button> & {
  showCount?: boolean;
  unreadCount?: number;
};

export const ConversationScrollButton = ({
  className,
  showCount = false,
  unreadCount = 0,
  ...props
}: ConversationScrollButtonProps) => {
  const { isAtBottom, scrollToBottom } = useStickToBottomContext();

  const handleScrollToBottom = useCallback(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  return (
    !isAtBottom && (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="absolute bottom-4 left-1/2 -translate-x-1/2"
      >
        <Button
          className={cn(
            "rounded-full bg-background/80 backdrop-blur-sm border border-border/50 shadow-lg hover:bg-background",
            showCount && unreadCount > 0 && "pr-3",
            className
          )}
          onClick={handleScrollToBottom}
          size="icon"
          type="button"
          variant="outline"
          {...props}
        >
          <ArrowDown className="size-4" />
          {showCount && unreadCount > 0 && (
            <span className="ml-2 text-xs font-medium">
              {unreadCount} new
            </span>
          )}
        </Button>
      </motion.div>
    )
  );
};

export type ConversationRefreshButtonProps = ComponentProps<typeof Button>;

export const ConversationRefreshButton = ({
  className,
  ...props
}: ConversationRefreshButtonProps) => {
  return (
    <Button
      className={cn(
        "rounded-full bg-background/80 backdrop-blur-sm border border-border/50 shadow-lg hover:bg-background",
        className
      )}
      size="icon"
      type="button"
      variant="outline"
      {...props}
    >
      <RefreshCw className="size-4" />
    </Button>
  );
};