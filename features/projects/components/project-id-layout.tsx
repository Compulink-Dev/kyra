"use client";

import { Allotment } from "allotment";
import { motion } from "framer-motion";

import { ConversationSidebar } from "@/features/conversations/components/conversation-sidebar";
import { Navbar } from "./navbar";
import { Id } from "@/convex/_generated/dataModel";

const MIN_SIDEBAR_WIDTH = 240;
const MAX_SIDEBAR_WIDTH = 600;
const DEFAULT_CONVERSATION_SIDEBAR_WIDTH = 380;
const DEFAULT_MAIN_SIZE = 1000;

export const ProjectIdLayout = ({
  children,
  projectId,
}: {
  children: React.ReactNode;
  projectId: Id<"projects">;
}) => {
  return (
    <div className="w-full h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/5 overflow-hidden">
      <Navbar projectId={projectId} />
      <div className="flex-1 flex overflow-hidden">
        <Allotment
          className="flex-1"
          defaultSizes={[DEFAULT_CONVERSATION_SIDEBAR_WIDTH, DEFAULT_MAIN_SIZE]}
        >
          <Allotment.Pane
            snap
            minSize={MIN_SIDEBAR_WIDTH}
            maxSize={MAX_SIDEBAR_WIDTH}
            preferredSize={DEFAULT_CONVERSATION_SIDEBAR_WIDTH}
            className="relative"
          >
            {/* Decorative gradient edge */}
            <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-border to-transparent z-10" />
            <div className="h-full overflow-hidden rounded-r-xl border-r border-border/50 bg-sidebar/95 backdrop-blur-sm">
              <ConversationSidebar projectId={projectId} />
            </div>
          </Allotment.Pane>
          <Allotment.Pane className="relative">
            {/* Main content area gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5 opacity-50" />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="h-full relative z-10"
            >
              {children}
            </motion.div>
          </Allotment.Pane>
        </Allotment>
      </div>
    </div>
  );
};