"use client"

import React, { useState, useEffect } from 'react';
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
    PromptInputAttachment,
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
    // 'Constitutional Law',
    // 'Civil Law',
    'Corporate & Commercial Law',
    'Cyber & IT Law',
    // 'Environmental Law',
    // 'Labour & Employment Law',
    // 'Taxation Law',
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
            <span className="font-medium truncate max-w-[200px]">{file.filename || 'Attachment'}</span>
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
    const [hasLoadedFromStorage, setHasLoadedFromStorage] = useState(false);

    // Load from localStorage on mount and set the controller's value
    useEffect(() => {
        if (!hasLoadedFromStorage) {
            const savedPrompt = localStorage.getItem('samvidhan-draft-prompt');
            if (savedPrompt) {
                controller.textInput.setInput(savedPrompt);
            }
            setHasLoadedFromStorage(true);
        }
    }, [hasLoadedFromStorage, controller]);

    // Save to localStorage whenever text changes
    useEffect(() => {
        if (hasLoadedFromStorage) {
            const text = controller.textInput.value;
            if (text) {
                localStorage.setItem('samvidhan-draft-prompt', text);
            } else {
                localStorage.removeItem('samvidhan-draft-prompt');
            }
        }
    }, [controller.textInput.value, hasLoadedFromStorage]);

    const handleSubmit = () => {
        const text = controller.textInput.value;
        if (!text.trim()) return;
        onSubmit({ text });
        controller.textInput.clear();
        localStorage.removeItem('samvidhan-draft-prompt');
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
                    placeholder={isGenerating ? "Generating..." : "Ask a legal question... (e.g. 'Compare IPC 420 vs BNS 318')"}
                    className="bg-transparent text-black placeholder:text-zinc-400 resize-none min-h-[44px] max-h-[200px] text-sm lg:text-base disabled:opacity-50 py-2.5"
                />
            </PromptInputBody>
            <PromptInputFooter className="bg-white border-t border-zinc-100">
                <PromptInputTools>
                    <AttachButton />
                </PromptInputTools>
                {isGenerating ? (
                    <button onClick={stopGeneration} className="bg-zinc-100 text-black hover:bg-zinc-200 rounded-lg px-3 py-2 transition-opacity duration-200">
                        <Square className="w-4 h-4" fill="currentColor" />
                    </button>
                ) : (
                    <PromptInputSubmit
                        onClick={handleSubmit}
                        disabled={!controller.textInput.value.trim()}
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
    const [isGenerating, setIsGenerating] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<{ name: string; type: string; size: number }[]>([]);

    useEffect(() => {
        setIsGenerating(isLoading);
    }, [isLoading]);

    const suggestions = [
        'Compare IPC 420 vs BNS Section 318',
        'Summarize recent Supreme Court privacy judgments',
        'What are the new bail provisions under BNSS?',
        'Draft a legal notice for breach of contract',
    ];

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

        const fileData = message.files?.map((f: any) => ({
            name: f.name,
            type: f.type,
            size: f.size
        })) || [];

        const userMsg: SDKMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: message.text,
            files: fileData.length > 0 ? fileData : undefined,
        };

        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        updateConversationMessages(convId, newMessages);
        setIsLoading(true);

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



    const handleNewQuery = () => {
        setSelectedConversation(null);
        setMessages([]);
        setSelectedDomain(null);
        if (window.innerWidth < 1024) {
            setSidebarOpen(false);
        }
    };

    const handleConversationClick = (id: number) => {
        setSelectedConversation(id);
    };

    return (
        <div className="flex h-screen bg-white text-black overflow-hidden">
            <aside
                className={`${sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-0 lg:w-0'
                    } fixed lg:relative z-30 h-full bg-black text-white transition-all duration-300 ease-in-out flex flex-col overflow-hidden`}
            >
                <div className="p-4 border-b border-zinc-800 flex items-center justify-between min-w-[16rem]">
                    <div className="flex items-center gap-2">
                        <Scale className="w-5 h-5 text-white" />
                        <span className="font-semibold text-base tracking-tight text-white">SamvidhanAI</span>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden p-1.5 hover:bg-zinc-800 rounded transition-opacity duration-200 cursor-pointer text-zinc-400 hover:text-white"
                        aria-label="Close sidebar"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-3 min-w-[16rem]">
                    <button
                        onClick={handleNewQuery}
                        className="w-full flex items-center justify-center gap-2 bg-white text-black py-2.5 px-4 rounded-lg hover:bg-zinc-100 transition-opacity duration-200 cursor-pointer font-medium text-sm"
                    >
                        <Plus className="w-4 h-4" />
                        New Query
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-2 min-w-[16rem]">
                    <div className="text-xs text-zinc-400 px-3 mb-3 mt-2 font-semibold uppercase tracking-wider">
                        Research History
                    </div>
                    {conversations.map((conv) => (
                        <button
                            key={conv.id}
                            onClick={() => handleConversationClick(conv.id)}
                            className={`w-full text-left p-3 rounded-lg mb-2 transition-opacity duration-200 group ${selectedConversation === conv.id
                                ? 'bg-zinc-800 text-white'
                                : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
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

                <div className="p-3 border-t border-zinc-800 min-w-[16rem]">
                    <button className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-white transition-opacity duration-200 cursor-pointer text-sm">
                        <User className="w-4 h-4" />
                        <span className="font-medium">Settings</span>
                    </button>
                </div>
            </aside>

            <main className="flex-1 flex flex-col h-full overflow-hidden bg-white">
                <header className="bg-white border-b border-zinc-200 px-4 lg:px-6 py-3 flex items-center justify-between z-10">
                    <div className="flex items-center gap-3">
                        {!sidebarOpen && (
                            <button
                                onClick={toggleSidebar}
                                className="p-2 hover:bg-zinc-100 rounded-lg transition-opacity duration-200 cursor-pointer text-zinc-600"
                                aria-label="Toggle sidebar"
                            >
                                <Menu className="w-5 h-5" />
                            </button>
                        )}
                        {sidebarOpen && (
                            <button
                                onClick={toggleSidebar}
                                className="p-2 hover:bg-zinc-100 rounded-lg transition-opacity duration-200 cursor-pointer text-zinc-600 hidden lg:block"
                                aria-label="Toggle sidebar"
                            >
                                <Menu className="w-5 h-5" />
                            </button>
                        )}
                        {sidebarOpen && (
                            <button
                                onClick={toggleSidebar}
                                className="p-2 hover:bg-zinc-100 rounded-lg transition-opacity duration-200 cursor-pointer text-zinc-600 lg:hidden"
                                aria-label="Toggle sidebar"
                            >
                                <Menu className="w-5 h-5" />
                            </button>
                        )}
                        <span className="text-sm font-semibold text-zinc-800 lg:hidden">SamvidhanAI</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-zinc-100 rounded-lg transition-opacity duration-200 cursor-pointer text-zinc-600" aria-label="Search">
                            <Search className="w-4 h-4" />
                        </button>
                        <button className="flex items-center gap-2 p-1.5 hover:bg-zinc-100 rounded-lg transition-opacity duration-200 cursor-pointer">
                            <div className="w-7 h-7 bg-black text-white rounded-full flex items-center justify-center font-semibold text-xs">
                                SB
                            </div>
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto w-full">
                    <div className="max-w-4xl mx-auto px-4 lg:px-6 py-6 lg:py-10">
                        {messages.length === 0 ? (
                            <div className="mt-8 lg:mt-16 text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-zinc-50 text-zinc-900 rounded-2xl mb-5 border border-zinc-200">
                                    <Scale className="w-8 h-8" />
                                </div>

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
                                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-opacity duration-200 cursor-pointer ${selectedDomain === domain
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

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-3xl mx-auto text-left">
                                    {suggestions.map((suggestion, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleSuggestionClick(suggestion)}
                                            className="p-4 border border-zinc-200 rounded-xl hover:border-zinc-400 hover:shadow-md hover:bg-zinc-50 transition-opacity duration-200 cursor-pointer group flex items-start gap-3 bg-white"
                                        >
                                            <Gavel className="w-4 h-4 mt-0.5 text-zinc-400 group-hover:text-zinc-900 transition-opacity duration-200 flex-shrink-0" />
                                            <div className="text-sm font-medium text-zinc-700 group-hover:text-zinc-900">{suggestion}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-8 pb-24">
                                {messages.map((m) => (
                                    <Message
                                        key={m.id}
                                        from={m.role === 'user' ? 'user' : 'assistant'}
                                    >
                                        <MessageContent className="text-sm lg:text-base">
                                            {m.content}
                                            {m.files && m.files.length > 0 && (
                                                <div className="mt-2 flex flex-wrap gap-2">
                                                    {m.files.map((file, idx) => (
                                                        <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 rounded-lg text-xs text-zinc-700">
                                                            <FileText className="w-3 h-3" />
                                                            <span className="font-medium">{file.name}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </MessageContent>
                                    </Message>
                                ))}
                                {isLoading && (
                                    <Message from="assistant">
                                        <MessageContent>
                                            <Shimmer className="text-sm lg:text-base">Analyzing your legal query...</Shimmer>
                                        </MessageContent>
                                    </Message>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="border-t border-zinc-200 bg-white px-4 lg:px-6 py-4 sticky bottom-0 z-20">
                    <div className="max-w-3xl mx-auto">
                        {selectedDomain && (
                            <div className="mb-2 flex items-center gap-2">
                                <span className="text-xs text-zinc-500">Filtering by:</span>
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-black text-white text-xs font-medium rounded-full">
                                    {React.createElement(DOMAIN_ICONS[selectedDomain], { className: "w-3 h-3" })}
                                    {selectedDomain}
                                    <button
                                        onClick={() => setSelectedDomain(null)}
                                        className="ml-1 hover:bg-zinc-800 rounded-full p-0.5 transition-opacity duration-200"
                                        aria-label="Remove filter"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            </div>
                        )}
                        <PromptInputProvider>
                            <div className="border border-zinc-200 rounded-xl transition-opacity duration-200 bg-white overflow-hidden shadow-sm">
                                <PromptInput
                                    onSubmit={handleSubmit}
                                    className="border-0"
                                >
                                    <PromptInputWrapper
                                        isGenerating={isGenerating}
                                        onSubmit={handleSubmit}
                                        stopGeneration={() => {
                                            setIsLoading(false);
                                            setIsGenerating(false);
                                        }}
                                    />
                                </PromptInput>
                            </div>
                        </PromptInputProvider>
                        <div className="text-xs text-zinc-500 text-center mt-2 font-medium">
                            SamvidhanAI provides legal information for research purposes. Verify with official sources.
                        </div>
                    </div>
                </div>

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