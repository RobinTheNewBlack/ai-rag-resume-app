"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, Send, Sparkles } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const SUGGESTED_PROMPTS = [
    "Who has the most React experience?",
    "Find candidates from Chulalongkorn University",
    "Who has the strongest backend skills?",
    "Compare the top 3 candidates",
];

interface Message {
    role: "user" | "ai";
    content: string;
}

export default function AssistantChat() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    const handleSend = async (text?: string) => {
        const userMessage = (text ?? input).trim();
        if (!userMessage || isLoading) return;

        setHasStarted(true);
        setMessages(prev => [...prev, { role: "user", content: userMessage }]);
        setInput("");
        setIsLoading(true);

        try {
            const response = await fetch(`/api/chat/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userMessage }),
            });

            if (response.ok) {
                const data = await response.json();
                setMessages(prev => [...prev, { role: "ai", content: data.answer }]);
            } else {
                setMessages(prev => [...prev, { role: "ai", content: "Sorry, I encountered an error communicating with the server." }]);
            }
        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, { role: "ai", content: "Sorry, I couldn't reach the server." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleSuggestedPrompt = (prompt: string) => {
        setInput(prompt);
        textareaRef.current?.focus();
    };

    return (
        <div className="flex flex-col h-full">
            {/* Message area */}
            <div className="flex-1 overflow-y-auto">
                {!hasStarted ? (
                    /* Welcome state */
                    <div className="flex flex-col items-center justify-center h-full px-4 pb-8">
                        {/* <div className="mb-4 w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg">
                            <Bot className="w-7 h-7 text-white" />
                        </div> */}
                        <h1 className="text-4xl font-semibold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent mb-2">
                            Hello, HR Team
                        </h1>
                        <p className="text-slate-500 text-lg mb-10">Ask me anything about your candidates</p>
                        <div className="grid grid-cols-2 gap-3 w-full max-w-2xl">
                            {SUGGESTED_PROMPTS.map((prompt) => (
                                <button
                                    key={prompt}
                                    onClick={() => handleSuggestedPrompt(prompt)}
                                    className="text-left px-4 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700 text-sm transition-colors shadow-sm cursor-pointer"
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    /* Chat messages */
                    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
                        {messages.map((msg, idx) => (
                            msg.role === "ai" ? (
                                <div key={idx} className="flex gap-3 items-start">
                                    {/* <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <Bot className="w-4 h-4 text-white" />
                                    </div> */}
                                    <div className="flex-1 text-slate-800 text-sm leading-relaxed pt-1 prose prose-sm prose-slate max-w-none prose-p:my-1 prose-headings:mt-3 prose-headings:mb-1 prose-ul:my-1 prose-li:my-0 prose-strong:text-slate-900 prose-code:text-blue-600 prose-code:bg-slate-100 prose-code:px-1 prose-code:rounded prose-code:text-xs prose-pre:bg-slate-100 prose-pre:text-xs">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {msg.content}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            ) : (
                                <div key={idx} className="flex justify-end">
                                    <div className="max-w-[75%] bg-slate-100 text-slate-800 rounded-2xl rounded-br-sm px-4 py-2.5 text-sm leading-relaxed">
                                        {msg.content}
                                    </div>
                                </div>
                            )
                        ))}
                        {isLoading && (
                            <div className="flex gap-3 items-start">
                                {/* <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Bot className="w-4 h-4 text-white" />
                                </div> */}
                                <div className="flex items-center gap-1 pt-3">
                                    <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                                    <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                                    <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Input area */}
            <div className="px-4 pb-6 pt-3 bg-white">
                <div className="max-w-3xl mx-auto">
                    <div className="flex flex-col rounded-2xl border border-slate-200 shadow-md bg-white px-4 pt-3 pb-2 focus-within:border-blue-400 focus-within:shadow-lg transition-all">
                        <Textarea
                            ref={textareaRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask about candidates..."
                            disabled={isLoading}
                            rows={1}
                            className="w-full resize-none border-0 shadow-none focus-visible:ring-0 bg-transparent p-0 min-h-0 text-sm text-slate-800 placeholder:text-slate-400"
                        />
                        <div className="flex justify-end mt-2">
                            <Button
                                onClick={() => handleSend()}
                                disabled={isLoading || !input.trim()}
                                size="icon"
                                className="rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 shrink-0 h-8 w-8 disabled:opacity-40"
                            >
                                <Send className="w-3.5 h-3.5" />
                            </Button>
                        </div>
                    </div>
                    <p className="text-center text-xs text-slate-400 mt-2 flex items-center justify-center gap-1">
                        <Sparkles className="w-3 h-3" /> Powered by Gemini · Shift+Enter for new line
                    </p>
                </div>
            </div>
        </div>
    );
}
