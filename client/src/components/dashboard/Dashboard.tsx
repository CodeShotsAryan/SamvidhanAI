"use client"

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Menu, X, Search, Scale, Square, ArrowUp, FileText, Paperclip, User2Icon } from 'lucide-react';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import Sidebar from './Sidebar';
import WelcomeScreen from './WelcomeScreen';
import MessageList from './MessageList';
import axios from 'axios';
import { API_ENDPOINTS } from '@/src/lib/config';
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
} from '../ai-elements/prompt-input';

interface SDKMessage {
    id: string;
    role: 'user' | 'assistant' | 'system' | 'data';
    content: string;
    files?: { name: string; type: string; size: number }[];
    citations?: { id: number; title: string; source: string; section?: string; url: string }[];
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

const DOMAIN_ICONS: Record<string, any> = {
    'Criminal Law': Scale,
    'Corporate & Commercial Law': Scale,
    'Cyber & IT Law': Scale,
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

    useEffect(() => {
        if (!hasLoadedFromStorage) {
            const savedPrompt = localStorage.getItem('samvidhan-draft-prompt');
            if (savedPrompt) {
                controller.textInput.setInput(savedPrompt);
            }
            setHasLoadedFromStorage(true);
        }
    }, [hasLoadedFromStorage, controller]);

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
                    <User2Icon className="w-4 h-4" />
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
    const searchParams = useSearchParams();
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
    const messagesEndRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

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

                fetchConversations(token);
            } catch (error) {
                console.error('Auth error:', error);
                localStorage.removeItem('token');
                router.push('/auth/login');
            }
        };

        checkAuth();
    }, [router]);

    // Load conversation from URL on mount
    useEffect(() => {
        const convId = searchParams.get('c');
        if (convId && !authLoading) {
            const id = parseInt(convId);
            if (!isNaN(id)) {
                setSelectedConversation(id);
                loadConversationMessages(id);
            }
        }
    }, [searchParams, authLoading]);

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

    const saveMessage = async (conversationId: number, role: string, content: string, citations?: any[]) => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            await axios.post(
                API_ENDPOINTS.conversations.saveMessage(conversationId),
                { role, content, sources: [], citations: citations || [] },
                { headers: { Authorization: `Bearer ${token}` } }
            );
        } catch (error) {
            console.error('Error saving message:', error);
        }
    };

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

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    const loadConversationMessages = async (conversationId: number) => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const response = await axios.get(
                API_ENDPOINTS.conversations.get(conversationId),
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessages(response.data.messages || []);
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    };

    const handleConversationClick = (id: number) => {
        setSelectedConversation(id);
        router.push(`/dashboard?c=${id}`);
        loadConversationMessages(id);
        if (window.innerWidth < 1024) {
            setSidebarOpen(false);
        }
    };

    const handleNewQuery = () => {
        setSelectedConversation(null);
        setMessages([]);
        router.push('/dashboard');
    };

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

        await saveMessage(convId, 'user', suggestion);

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
                citations: response.data.citations,
                comparison: response.data.comparison
            };
            const finalMessages = [...newMessages, aiMsg];
            setMessages(finalMessages);

            await saveMessage(convId!, 'assistant', aiMsg.content, aiMsg.citations);

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

        await saveMessage(convId, 'user', message.text);

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
                citations: response.data.citations
            };
            const finalMessages = [...newMessages, aiMsg];
            setMessages(finalMessages);

            await saveMessage(convId!, 'assistant', aiMsg.content, aiMsg.citations);

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

            setConversations(prev => prev.filter(conv => conv.id !== conversationToDelete));

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
            <Sidebar
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                conversations={conversations}
                selectedConversation={selectedConversation}
                user={user}
                onNewQuery={handleNewQuery}
                onConversationClick={handleConversationClick}
                onDeleteConversation={openDeleteModal}
                onLogout={handleLogout}
            />

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
                        <button
                            onClick={() => router.push('/dashboard/summarize')}
                            className="hidden sm:flex items-center gap-2 px-4 cursor-pointer py-2 bg-black text-white rounded-lg hover:bg-zinc-800 transition-colors text-sm font-medium"
                        >
                            <FileText className="w-4 h-4" />
                            <span className="hidden md:inline">Summarize PDF</span>
                        </button>
                        <button
                            onClick={() => router.push('/dashboard/summarize')}
                            className="sm:hidden p-2 bg-black text-white rounded-lg hover:bg-zinc-800 transition-colors"
                            aria-label="Summarize PDF"
                        >
                            <FileText className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => router.push('/dashboard/compare')}
                            className="hidden md:flex items-center gap-2 px-4 cursor-pointer py-2 bg-zinc-100 text-zinc-900 rounded-lg hover:bg-zinc-200 transition-colors text-sm font-medium"
                        >
                            <Scale className="w-4 h-4" />
                            <span className="hidden lg:inline">Compare IPC vs BNS</span>
                        </button>
                        <button
                            onClick={() => router.push('/dashboard/compare')}
                            className="md:hidden p-2 bg-zinc-100 text-zinc-900 rounded-lg hover:bg-zinc-200 transition-colors cursor-pointer"
                            aria-label="Compare IPC vs BNS"
                        >
                            <Scale className="w-4 h-4" />
                        </button>
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
                            <WelcomeScreen
                                selectedDomain={selectedDomain}
                                onDomainSelect={(domain) => setSelectedDomain(selectedDomain === domain ? null : domain)}
                                onSuggestionClick={handleSuggestionClick}
                            />
                        ) : (
                            <MessageList
                                messages={messages}
                                isLoading={isLoading}
                                messagesEndRef={messagesEndRef}
                            />
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