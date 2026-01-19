"use client"

import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { Menu, X, Plus, Search, MessageSquare, Scale, Gavel, Paperclip, FileText, Book, Building2, Globe, Briefcase, User, Square, ArrowUp } from 'lucide-react';
import {
    PromptInput,
    PromptInputTextarea,
    PromptInputSubmit,
    PromptInputFooter,
    PromptInputButton,
    usePromptInputAttachments,
    usePromptInputController,
    PromptInputProvider,
    PromptInputBody,
    PromptInputTools,
    PromptInputAttachments,
} from '../components/ai-elements/prompt-input';

import {
    Message,
    MessageContent,
} from '../components/ai-elements/message';

import { Shimmer } from '../components/ai-elements/shimmer';

interface SDKMessage {
    id: string;
    role: 'user' | 'assistant' | 'system' | 'data';
    content: string;
    files?: { name: string; type: string; size: number }[];
}

interface Conversation {
    id: number;
    title: string;
    date: string;
    messages: SDKMessage[];
}

const LEGAL_DOMAINS = [
    'Criminal Law',
    'Corporate & Commercial Law',
    'Cyber & IT Law',
];

const DOMAIN_ICONS: Record<string, any> = {
    'Criminal Law': Gavel,
    'Constitutional Law': Book,
    'Civil Law': Scale,
    'Corporate & Commercial Law': Building2,
    'Cyber & IT Law': Globe,
    'Environmental Law': Globe,
    'Labour & Employment Law': Briefcase,
    'Taxation Law': FileText,
};

function AttachButton() {
    const attachments = usePromptInputAttachments();
    return (
        <PromptInputButton
            onClick={() => attachments.openFileDialog()}
            className="text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-opacity duration-200"
        >
            <Paperclip className="w-4 h-4" />
        </PromptInputButton>
    );
}

function CompactAttachment({ file }: { file: any }) {
    const attachments = usePromptInputAttachments();
    return (
        <div className="flex items-center gap-1.5 px-2 py-1 bg-zinc-50 border border-zinc-200 rounded-md text-xs text-zinc-700">
            <Paperclip className="w-3 h-3 text-zinc-400" />
            <span className="font-medium truncate max-w-[200px]">{file.name || 'Attachment'}</span>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    attachments.remove(file.id);
                }}
                className="ml-1 text-zinc-400 hover:text-zinc-700 transition-colors"
                type="button"
            >
                <X className="w-3 h-3" />
            </button>
        </div>
    );
}

function PromptInputWrapper({ isGenerating, onSubmit, stopGeneration }: { isGenerating: boolean; onSubmit: (msg: { text: string; files?: any[] }) => void; stopGeneration: () => void }) {
    const controller = usePromptInputController();

    const handleSubmit = () => {
        const text = controller.textInput.value;
        const files = controller.attachments.all;
        if (!text.trim() && files.length === 0) return;
        onSubmit({ text, files });
        controller.textInput.clear();
        controller.attachments.clear();
    };

    return (
        <>
            <PromptInputAttachments>
                {(file) => <CompactAttachment file={file} />}
            </PromptInputAttachments>
            <PromptInputBody>
                <PromptInputTextarea
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && !isGenerating && (e.preventDefault(), handleSubmit())}
                    disabled={isGenerating}
                    placeholder={isGenerating ? "Generating..." : "Ask a legal question... (e.g. 'Compare IPC 302 vs BNS 103')"}
                    className="bg-transparent text-black placeholder:text-zinc-400 resize-none min-h-[44px] max-h-[200px] text-sm lg:text-base disabled:opacity-50 py-2.5"
                />
            </PromptInputBody>
            <PromptInputFooter className="bg-white border-t border-zinc-100">
                <PromptInputTools>
                    <AttachButton />
                </PromptInputTools>
                {isGenerating ? (
                    <button onClick={stopGeneration} className="bg-zinc-100 text-black hover:bg-zinc-200 rounded-lg px-3 py-2">
                        <Square className="w-4 h-4" fill="currentColor" />
                    </button>
                ) : (
                    <PromptInputSubmit
                        onClick={handleSubmit}
                        disabled={!controller.textInput.value.trim() && controller.attachments.all.length === 0}
                        status="ready"
                        className="bg-zinc-900 text-white hover:bg-zinc-800 disabled:bg-zinc-100 disabled:text-zinc-400 transition-opacity duration-200 rounded-lg p-2"
                    >
                        <ArrowUp className="w-4 h-4" />
                    </PromptInputSubmit>
                )}
            </PromptInputFooter>
        </>
    );
}

export default function Dashboard() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [messages, setMessages] = useState<SDKMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [user, setUser] = useState<any>(null);

    // Fetch user on mount
    useEffect(() => {
        const token = localStorage.getItem("access_token");
        if (token) {
            api.get("/auth/me", { headers: { Authorization: `Bearer ${token}` } })
                .then(res => setUser(res.data))
                .catch(() => {
                    localStorage.removeItem("access_token");
                    // window.location.href = "/auth/login";
                });
        }
    }, []);

    useEffect(() => {
        setIsGenerating(isLoading);
    }, [isLoading]);

    const suggestions = [
        'Compare IPC 420 vs BNS 318',
        'Summarize IPC 302 related punishments',
        'What are the new bail provisions under BNSS?',
        'Draft a legal notice for breach of contract',
    ];

    const createNewConversation = (firstMessage: string) => {
        const newId = Date.now();
        const newConv: Conversation = {
            id: newId,
            title: firstMessage.slice(0, 40) + '...',
            date: 'Just now',
            messages: [],
        };
        setConversations(prev => [newConv, ...prev]);
        setSelectedConversation(newId);
        return newId;
    };

    const updateConversationMessages = (convId: number, newMessages: SDKMessage[]) => {
        setConversations(prev => prev.map(conv =>
            conv.id === convId ? { ...conv, messages: newMessages } : conv
        ));
    };

    const callBackend = async (text: string, files?: any[]) => {
        try {
            // 1. Check if it's a "Compare" request
            if (text.toLowerCase().includes("compare") || text.toLowerCase().includes("vs")) {
                const match = text.match(/\d+/);
                if (match) {
                    const res = await api.post("/compare/", { ipc_section: match[0] });
                    let content = `### Law Comparison\n\n${res.data.comparison_text}\n\n**Key Changes:**\n`;
                    res.data.key_changes.forEach((c: string) => content += `- ${c}\n`);
                    return content;
                }
            }

            // 2. Check if a PDF is attached (for Summarize)
            if (files && files.length > 0) {
                const formData = new FormData();
                formData.append("file", files[0].file);
                const res = await api.post("/summarize/", formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                return `### Document Summary\n\n${res.data.summary}\n\n**Verdict:** ${res.data.verdict}`;
            }

            // 3. Default: Search/Ask
            const res = await api.post("/search/", {
                query: text,
                domain: selectedDomain?.toUpperCase().replace(/ /g, "_") || "GENERAL"
            });

            const ans = res.data.structured_answer;
            let content = `${ans.green_layer}\n\n**Detailed Analysis:**\n${ans.yellow_layer}\n\n**Penalties/Strictness:**\n${ans.red_layer}\n\n**Citations:**\n`;
            res.data.citations.forEach((c: any) => {
                content += `- [${c.source} Sec ${c.section}](${c.url})\n`;
            });
            return content;

        } catch (err: any) {
            return `❌ Error: ${err.response?.data?.detail || "Could not connect to legal brain. Make sure the server is healthy."}`;
        }
    };

    const handleSubmit = async (input: { text: string; files?: any[] }) => {
        if (!input.text.trim() && (!input.files || input.files.length === 0)) return;

        let convId = selectedConversation;
        if (convId === null) {
            convId = createNewConversation(input.text || "New Document Analysis");
        }

        const userMsg: SDKMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: input.text,
            files: input.files?.map(f => ({ name: f.file.name, type: f.file.type, size: f.file.size }))
        };

        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        updateConversationMessages(convId, newMessages);
        setIsLoading(true);

        const aiResponse = await callBackend(input.text, input.files);

        const aiMsg: SDKMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: aiResponse,
        };
        const finalMessages = [...newMessages, aiMsg];
        setMessages(finalMessages);
        updateConversationMessages(convId!, finalMessages);
        setIsLoading(false);
    };

    const handleSuggestionClick = (suggestion: string) => {
        handleSubmit({ text: suggestion });
    };

    const handleNewQuery = () => {
        setSelectedConversation(null);
        setMessages([]);
        setSelectedDomain(null);
    };

    return (
        <div className="flex h-screen bg-white text-black overflow-hidden font-sans">
            {/* Sidebar */}
            <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-black text-white transition-all duration-300 flex flex-col overflow-hidden`}>
                <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
                    <span className="font-bold">SamvidhanAI</span>
                    <Plus className="cursor-pointer" onClick={handleNewQuery} />
                </div>
                <div className="flex-1 overflow-y-auto p-2">
                    {conversations.map(conv => (
                        <div key={conv.id} onClick={() => { setSelectedConversation(conv.id); setMessages(conv.messages); }} className={`p-3 rounded-lg cursor-pointer mb-1 text-sm truncate ${selectedConversation === conv.id ? 'bg-zinc-800' : 'hover:bg-zinc-900'}`}>
                            {conv.title}
                        </div>
                    ))}
                </div>
                <div className="p-4 border-t border-zinc-800 text-xs flex items-center gap-2">
                    <div className="w-6 h-6 bg-zinc-700 rounded-full flex items-center justify-center">{user?.username?.[0].toUpperCase() || 'U'}</div>
                    {user?.username || 'Guest'}
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col">
                <header className="p-4 border-b border-zinc-100 flex items-center justify-between">
                    <Menu className="cursor-pointer" onClick={() => setSidebarOpen(!sidebarOpen)} />
                    <div className="text-sm font-semibold">Legal Intelligence Hub</div>
                    <div />
                </header>

                <div className="flex-1 overflow-y-auto px-4 py-8">
                    <div className="max-w-3xl mx-auto">
                        {messages.length === 0 ? (
                            <div className="text-center py-20">
                                <Scale className="mx-auto w-12 h-12 mb-4 text-zinc-300" />
                                <h2 className="text-2xl font-bold mb-8">What can I help you research today?</h2>
                                <div className="grid grid-cols-2 gap-3">
                                    {suggestions.map((s, i) => (
                                        <div key={i} onClick={() => handleSuggestionClick(s)} className="p-4 border border-zinc-200 rounded-xl hover:bg-zinc-50 cursor-pointer text-sm font-medium">{s}</div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {messages.map(m => (
                                    <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] p-4 rounded-2xl ${m.role === 'user' ? 'bg-black text-white' : 'bg-zinc-50 text-zinc-900 border border-zinc-100'}`}>
                                            <div className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</div>
                                        </div>
                                    </div>
                                ))}
                                {isLoading && <div className="p-4 bg-zinc-50 rounded-2xl w-24 animate-pulse">...</div>}
                            </div>
                        )}
                    </div>
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-zinc-100 bg-white">
                    <div className="max-w-3xl mx-auto">
                        <PromptInputProvider>
                            <div className="border border-zinc-100 rounded-2xl shadow-sm overflow-hidden bg-zinc-50/50">
                                <PromptInput onSubmit={handleSubmit}>
                                    <PromptInputWrapper isGenerating={isLoading} onSubmit={handleSubmit} stopGeneration={() => setIsLoading(false)} />
                                </PromptInput>
                            </div>
                        </PromptInputProvider>
                    </div>
                </div>
            </main>
        </div>
    );
}