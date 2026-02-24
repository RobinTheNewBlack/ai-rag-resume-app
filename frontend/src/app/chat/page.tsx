"use client";

import AssistantChat from "@/components/AssistantChat";

export default function ChatPage() {
    return (
        <div className="container mx-auto py-10 max-w-4xl h-[calc(100vh-80px)]">
            <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">AI Assistant</h1>
                <p className="text-muted-foreground mt-1">Ask questions about your candidates and get insights directly from their resumes.</p>
            </div>

            <AssistantChat />
        </div>
    );
}
