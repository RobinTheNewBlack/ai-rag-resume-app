"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Bot, User, Send, Sparkles, Loader2 } from "lucide-react";

export default function AssistantChat() {
    const [messages, setMessages] = useState([
        { role: 'ai', content: "Hello! I'm your HR AI Assistant. You can ask me questions about any of the candidates, for example: 'Who has the most experience with React?' or 'Did anyone graduate from Chulalongkorn University?'" }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input;

        // Add User Message
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setInput("");
        setIsLoading(true);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const response = await fetch(`${apiUrl}/api/chat/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    message: userMessage,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setMessages(prev => [...prev, { role: 'ai', content: data.answer }]);
            } else {
                setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I encountered an error communicating with the server." }]);
            }
        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I couldn't reach the server." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="flex flex-col h-[600px] border-0 shadow-xl ring-1 ring-black/5 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white p-4 flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                    <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="font-semibold text-white">AI HR Assistant</h3>
                    <p className="text-indigo-100 text-xs flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Powered by Gemini
                    </p>
                </div>
            </div>

            {/* Chat History */}
            <ScrollArea className="flex-1 p-4 bg-slate-50/50">
                <div className="space-y-4">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>

                            {/* Avatar */}
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-slate-200 text-slate-600' : 'bg-indigo-100 text-indigo-600'
                                }`}>
                                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                            </div>

                            {/* Message Bubble */}
                            <div className={`p-3 rounded-2xl max-w-[80%] text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                                ? 'bg-indigo-600 text-white rounded-tr-sm'
                                : 'bg-white border rounded-tl-sm text-slate-700'
                                }`}>
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
                                <Bot className="w-4 h-4" />
                            </div>
                            <div className="p-3 bg-white border rounded-2xl rounded-tl-sm text-slate-700 flex items-center shadow-sm">
                                <Loader2 className="w-4 h-4 animate-spin mr-2" /> Typing...
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 bg-white border-t">
                <form
                    onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                    className="flex items-center gap-2"
                >
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about candidates..."
                        disabled={isLoading}
                        className="flex-1 bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 rounded-full px-4"
                    />
                    <Button type="submit" size="icon" disabled={isLoading || !input.trim()} className="rounded-full bg-indigo-600 hover:bg-indigo-700 shrink-0">
                        <Send className="w-4 h-4" />
                    </Button>
                </form>
            </div>
        </Card>
    );
}
