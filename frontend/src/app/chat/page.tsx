"use client";

import AssistantChat from "@/components/feature/AssistantChat";

export default function ChatPage() {
    return (
        <div className="h-[calc(100vh-80px)] flex flex-col bg-white">
            <AssistantChat />
        </div>
    );
}
