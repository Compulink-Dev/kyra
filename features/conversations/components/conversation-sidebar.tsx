import ky from "ky";
import { toast } from "sonner";
import { useState } from "react";
import { 
  Copy, 
  History, 
  Loader2, 
  Plus, 
  Send,
  Sparkles,
  Bot,
  User,
  Clock,
  MoreVertical,
  Trash2,
  Pin,
  Archive
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
  MessageActions,
  MessageAction,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";

import {
  useConversation,
  useConversations,
  useCreateConversation,
  useMessages,
} from "../hooks/use-conversations";

import { Id } from "@/convex/_generated/dataModel";
import { DEFAULT_CONVERSATION_TITLE } from "@/convex/constants";

interface ConversationSidebarProps {
  projectId: Id<"projects">;
}

export const ConversationSidebar = ({
  projectId,
}: ConversationSidebarProps) => {
  const [input, setInput] = useState("");
  const [selectedConversationId, setSelectedConversationId] =
    useState<Id<"conversations"> | null>(null);

  const createConversation = useCreateConversation();
  const conversations = useConversations(projectId);

  const activeConversationId =
    selectedConversationId ?? conversations?.[0]?._id ?? null;

  const activeConversation = useConversation(activeConversationId);
  const conversationMessages = useMessages(activeConversationId);

  // Check if any message is currently processing
  const isProcessing = conversationMessages?.some(
    (msg) => msg.status === "processing"
  );

  const handleCreateConversation = async () => {
    try {
      const newConversationId = await createConversation({
        projectId,
        title: DEFAULT_CONVERSATION_TITLE,
      });
      setSelectedConversationId(newConversationId);
      return newConversationId;
    } catch {
      toast.error("Unable to create new conversation");
      return null;
    }
  };

  const handleSubmit = async (message: PromptInputMessage) => {
    // If processing and no new message, this is just a stop function
    if (isProcessing && !message.text) {
      // TODO: await handleCancel()
      setInput("");
      return;
    }

    let conversationId = activeConversationId;

    if (!conversationId) {
      conversationId = await handleCreateConversation();
      if (!conversationId) {
        return;
      }
    }

    // Trigger Inngest function via API
    try {
      await ky.post("/api/messages", {
        json: {
          conversationId,
          message: message.text,
        },
      });
    } catch {
      toast.error("Message failed to send");
    }

    setInput("");
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-sidebar via-sidebar to-sidebar/90">
      {/* Header */}
      <div className="h-12 flex items-center justify-between px-4 border-b border-border/50 bg-sidebar/95 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
            <Sparkles className="size-3.5 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold truncate max-w-[200px]">
              {activeConversation?.title ?? DEFAULT_CONVERSATION_TITLE}
            </span>
            {conversationMessages && conversationMessages.length > 0 && (
              <span className="text-xs text-muted-foreground">
                {conversationMessages.length} messages
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 hover:bg-accent/30"
              >
                <History className="size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem className="gap-2">
                <Archive className="size-4" />
                Archive Chat
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2">
                <Pin className="size-4" />
                Pin to Top
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 text-destructive">
                <Trash2 className="size-4" />
                Clear History
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button
            variant="ghost"
            size="icon"
            className="size-7 hover:bg-accent/30"
            onClick={handleCreateConversation}
          >
            <Plus className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1">
        <Conversation className="flex-1">
          <ConversationContent className="p-4">
            <AnimatePresence initial={false}>
              {conversationMessages?.map((message, messageIndex) => (
                <motion.div
                  key={message._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Message from={message.role}>
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "size-6 rounded-full flex items-center justify-center mt-1 shrink-0",
                        message.role === "user" 
                          ? "bg-blue-500/10 text-blue-500" 
                          : "bg-primary/10 text-primary"
                      )}>
                        {message.role === "user" ? (
                          <User className="size-3" />
                        ) : (
                          <Bot className="size-3" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <MessageContent>
                          {message.status === "processing" ? (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Loader2 className="size-3.5 animate-spin" />
                                <span className="text-sm">Kyra is thinking...</span>
                              </div>
                              <div className="flex gap-1">
                                <div className="size-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="size-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="size-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: '300ms' }} />
                              </div>
                            </div>
                          ) : (
                            <MessageResponse>{message.content}</MessageResponse>
                          )}
                        </MessageContent>
                        {message.role === "assistant" &&
                          message.status === "completed" &&
                          messageIndex === (conversationMessages?.length ?? 0) - 1 && (
                            <MessageActions className="mt-2">
                              <MessageAction
                                onClick={() => {
                                  navigator.clipboard.writeText(message.content);
                                  toast.success("Copied to clipboard");
                                }}
                                label="Copy"
                                className="gap-1.5 text-xs"
                              >
                                <Copy className="size-3" />
                                <span>Copy</span>
                              </MessageAction>
                              <MessageAction
                                onClick={() => {
                                  // TODO: Implement regenerate
                                  toast.info("Regenerating response...");
                                }}
                                label="Regenerate"
                                className="gap-1.5 text-xs"
                              >
                                <RefreshCw className="size-3" />
                                <span>Regenerate</span>
                              </MessageAction>
                            </MessageActions>
                          )}
                      </div>
                    </div>
                  </Message>
                </motion.div>
              ))}
            </AnimatePresence>

            {(!conversationMessages || conversationMessages.length === 0) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <div className="size-16 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-4">
                  <Sparkles className="size-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Welcome to Kyra AI</h3>
                <p className="text-sm text-muted-foreground max-w-xs mb-6">
                  Ask questions, get code suggestions, or brainstorm ideas with AI assistance.
                </p>
                <div className="flex flex-col gap-2 w-full max-w-xs">
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-start text-left h-auto py-3"
                    onClick={() => setInput("Help me debug this code...")}
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <Bug className="size-4 text-blue-500" />
                      </div>
                      <div className="flex-1">
                        <span className="text-sm font-medium block">Debug code</span>
                        <span className="text-xs text-muted-foreground">Find and fix issues</span>
                      </div>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-start text-left h-auto py-3"
                    onClick={() => setInput("Explain this algorithm...")}
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                        <BookOpen className="size-4 text-green-500" />
                      </div>
                      <div className="flex-1">
                        <span className="text-sm font-medium block">Explain concepts</span>
                        <span className="text-xs text-muted-foreground">Get detailed explanations</span>
                      </div>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-start text-left h-auto py-3"
                    onClick={() => setInput("Generate API documentation...")}
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                        <FileCode className="size-4 text-purple-500" />
                      </div>
                      <div className="flex-1">
                        <span className="text-sm font-medium block">Generate code</span>
                        <span className="text-xs text-muted-foreground">Create functions and components</span>
                      </div>
                    </div>
                  </Button>
                </div>
              </motion.div>
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t border-border/50 bg-sidebar/95 backdrop-blur-sm">
        <div className="relative">
          <PromptInput onSubmit={handleSubmit} className="mt-2">
            <PromptInputBody>
              <PromptInputTextarea
                placeholder="Ask Kyra anything... (Shift + Enter for new line)"
                onChange={(e) => setInput(e.target.value)}
                value={input}
                disabled={isProcessing}
                className="min-h-16 bg-background/50 border-border/50 focus:border-primary/50 resize-none"
              />
            </PromptInputBody>
            <PromptInputFooter>
              <PromptInputTools>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  onClick={() => {
                    // TODO: Implement file upload
                    toast.info("File upload coming soon");
                  }}
                >
                  <Paperclip className="size-3.5" />
                </Button>
              </PromptInputTools>
              <PromptInputSubmit
                disabled={isProcessing ? false : !input}
                status={isProcessing ? "streaming" : undefined}
                className={cn(
                  "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70",
                  "text-primary-foreground shadow-sm"
                )}
              >
                {isProcessing ? (
                  <Square className="size-3.5" />
                ) : (
                  <Send className="size-3.5" />
                )}
              </PromptInputSubmit>
            </PromptInputFooter>
          </PromptInput>
          
          {/* Input hint */}
          <div className="absolute -top-6 left-0 right-0 flex items-center justify-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/30 rounded-full">
              <Badge variant="outline" className="text-[10px] font-normal">
                AI Assistant
              </Badge>
              <span className="text-xs text-muted-foreground">
                Powered by advanced language models
              </span>
            </div>
          </div>
        </div>
        
        {/* Quick suggestions */}
        {input.length === 0 && conversationMessages && conversationMessages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 flex flex-wrap gap-2"
          >
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-7 px-2"
              onClick={() => setInput("Can you explain that in more detail?")}
            >
              Explain more
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-7 px-2"
              onClick={() => setInput("Give me an example")}
            >
              Show example
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-7 px-2"
              onClick={() => setInput("What are the alternatives?")}
            >
              Alternatives
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-7 px-2"
              onClick={() => setInput("Help me implement this")}
            >
              Help implement
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

// Import missing icons
import { 
  Paperclip, 
  RefreshCw, 
  Square,
  Bug,
  BookOpen,
  FileCode
} from "lucide-react";
import { cn } from "@/lib/utils";