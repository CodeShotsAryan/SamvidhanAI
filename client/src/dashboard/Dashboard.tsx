"use client"

import React, { useState, useEffect } from 'react';
import { Menu, X, Plus, Search, MessageSquare, Scale, Gavel, Paperclip, Send, FileText, Book, Building2, Globe, Briefcase, User as UserIcon, GlobeIcon, Square, ArrowUp } from 'lucide-react';
import {
    PromptInput,
    PromptInputTextarea,
    PromptInputSubmit,
    PromptInputFooter,
    PromptInputButton,
    PromptInputAttachments,
    PromptInputAttachment,
    usePromptInputAttachments,
    PromptInputProvider,
    PromptInputBody,
    PromptInputTools,
    PromptInputActionMenu,
    PromptInputActionMenuTrigger,
    PromptInputActionMenuContent,
    PromptInputActionAddAttachments,
    PromptInputSpeechButton,
} from '../components/ai-elements/prompt-input';

import {
    Message,
    MessageContent,
} from '../components/ai-elements/message';

interface SDKMessage {
    id: string;
    role: 'user' | 'assistant' | 'system' | 'data';
    content: string;
}

interface Conversation {
    id: number;
    title: string;
    date: string;
    messages: SDKMessage[];
}

const LEGAL_DOMAINS = [
    'Criminal Law',
    'Constitutional Law',
    'Civil Law',
    'Corporate & Commercial Law',
    'Cyber & IT Law',
    'Environmental Law',
    'Labour & Employment Law',
    'Taxation Law',
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

export default function Dashboard() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
    const [conversations, setConversations] = useState<Conversation[]>([
        { id: 1, title: 'IPC Section 302 vs BNS 103', date: '2 hours ago', messages: [] },
        { id: 2, title: 'Corporate Law Compliance', date: 'Yesterday', messages: [] },
        { id: 3, title: 'Environmental Regulations 2024', date: '2 days ago', messages: [] },
        { id: 4, title: 'Supreme Court IT Act Judgments', date: '3 days ago', messages: [] },
        { id: 5, title: 'Legal Document Summary', date: '1 week ago', messages: [] },
    ]);
    const [messages, setMessages] = useState<SDKMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedDomain, setSelectedDomain] = useState<string | null>(null);

    // New state for custom input
    const [prompt, setPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);

    // Sync isLoading with isGenerating for UI consistency
    useEffect(() => {
        setIsGenerating(isLoading);
    }, [isLoading]);

    const suggestions = [
        'Compare IPC 420 vs BNS Section 318',
        'Summarize recent Supreme Court privacy judgments',
        'What are the new bail provisions under BNSS?',
        'Draft a legal notice for breach of contract',
    ];

    // Load messages when conversation is selected
    useEffect(() => {
        if (selectedConversation !== null) {
            const conv = conversations.find(c => c.id === selectedConversation);
            if (conv) {
                setMessages(conv.messages);
            }
        }
    }, [selectedConversation, conversations]);

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    const createNewConversation = (firstMessage: string) => {
        const newId = Math.max(...conversations.map(c => c.id), 0) + 1;
        const newConv: Conversation = {
            id: newId,
            title: firstMessage.slice(0, 50),
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

    const handleSuggestionClick = (suggestion: string) => {
        let convId = selectedConversation;
        if (convId === null) {
            convId = createNewConversation(suggestion);
        }

        const userMsg: SDKMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: suggestion,
        };

        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        updateConversationMessages(convId, newMessages);
        setIsLoading(true);

        // TODO: Replace with actual API call
        setTimeout(() => {
            const aiMsg: SDKMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: `Here is a preliminary analysis of "${suggestion}":\n\n[Detailed legal analysis would appear here based on RAG retrieval from BNS/IPC database...]\n\nSources:\n1. Bhartiya Nyaya Sanhita, 2023\n2. Supreme Court Case Law DB`,
            };
            const finalMessages = [...newMessages, aiMsg];
            setMessages(finalMessages);
            updateConversationMessages(convId!, finalMessages);
            setIsLoading(false);
        }, 1500);
    };

    const handleSubmit = (message: { text: string; files?: any[] }) => {
        if (!message.text.trim()) return;

        let convId = selectedConversation;
        if (convId === null) {
            convId = createNewConversation(message.text);
        }

        const userMsg: SDKMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: message.text,
        };

        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        updateConversationMessages(convId, newMessages);
        setIsLoading(true);

        // TODO: Replace with actual API call
        // const payload = {
        //     query: message.text,
        //     domain: selectedDomain,
        // };
        // fetch('/api/query', { method: 'POST', body: JSON.stringify(payload) })

        setTimeout(() => {
            const aiMsg: SDKMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: `Processing your query regarding: "${message.text}"...\n\nAccording to the relevant sections of the Bhartiya Nyaya Sanhita (BNS) and associated case law:\n\n1. Section Analysis...\n2. Key Precedents...\n\nPlease consult a legal professional for specific advice.`,
            };
            const finalMessages = [...newMessages, aiMsg];
            setMessages(finalMessages);
            updateConversationMessages(convId!, finalMessages);
            setIsLoading(false);
        }, 1500);
    };

    const submitPrompt = () => {
        handleSubmit({ text: prompt });
        setPrompt("");
    };

    const stopGeneration = () => {
        setIsLoading(false);
        setIsGenerating(false);
    };

    const handleNewQuery = () => {
        setSelectedConversation(null);
        setMessages([]);
        setSelectedDomain(null);
        setSidebarOpen(false);
    };

    const handleConversationClick = (id: number) => {
        setSelectedConversation(id);
        setSidebarOpen(false);
    };

    return (
        <div className="flex h-screen bg-white text-black overflow-hidden">
            {/* Sidebar */}
            <aside
                className={`${sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-0 lg:w-0'
                    } fixed lg:relative z-30 h-full bg-black text-white transition-all duration-300 ease-in-out flex flex-col overflow-hidden`}
            >
                {/* Logo */}
                <div className="p-4 border-b border-zinc-800 flex items-center justify-between min-w-[16rem]">
                    <div className="flex items-center gap-2">
                        <Scale className="w-5 h-5 text-white" />
                        <span className="font-semibold text-base tracking-tight text-white">SamvidhanAI</span>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden p-1.5 hover:bg-zinc-800 rounded transition-colors cursor-pointer text-zinc-400 hover:text-white"
                        aria-label="Close sidebar"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* New Query Button */}
                <div className="p-3 min-w-[16rem]">
                    <button
                        onClick={handleNewQuery}
                        className="w-full flex items-center justify-center gap-2 bg-white text-black py-2.5 px-4 rounded-lg hover:bg-zinc-100 transition-all duration-200 cursor-pointer font-medium text-sm"
                    >
                        <Plus className="w-4 h-4" />
                        New Query
                    </button>
                </div>

                {/* Conversations List */}
                <div className="flex-1 overflow-y-auto px-2 min-w-[16rem]">
                    <div className="text-xs text-zinc-500 px-3 mb-2 font-semibold uppercase tracking-wider">
                        Research History
                    </div>
                    {conversations.map((conv) => (
                        <button
                            key={conv.id}
                            onClick={() => handleConversationClick(conv.id)}
                            className={`w-full text-left p-2.5 rounded-lg mb-1 transition-all duration-200 cursor-pointer group ${selectedConversation === conv.id
                                ? 'bg-zinc-800 text-white'
                                : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                                }`}
                        >
                            <div className="flex items-start gap-2">
                                <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0 opacity-70" />
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium truncate">{conv.title}</div>
                                    <div className="text-xs opacity-60 mt-0.5">{conv.date}</div>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Settings */}
                <div className="p-3 border-t border-zinc-800 min-w-[16rem]">
                    <button className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-white transition-colors duration-200 cursor-pointer text-sm">
                        <UserIcon className="w-4 h-4" />
                        <span className="font-medium">Settings</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full overflow-hidden bg-white">
                {/* Header */}
                <header className="bg-white border-b border-zinc-200 px-4 lg:px-6 py-3 flex items-center justify-between z-10">
                    <div className="flex items-center gap-3">
                        {!sidebarOpen && (
                            <button
                                onClick={toggleSidebar}
                                className="p-2 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer text-zinc-600"
                                aria-label="Toggle sidebar"
                            >
                                <Menu className="w-5 h-5" />
                            </button>
                        )}
                        {sidebarOpen && (
                            <button
                                onClick={toggleSidebar}
                                className="p-2 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer text-zinc-600 hidden lg:block"
                                aria-label="Toggle sidebar"
                            >
                                <Menu className="w-5 h-5" />
                            </button>
                        )}
                        {sidebarOpen && (
                            <button
                                onClick={toggleSidebar}
                                className="p-2 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer text-zinc-600 lg:hidden"
                                aria-label="Toggle sidebar"
                            >
                                <Menu className="w-5 h-5" />
                            </button>
                        )}
                        <span className="text-sm font-semibold text-zinc-800 lg:hidden">SamvidhanAI</span>
                    </div>

                    {/* Profile Section */}
                    <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer text-zinc-600" aria-label="Search">
                            <Search className="w-4 h-4" />
                        </button>
                        <button className="flex items-center gap-2 p-1.5 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer">
                            <div className="w-7 h-7 bg-black text-white rounded-full flex items-center justify-center font-semibold text-xs">
                                SB
                            </div>
                        </button>
                    </div>
                </header>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto w-full">
                    <div className="max-w-4xl mx-auto px-4 lg:px-6 py-6 lg:py-10">
                        {messages.length === 0 ? (
                            <div className="mt-8 lg:mt-16 text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-zinc-50 text-zinc-900 rounded-2xl mb-5 border border-zinc-200">
                                    <Scale className="w-8 h-8" />
                                </div>

                                {/* Domain Filters */}
                                <div className="mb-8">
                                    <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
                                        Filter by Domain
                                    </div>
                                    <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
                                        {LEGAL_DOMAINS.map((domain) => {
                                            const Icon = DOMAIN_ICONS[domain];
                                            return (
                                                <button
                                                    key={domain}
                                                    onClick={() => setSelectedDomain(selectedDomain === domain ? null : domain)}
                                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 cursor-pointer ${selectedDomain === domain
                                                        ? 'bg-black text-white'
                                                        : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                                                        }`}
                                                >
                                                    <Icon className="w-3 h-3" />
                                                    {domain}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Suggestions */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-3xl mx-auto text-left">
                                    {suggestions.map((suggestion, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleSuggestionClick(suggestion)}
                                            className="p-4 border border-zinc-200 rounded-xl hover:border-zinc-400 hover:shadow-md hover:bg-zinc-50 transition-all duration-200 cursor-pointer group flex items-start gap-3 bg-white"
                                        >
                                            <Gavel className="w-4 h-4 mt-0.5 text-zinc-400 group-hover:text-zinc-900 transition-colors flex-shrink-0" />
                                            <div className="text-sm font-medium text-zinc-700 group-hover:text-zinc-900">{suggestion}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6 pb-24">
                                {messages.map((m) => (
                                    <Message
                                        key={m.id}
                                        from={m.role === 'user' ? 'user' : 'assistant'}
                                    >
                                        <MessageContent className="text-sm lg:text-base">
                                            {m.content}
                                        </MessageContent>
                                    </Message>
                                ))}
                                {isLoading && (
                                    <Message from="assistant">
                                        <MessageContent>
                                            <div className="flex items-center gap-2 text-zinc-500">
                                                <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                            </div>
                                        </MessageContent>
                                    </Message>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Input Area */}
                <div className="border-t border-zinc-200 bg-white px-4 lg:px-6 py-4 sticky bottom-0 z-20">
                    <div className="max-w-4xl mx-auto">
                        {selectedDomain && (
                            <div className="mb-2 flex items-center gap-2">
                                <span className="text-xs text-zinc-500">Filtering by:</span>
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-black text-white text-xs font-medium rounded-full">
                                    {React.createElement(DOMAIN_ICONS[selectedDomain], { className: "w-3 h-3" })}
                                    {selectedDomain}
                                    <button
                                        onClick={() => setSelectedDomain(null)}
                                        className="ml-1 hover:bg-zinc-800 rounded-full p-0.5 transition-colors"
                                        aria-label="Remove filter"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            </div>
                        )}
                        <PromptInputProvider>
                            <PromptInput
                                onSubmit={handleSubmit}
                                className="bg-white rounded-xl border border-zinc-200 shadow-sm hover:border-zinc-300 focus-within:border-zinc-300 focus-within:ring-0 outline-none focus-within:outline-none transition-all"
                            >
                                <PromptInputBody className="bg-white border-none shadow-none outline-none">
                                    <PromptInputTextarea
                                        onChange={(e) => !isGenerating && setPrompt(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && !isGenerating && (e.preventDefault(), submitPrompt())}
                                        value={prompt}
                                        disabled={isGenerating}
                                        placeholder={isGenerating ? "Generating..." : "Ask a legal question... (e.g. 'Compare IPC 420 vs BNS 318')"}
                                        className="bg-transparent text-black placeholder:text-zinc-400 resize-none min-h-[60px] disabled:opacity-50 border-none focus:ring-0 shadow-none focus-visible:ring-0 outline-none focus:outline-none focus-visible:outline-none ring-0"
                                    />
                                </PromptInputBody>
                                <PromptInputFooter className="bg-white rounded-xl border-none">
                                    <PromptInputTools>
                                        <PromptInputActionMenu>
                                            <PromptInputActionMenuTrigger
                                                className="text-zinc-400 hover:text-zinc-900"
                                            >
                                                <Paperclip className="w-4 h-4" />
                                            </PromptInputActionMenuTrigger>
                                            <PromptInputActionMenuContent>
                                                <PromptInputActionAddAttachments />
                                            </PromptInputActionMenuContent>
                                        </PromptInputActionMenu>
                                    </PromptInputTools>
                                    {isGenerating ? (
                                        <button onClick={stopGeneration} className="bg-zinc-100 text-black hover:bg-zinc-200 rounded-lg px-3 py-2">
                                            <Square className="w-4 h-4" fill="currentColor" />
                                        </button>
                                    ) : (
                                        <PromptInputSubmit
                                            onClick={submitPrompt}
                                            disabled={!prompt.trim()}
                                            status="ready"
                                            className="bg-zinc-900 text-white hover:bg-zinc-800 disabled:bg-zinc-100 disabled:text-zinc-500"
                                        >
                                            <ArrowUp className="w-5 h-5" />
                                        </PromptInputSubmit>
                                    )}
                                </PromptInputFooter>
                            </PromptInput>
                        </PromptInputProvider>
                        <div className="text-xs text-zinc-500 text-center mt-2 font-medium">
                            SamvidhanAI provides legal information for research purposes. Verify with official sources.
                        </div>
                    </div>
                </div>

                {/* Overlay for mobile sidebar */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/60 z-20 lg:hidden transition-opacity duration-300"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}
            </main>
        </div>
    );
}