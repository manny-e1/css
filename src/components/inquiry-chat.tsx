"use client";

import { Clock, Send } from "lucide-react";
import { useState } from "react";
import { replyToInquiryAction } from "@/app/materials/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  content: string;
  senderId: string | null;
  createdAt: Date;
  senderName: string | null;
  senderEmail: string | null;
}

interface ChatComponentProps {
  inquiryId: string;
  initialMessages: Message[];
  currentUserEmail: string;
}

export function ChatComponent({
  inquiryId,
  initialMessages,
  currentUserEmail,
}: ChatComponentProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReply = async () => {
    if (!reply.trim()) return;
    setLoading(true);
    try {
      await replyToInquiryAction(inquiryId, reply);
      setMessages([
        ...messages,
        {
          id: Math.random().toString(), // Temporary ID for optimistic UI
          content: reply,
          senderId: "me",
          createdAt: new Date(),
          senderName: "Me",
          senderEmail: currentUserEmail,
        },
      ]);
      setReply("");
    } catch (error) {
      console.error("Failed to send reply:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-muted/5">
      <div className="flex-1 overflow-y-auto space-y-6 p-8 scrollbar-thin scrollbar-thumb-muted-foreground/10 scrollbar-track-transparent">
        {messages.map((msg, index) => {
          const isMe = msg.senderEmail === currentUserEmail;
          const showAvatar =
            index === 0 || messages[index - 1].senderEmail !== msg.senderEmail;

          return (
            <div
              key={msg.id}
              className={cn(
                "flex flex-col max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-300",
                isMe ? "ml-auto items-end" : "mr-auto items-start",
                showAvatar ? "mt-8" : "mt-1",
              )}
            >
              {showAvatar && (
                <div
                  className={cn(
                    "flex items-center gap-2.5 mb-2.5 px-1",
                    isMe ? "flex-row-reverse" : "flex-row",
                  )}
                >
                  <div
                    className={cn(
                      "h-8 w-8 rounded-xl flex items-center justify-center text-[11px] font-bold shadow-sm border transition-transform hover:scale-105",
                      isMe
                        ? "bg-primary text-primary-foreground border-primary/20"
                        : "bg-white text-primary border-border/50",
                    )}
                  >
                    {isMe ? "ME" : msg.senderName?.[0] || "S"}
                  </div>
                  <div
                    className={cn(
                      "flex flex-col",
                      isMe ? "items-end" : "items-start",
                    )}
                  >
                    <span className="text-[11px] font-bold text-foreground tracking-tight">
                      {isMe ? "You" : msg.senderName || "Supplier"}
                    </span>
                    <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                      {isMe ? "Buyer" : "Supplier Representative"}
                    </span>
                  </div>
                </div>
              )}

              <div
                className={cn(
                  "px-5 py-3.5 rounded-2xl text-[14px] leading-relaxed transition-all duration-300 shadow-sm",
                  isMe
                    ? "bg-primary text-primary-foreground rounded-tr-none hover:shadow-md hover:shadow-primary/10"
                    : "bg-white border border-border/50 text-foreground rounded-tl-none hover:border-primary/20",
                )}
              >
                {msg.content}
              </div>

              <div
                className={cn(
                  "text-[9px] font-bold text-muted-foreground/30 mt-2.5 px-1 flex items-center gap-1.5 uppercase tracking-widest",
                  isMe ? "flex-row-reverse" : "flex-row",
                )}
              >
                <Clock className="h-3 w-3 opacity-40" />
                {new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-8 border-t bg-white/80 backdrop-blur-sm">
        <div className="flex gap-4 relative">
          <Textarea
            placeholder="Write your message..."
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            className="min-h-[100px] max-h-[200px] focus-visible:ring-primary/20 focus-visible:ring-offset-0 border-muted-foreground/10 rounded-2xl p-4 text-sm leading-relaxed resize-none transition-all duration-200"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleReply();
              }
            }}
          />
          <div className="absolute right-4 bottom-4 flex items-center gap-3">
            <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest hidden md:block">
              {loading ? "Sending..." : "Enter to send"}
            </span>
            <Button
              onClick={handleReply}
              disabled={loading || !reply.trim()}
              size="icon"
              className={cn(
                "h-10 w-10 rounded-xl transition-all duration-300",
                reply.trim()
                  ? "scale-100 opacity-100 shadow-lg shadow-primary/20"
                  : "scale-90 opacity-50",
              )}
            >
              <Send
                className={cn(
                  "h-4.5 w-4.5 transition-transform duration-300",
                  loading && "animate-pulse",
                )}
              />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
