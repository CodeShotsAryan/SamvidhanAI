"use client"

import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowUp, Square, Mic, StopCircle, Paperclip, LayoutTemplate, User } from 'lucide-react';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import TopNav from './TopNav';
import DashboardHome from './views/DashboardHome';
import DocumentLab from './views/DocumentLab';
import OfficialSearch from './views/OfficialSearch';
import MessageList from './MessageList';
import GraphDrawer from './GraphDrawer';
import LegalGraph from './LegalGraph';
import { useRouter } from 'next/navigation';
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

// --- Interfaces --
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

// --- Helper Components for Prompt Input ---
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
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
    const chunksRef = React.useRef<Blob[]>([]);

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

    const handleMicClick = async () => {
        if (isRecording) {
            mediaRecorderRef.current?.stop();
            setIsRecording(false);
        } else {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const mediaRecorder = new MediaRecorder(stream);
                mediaRecorderRef.current = mediaRecorder;
                chunksRef.current = [];

                mediaRecorder.ondataavailable = (e) => {
                    if (e.data.size > 0) {
                        chunksRef.current.push(e.data);
                    }
                };

                mediaRecorder.onstop = async () => {
                    const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                    const formData = new FormData();
                    formData.append('file', blob, 'recording.webm');

                    try {
                        const token = localStorage.getItem('token');
                        controller.textInput.setInput('Sanket is Listening...');
                        const response = await axios.post(
                            API_ENDPOINTS.speech.stt,
                            formData,
                            {
                                headers: {
                                    'Content-Type': 'multipart/form-data',
                                    'Authorization': `Bearer ${token}`
                                }
                            }
                        );
                        controller.textInput.setInput(response.data.transcript);
                    } catch (error) {
                        console.error('STT Error:', error);
                        controller.textInput.setInput('Error in speech recognition.');
                    }

                    stream.getTracks().forEach(track => track.stop());
                };

                mediaRecorder.start();
                setIsRecording(true);
            } catch (err) {
                console.error("Error accessing mic:", err);
                alert("Could not access microphone.");
            }
        }
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
                    placeholder={isGenerating ? "Generating..." : (isRecording ? "Listening..." : "Ask a legal question... (e.g. 'Compare IPC 420 vs BNS 318')")}
                    className="bg-transparent text-black placeholder:text-zinc-400 resize-none min-h-[44px] max-h-[200px] text-sm lg:text-base disabled:opacity-50 py-2.5"
                />
            </PromptInputBody>
            <PromptInputFooter className="bg-white border-t border-zinc-100">
                <PromptInputTools>
                    <AttachButton />
                    <button
                        onClick={handleMicClick}
                        className={`text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-all duration-200 p-2 rounded-md ${isRecording ? 'text-red-500 bg-red-50 hover:bg-red-100 animate-pulse' : ''}`}
                        title="Voice Input"
                    >
                        {isRecording ? <StopCircle className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>
                </PromptInputTools>
                {isGenerating ? (
                    <button onClick={stopGeneration} className="bg-zinc-100 text-black hover:bg-zinc-200 rounded-lg px-3 py-2 transition-opacity duration-200">
                        <Square className="w-4 h-4" fill="currentColor" />
                    </button>
                ) : (
                    <PromptInputSubmit
                        onClick={handleSubmit}
                        disabled={!controller.textInput.value.trim() && !isRecording}
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

// --- Main Dashboard Component ---
export default function Dashboard() {
    const router = useRouter();
    const [currentView, setCurrentView] = useState('home'); // home, assistant, documents, templates, search

    // Auth & User State
    const [user, setUser] = useState<UserData | null>(null);
    const [authLoading, setAuthLoading] = useState(true);

    // Chat State
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [messages, setMessages] = useState<SDKMessage[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const messagesEndRef = React.useRef<HTMLDivElement>(null);

    // Audio State
    const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
    const audioRef = React.useRef<HTMLAudioElement | null>(null);

    // Graph State
    const [graphOpen, setGraphOpen] = useState(false);
    const [graphContent, setGraphContent] = useState('');

    // --- Effects ---
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/auth/login');
                return;
            }
            try {
                const response = await axios.get(API_ENDPOINTS.auth.me, {
                    headers: { Authorization: `Bearer ${token}` },
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

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        setIsGenerating(isLoading);
    }, [isLoading]);

    // --- API Handlers ---
    const fetchConversations = async (token?: string) => {
        const authToken = token || localStorage.getItem('token');
        if (!authToken) return;
        try {
            const response = await axios.get(API_ENDPOINTS.conversations.list, {
                headers: { Authorization: `Bearer ${authToken}` },
            });
            setConversations(response.data);
        } catch (error) {
            console.error('Error fetching conversations:', error);
        }
    };

    const createConversation = async (title: string) => {
        const token = localStorage.getItem('token');
        if (!token) return null;
        try {
            const response = await axios.post(
                API_ENDPOINTS.conversations.create,
                { title: title.slice(0, 50), domain_filter: null },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setConversations(prev => [response.data, ...prev]);
            return response.data.id;
        } catch (error) {
            console.error('Error creating conversation:', error);
            return null;
        }
    };

    const saveMessage = async (conversationId: number, role: string, content: string) => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            await axios.post(
                API_ENDPOINTS.conversations.saveMessage(conversationId),
                { role, content, sources: [] },
                { headers: { Authorization: `Bearer ${token}` } }
            );
        } catch (error) {
            console.error('Error saving message:', error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        router.push('/auth/login');
    };

    // --- Chat Logic ---
    const handleSubmit = async (message: { text: string; files?: any[] }) => {
        if (!message.text.trim()) return;

        let convId = selectedConversation;
        if (convId === null) {
            convId = await createConversation(message.text);
            if (!convId) return;
            setSelectedConversation(convId);
        }

        const userMsg: SDKMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: message.text,
        };

        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setIsLoading(true);
        await saveMessage(convId, 'user', message.text);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                API_ENDPOINTS.chat,
                { message: message.text, conversation_id: convId, domain: null },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const aiMsg: SDKMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response.data.response,
                citations: response.data.citations
            };
            setMessages([...newMessages, aiMsg]);
            await saveMessage(convId!, 'assistant', aiMsg.content);
            fetchConversations();
        } catch (error) {
            console.error('AI Error:', error);
            const errorMsg: SDKMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.',
            };
            setMessages([...newMessages, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    // --- Audio & Graph Logic ---
    const playAudio = async (text: string, messageId: string) => {
        if (playingMessageId === messageId) {
            audioRef.current?.pause();
            audioRef.current = null;
            setPlayingMessageId(null);
            return;
        }
        audioRef.current?.pause();

        try {
            setPlayingMessageId(messageId);
            const token = localStorage.getItem('token');
            let textToRead = text;
            try {
                const parsed = JSON.parse(text);
                if (parsed.simple_answer) textToRead = parsed.simple_answer;
                else if (parsed.simpleanswer) textToRead = parsed.simpleanswer;
                else if (parsed.law) textToRead = parsed.law;
            } catch (e) { }

            const finalPayload = textToRead.replace(/[*#_`]/g, '').replace(/\[\d+\]/g, '').substring(0, 490);

            const response = await axios.post(
                API_ENDPOINTS.speech.tts,
                { text: finalPayload },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const audio = new Audio(`data:audio/wav;base64,${response.data.audio}`);
            audioRef.current = audio;
            audio.onended = () => {
                setPlayingMessageId(null);
                audioRef.current = null;
            };
            audio.play();
        } catch (error) {
            console.error('TTS Error', error);
            setPlayingMessageId(null);
            audioRef.current = null;
        }
    };

    const handleViewGraph = (content: string) => {
        setGraphContent(content);
        setGraphOpen(true);
    };

    if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-zinc-50">Loading SamvidhanAI...</div>;

    return (
        <div className="flex flex-col h-screen bg-zinc-50 font-sans">
            {/* Top Navigation */}
            <TopNav currentView={currentView} setCurrentView={setCurrentView} onLogout={handleLogout} />

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto">
                {currentView === 'home' && (
                    <DashboardHome
                        user={user}
                        stats={{ queries: conversations.length }}
                        onChangeView={setCurrentView}
                    />
                )}

                {currentView === 'documents' && <DocumentLab />}

                {currentView === 'search' && <OfficialSearch />}

                {currentView === 'assistant' && (
                    <div className="max-w-4xl mx-auto h-full flex flex-col pt-6 pb-4 px-4 bg-zinc-50">
                        {/* Messages Area */}

                        {messages.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-zinc-200 flex items-center justify-center mb-6">
                                    <span className="text-3xl">🤖</span>
                                </div>
                                <h2 className="text-2xl font-bold text-zinc-900 mb-2">Constitutional AI Assistant</h2>
                                <p className="text-zinc-500 max-w-md">Ask about BNS vs IPC, analyze legal documents, or Draft legal notices.</p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-8 max-w-2xl w-full">
                                    {[
                                        "Compare IPC 420 vs BNS 318",
                                        "Draft a rental agreement notice",
                                        "Explain Bail provisions in BNSS",
                                        "Summarize Rights of Arrested Persons"
                                    ].map(s => (
                                        <button
                                            key={s}
                                            onClick={() => handleSubmit({ text: s })}
                                            className="p-4 bg-white border border-zinc-200 rounded-xl hover:border-blue-300 hover:shadow-sm text-sm font-medium text-zinc-700 text-left transition-all"
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 overflow-y-auto pr-2">
                                <MessageList
                                    messages={messages}
                                    isLoading={isLoading}
                                    messagesEndRef={messagesEndRef}
                                    onPlayAudio={playAudio}
                                    playingMessageId={playingMessageId}
                                    onViewGraph={handleViewGraph}
                                />
                            </div>
                        )}

                        {/* Input Area */}
                        <div className="mt-4">
                            <PromptInputProvider>
                                <PromptInputWrapper
                                    isGenerating={isGenerating}
                                    onSubmit={handleSubmit}
                                    stopGeneration={() => setIsGenerating(false)}
                                />
                            </PromptInputProvider>
                        </div>
                    </div>
                )}

                {currentView === 'templates' && (
                    <div className="min-h-full flex items-center justify-center p-8">
                        <div className="text-center text-zinc-400">
                            <LayoutTemplate className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <h3 className="text-lg font-medium text-zinc-900">Templates Library</h3>
                            <p className="max-w-sm mx-auto mt-2">Access 50+ pre-approved legal templates. Coming soon.</p>
                        </div>
                    </div>
                )}

                {currentView === 'citizen' && (
                    <div className="min-h-full flex items-center justify-center p-8">
                        <div className="text-center text-zinc-400">
                            <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <h3 className="text-lg font-medium text-zinc-900">Citizen Mode</h3>
                            <p className="max-w-sm mx-auto mt-2">Simplified legal interface for general public. Coming soon.</p>
                        </div>
                    </div>
                )}
            </main>

            {/* Graph Drawer & Modals */}
            <GraphDrawer isOpen={graphOpen} onClose={() => setGraphOpen(false)}>
                {graphContent && <LegalGraph messageContent={graphContent} />}
            </GraphDrawer>
        </div>
    );
}