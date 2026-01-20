"use client"

import React, { useState, useEffect } from 'react';
import { Menu, X, Plus, Search, MessageSquare, Scale, Gavel, Paperclip, FileText, Book, Building2, Globe, Briefcase, User, Square, ArrowUp, LogOut, MessageCircleCode, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { API_ENDPOINTS } from '@/src/lib/config';
import { renderMarkdown } from '@/src/lib/markdown';
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
} from '../ai-elements/prompt-input';

import {
    Message,
    MessageContent,
} from '../ai-elements/message';

import { Shimmer } from '../ai-elements/shimmer';

interface SDKMessage {
    id: string;
    role: 'user' | 'assistant' | 'system' | 'data';
    content: string;
    files?: { name: string; type: string; size: number }[];
    sources?: { act: string; section: string; text: string }[];
    comparison?: {
        title: string;
        ipc_section: string;
        bns_section: string;
        ipc_desc: string;
        bns_desc: string;
        key_changes: string;
    };
}

interface Conversation {
    id: number;
    title: string;
    date: string;
    messages: SDKMessage[];
}

interface UserData {
    id: number;
    username: string;
    email: string;
    full_name?: string;
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
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [messages, setMessages] = useState<SDKMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [conversationsLoading, setConversationsLoading] = useState(false);
    const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<{ name: string; type: string; size: number }[]>([]);
    const [user, setUser] = useState<UserData | null>(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [conversationToDelete, setConversationToDelete] = useState<number | null>(null);
    const [showSources, setShowSources] = useState<Record<string, boolean>>({});
    const messagesEndRef = React.useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Check authentication and fetch user data
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/auth/login');
                return;
            }

            try {
                const response = await axios.get(API_ENDPOINTS.auth.me, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setUser(response.data);
                setAuthLoading(false);
                // Fetch conversations after auth succeeds
                fetchConversations(token);
            } catch (error) {
                console.error('Auth error:', error);
                localStorage.removeItem('token');
                router.push('/auth/login');
            }
        };

        checkAuth();
    }, [router]);

    // Fetch user's conversations from backend
    const fetchConversations = async (token?: string) => {
        const authToken = token || localStorage.getItem('token');
        if (!authToken) return;

        setConversationsLoading(true);
        try {
            const response = await axios.get(API_ENDPOINTS.conversations.list, {
                headers: { Authorization: `Bearer ${authToken}` },
            });
            setConversations(response.data);
        } catch (error) {
            console.error('Error fetching conversations:', error);
        } finally {
            setConversationsLoading(false);
        }
    };

    // Create new conversation in backend
    const createConversation = async (title: string) => {
        const token = localStorage.getItem('token');
        if (!token) return null;

        try {
            const response = await axios.post(
                API_ENDPOINTS.conversations.create,
                {
                    title: title.slice(0, 50),
                    domain_filter: selectedDomain,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setConversations(prev => [response.data, ...prev]);
            return response.data.id;
        } catch (error) {
            console.error('Error creating conversation:', error);
            return null;
        }
    };

    // Save message to backend
    const saveMessage = async (conversationId: number, role: string, content: string, sources?: any[]) => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            await axios.post(
                API_ENDPOINTS.conversations.saveMessage(conversationId),
                { role, content, sources: sources || [] },
                { headers: { Authorization: `Bearer ${token}` } }
            );
        } catch (error) {
            console.error('Error saving message:', error);
        }
    };

    // Load conversation messages from backend
    const loadConversation = async (conversationId: number) => {
        const token = localStorage.getItem('token');
        if (!token) return;

        setIsLoading(true);
        try {
            const response = await axios.get(
                API_ENDPOINTS.conversations.get(conversationId),
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessages(response.data.messages);
        } catch (error) {
            console.error('Error loading conversation:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        router.push('/auth/login');
    };

    const getUserInitials = () => {
        if (!user) return 'U';
        if (user.full_name) {
            const names = user.full_name.split(' ');
            if (names.length >= 2) {
                return `${names[0][0]}${names[1][0]}`.toUpperCase();
            }
            return user.full_name[0].toUpperCase();
        }
        return user.username[0].toUpperCase();
    };

    useEffect(() => {
        setIsGenerating(isLoading);
    }, [isLoading]);

    const suggestions = [
        'Compare IPC 420 vs BNS Section 318',
        'Summarize recent Supreme Court privacy judgments',
        'What are the new bail provisions under BNSS?',
        'Draft a legal notice for breach of contract',
    ];

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    const handleSuggestionClick = async (suggestion: string) => {
        let convId = selectedConversation;
        if (convId === null) {
            convId = await createConversation(suggestion);
            if (!convId) return;
            setSelectedConversation(convId);
        }

        const userMsg: SDKMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: suggestion,
        };

        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setIsLoading(true);

        // Save user message to backend
        await saveMessage(convId, 'user', suggestion);

        // Call RAG API for AI response
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                API_ENDPOINTS.chat,
                {
                    message: suggestion,
                    conversation_id: convId,
                    domain: selectedDomain
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            const aiMsg: SDKMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response.data.response,
                sources: response.data.sources,
                comparison: response.data.comparison
            };
            const finalMessages = [...newMessages, aiMsg];
            setMessages(finalMessages);

            // Save assistant message to backend
            await saveMessage(convId!, 'assistant', aiMsg.content, response.data.sources);

            // Refresh conversations list
            fetchConversations();
        } catch (error) {
            console.error('Error getting AI response:', error);
            const errorMsg: SDKMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'Sorry, I encountered an error processing your request. Please try again.',
            };
            setMessages([...newMessages, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (message: { text: string; files?: any[] }) => {
        if (!message.text.trim()) return;

        let convId = selectedConversation;

        // Create new conversation if none selected
        if (convId === null) {
            convId = await createConversation(message.text);
            if (!convId) return;
            setSelectedConversation(convId);
        }

        const fileData = message.files?.map((f: any) => ({
            name: f.name,
            type: f.type,
            size: f.size,
        })) || [];

        const userMsg: SDKMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: message.text,
            files: fileData.length > 0 ? fileData : undefined,
        };

        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setIsLoading(true);

        // Save user message to backend
        await saveMessage(convId, 'user', message.text);

        // Call RAG API for AI response
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                API_ENDPOINTS.chat,
                {
                    message: message.text,
                    conversation_id: convId,
                    domain: selectedDomain
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            const aiMsg: SDKMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response.data.response,
                sources: response.data.sources
            };
            const finalMessages = [...newMessages, aiMsg];
            setMessages(finalMessages);

            // Save assistant message to backend
            await saveMessage(convId!, 'assistant', aiMsg.content, response.data.sources);

            // Refresh conversations list
            fetchConversations();
        } catch (error) {
            console.error('Error getting AI response:', error);
            const errorMsg: SDKMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'Sorry, I encountered an error processing your request. Please try again.',
            };
            setMessages([...newMessages, errorMsg]);
        } finally {
            setIsLoading(false);
        }
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
        loadConversation(id);
        // Close sidebar on mobile after selecting conversation
        if (window.innerWidth < 1024) {
            setSidebarOpen(false);
        }
    };

    const openDeleteModal = (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setConversationToDelete(id);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!conversationToDelete) return;

        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            await axios.delete(API_ENDPOINTS.conversations.delete(conversationToDelete), {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Remove from local state
            setConversations(prev => prev.filter(conv => conv.id !== conversationToDelete));

            // If deleted conversation was selected, clear selection
            if (selectedConversation === conversationToDelete) {
                setSelectedConversation(null);
                setMessages([]);
            }
        } catch (error) {
            console.error('Error deleting conversation:', error);
        } finally {
            setDeleteModalOpen(false);
            setConversationToDelete(null);
        }
    };

    // Show loading while checking auth
    if (authLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-white">
                <div className="text-center">
                    <Scale className="w-12 h-12 text-black mx-auto mb-4 animate-pulse" />
                    <p className="text-zinc-600">Loading...</p>
                </div>
            </div>
        );
    }

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
                        className="w-full flex items-center justify-center gap-2 bg-white text-black py-2 my-4 px-4 rounded-lg hover:bg-zinc-100 transition-opacity duration-200 cursor-pointer font-medium text-sm"
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
                        <div
                            key={conv.id}
                            className={`w-full group relative flex items-center p-3 rounded-lg mb-2 transition-all duration-200 cursor-pointer ${selectedConversation === conv.id
                                ? 'bg-zinc-800 text-white'
                                : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
                                }`}
                            onClick={() => handleConversationClick(conv.id)}
                        >
                            <div className="flex items-start gap-2 flex-1 min-w-0">
                                <MessageCircleCode className="w-4 h-4 mt-0.5 flex-shrink-0 opacity-70" />
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium truncate">{conv.title}</div>
                                    <div className="text-xs opacity-60 mt-0.5">{conv.date}</div>
                                </div>
                            </div>
                            <button
                                onClick={(e) => openDeleteModal(conv.id, e)}
                                className="relative z-10 p-1.5 hover:bg-zinc-700 rounded-md transition-all duration-200 text-zinc-400 hover:text-rose-400 shrink-0"
                                aria-label="Delete conversation"
                                type="button"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>

                <div className="p-3 border-t border-zinc-800 min-w-[16rem]">
                    <div className="flex items-center gap-3 p-2.5 rounded-lg text-zinc-300 mb-2">
                        <div className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center font-semibold text-sm">
                            {getUserInitials()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-white truncate">
                                {user?.full_name || user?.username || 'User'}
                            </div>
                            <div className="text-xs text-zinc-400 truncate">{user?.email}</div>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-white transition-opacity duration-200 cursor-pointer text-sm"
                    >
                        <LogOut className="w-4 h-4" />
                        <span className="font-medium">Logout</span>
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
                                {getUserInitials()}
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
                                {messages.map((m) => {
                                    const isAssistant = m.role === 'assistant';
                                    let layeredContent = null;

                                    if (isAssistant) {
                                        try {
                                            const parsed = JSON.parse(m.content);

                                            if (parsed.casual) {
                                                layeredContent = null;
                                            } else {
                                                const law = parsed.law;
                                                const examples = parsed.examples;
                                                const answer = parsed.simple_answer;

                                                if (law || examples || answer) {
                                                    layeredContent = {
                                                        law: law,
                                                        examples: examples,
                                                        answer: answer
                                                    };
                                                }
                                            }
                                        } catch (e) {
                                            layeredContent = null;
                                        }
                                    }

                                    return (
                                        <div
                                            key={m.id}
                                            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`p-2 sm:p-4 rounded-2xl inline-block ${m.role === 'user'
                                                    ? 'bg-zinc-100 max-w-[85%]'
                                                    : 'bg-white max-w-[95%]'
                                                    }`}
                                            >
                                                <div className="text-sm lg:text-base">
                                                    {layeredContent ? (
                                                        <div className="space-y-4 w-full">
                                                            {layeredContent.law && (
                                                                <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 shadow-sm">
                                                                    <div className="flex items-center gap-2 mb-3 text-green-600 font-semibold text-sm">
                                                                        <Scale className="w-4 h-4 text-green-600" /> The Law
                                                                    </div>
                                                                    <div
                                                                        className="text-zinc-800 leading-relaxed"
                                                                        dangerouslySetInnerHTML={{ __html: renderMarkdown(layeredContent.law) }}
                                                                    />
                                                                </div>
                                                            )}
                                                            {layeredContent.examples && (
                                                                <div className="bg-white border border-zinc-100 rounded-xl p-4 shadow-sm">
                                                                    <div className="flex items-center gap-2 mb-3 text-yellow-600 font-semibold text-sm">
                                                                        <Book className="w-4 h-4 text-yellow-600" /> Real Examples
                                                                    </div>
                                                                    <div
                                                                        className="text-zinc-700 leading-relaxed"
                                                                        dangerouslySetInnerHTML={{ __html: renderMarkdown(layeredContent.examples) }}
                                                                    />
                                                                </div>
                                                            )}
                                                            {layeredContent.answer && (
                                                                <div className="bg-white border border-zinc-100  rounded-xl p-4 shadow-sm">
                                                                    <div className="flex items-center gap-2 mb-3 text-blue-600  font-semibold text-sm">
                                                                        <MessageSquare className="w-4 h-4 text-blue-600" /> Simple Explanation
                                                                    </div>
                                                                    <div
                                                                        className="text-zinc-700 leading-relaxed"
                                                                        dangerouslySetInnerHTML={{ __html: renderMarkdown(layeredContent.answer) }}
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="whitespace-pre-wrap leading-relaxed">
                                                            {(() => {
                                                                try {
                                                                    const parsed = JSON.parse(m.content);
                                                                    if (parsed.casual) {
                                                                        return parsed.casual;
                                                                    }
                                                                    return m.content;
                                                                } catch (e) {
                                                                    return m.content;
                                                                }
                                                            })()}
                                                        </div>
                                                    )}

                                                    {m.sources && m.sources.length > 0 && (
                                                        <div className="mt-6 border-t border-zinc-100 pt-4">
                                                            <button
                                                                onClick={() => setShowSources(prev => ({ ...prev, [m.id]: !prev[m.id] }))}
                                                                className="flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition-colors"
                                                            >
                                                                <FileText className="w-3.5 h-3.5" />
                                                                Sources Used ({m.sources.length})
                                                                {showSources[m.id] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                                            </button>

                                                            {showSources[m.id] && (
                                                                <div className="mt-3 space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                                                                    {m.sources.map((source, idx) => (
                                                                        <div key={idx} className="p-3 bg-zinc-50 border border-zinc-100 rounded-xl text-xs">
                                                                            <div className="font-bold text-zinc-900 flex items-center gap-1.5 mb-1">
                                                                                <div className="w-1 h-1 rounded-full bg-zinc-400" />
                                                                                {source.act} {source.section !== 'N/A' && `- Section ${source.section}`}
                                                                            </div>
                                                                            <div className="text-zinc-600 leading-relaxed italic line-clamp-3">
                                                                                "{source.text}"
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {m.files && m.files.length > 0 && (
                                                        <div className="mt-4 flex flex-wrap gap-2">
                                                            {m.files.map((file, idx) => (
                                                                <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 rounded-lg text-xs text-zinc-700">
                                                                    <FileText className="w-3 h-3" />
                                                                    <span className="font-medium">{file.name}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                {isLoading && (
                                    <Message from="assistant">
                                        <MessageContent>
                                            <Shimmer className="text-sm lg:text-base">Analyzing your legal query...</Shimmer>
                                        </MessageContent>
                                    </Message>
                                )}
                                <div ref={messagesEndRef} />
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

                <DeleteConfirmationModal
                    isOpen={deleteModalOpen}
                    onClose={() => {
                        setDeleteModalOpen(false);
                        setConversationToDelete(null);
                    }}
                    onConfirm={confirmDelete}
                />
            </main>
        </div>
    );
}