import React from 'react';
import { X, Plus, MessageCircleCode, LogOut, FileText, LayoutGrid } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface Conversation {
    id: number;
    title: string;
    date: string;
}

interface UserData {
    id: number;
    username: string;
    email: string;
    full_name?: string;
}

interface SidebarProps {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
    conversations: Conversation[];
    selectedConversation: number | null;
    user: UserData | null;
    onNewQuery: () => void;
    onConversationClick: (id: number) => void;
    onDeleteConversation: (id: number, e: React.MouseEvent) => void;
    onLogout: () => void;
    onSummarize?: () => void;
    onCompare?: () => void;
}

export default function Sidebar({
    sidebarOpen,
    setSidebarOpen,
    conversations,
    selectedConversation,
    user,
    onNewQuery,
    onConversationClick,
    onDeleteConversation,
    onLogout,
    onSummarize,
    onCompare,
}: SidebarProps) {
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

    const listVariants = {
        visible: {
            transition: {
                duration: 0.3
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { duration: 0.2 }
        }
    };

    return (
        <aside
            className={`${sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-0 lg:w-0'
                } fixed lg:relative z-30 h-full bg-neutral-800 text-white transition-all duration-300 ease-in-out flex flex-col overflow-hidden`}
        >
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between min-w-[16rem]">
                <div className="flex items-center gap-2 mt-5">
                    <Image src="/iconn.png" alt="Logo" width={26} height={26} />
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

            <div className="px-3 min-w-[16rem]">
                <button
                    onClick={onNewQuery}
                    className="w-full flex items-center justify-center gap-2 bg-white text-black py-2 my-4 px-4 rounded-lg hover:bg-zinc-100 transition-opacity duration-200 cursor-pointer font-bold text-xs"
                >
                    <Plus className="w-4 h-4" />
                    New Query
                </button>
            </div>

            <div className="px-3 min-w-[16rem] mt-2 mb-4">
                <div className="text-[10px] text-zinc-500 px-3 mb-2 font-bold uppercase tracking-[0.2em]">
                    Core Features
                </div>
                <div className="space-y-1">
                    <button
                        onClick={onSummarize}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-300 hover:bg-zinc-900 hover:text-white transition-all duration-200 cursor-pointer text-sm"
                    >
                        <FileText className="w-4 h-4 text-blue-400" />
                        <span className="font-medium">Summarize PDF</span>
                    </button>
                    <button
                        onClick={onCompare}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-300 hover:bg-zinc-900 hover:text-white transition-all duration-200 cursor-pointer text-sm"
                    >
                        <LayoutGrid className="w-4 h-4 text-green-400" />
                        <span className="font-medium">Compare IPC vs BNS</span>
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-2 min-w-[16rem] scrollbar-hidden border-t border-zinc-800/50 pt-4">
                <div className="text-[10px] text-zinc-500 px-3 mb-3 mt-2 font-bold uppercase tracking-[0.2em]">
                    Research History
                </div>
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={listVariants}
                >
                    {conversations.map((conv) => (
                        <motion.div
                            variants={itemVariants}
                            key={conv.id}
                            className={`w-full group relative flex items-center p-3 rounded-lg mb-2 transition-all duration-200 cursor-pointer ${selectedConversation === conv.id
                                ? 'bg-zinc-800 text-white shadow-sm'
                                : 'text-zinc-300 hover:bg-zinc-900/50 hover:text-white'
                                }`}
                            onClick={() => onConversationClick(conv.id)}
                        >
                            <div className="flex items-start gap-2 flex-1 min-w-0">
                                <MessageCircleCode className="w-4 h-4 mt-0.5 shrink-0 opacity-70" />
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium truncate">{conv.title}</div>
                                    <div className="text-xs opacity-60 mt-0.5">{conv.date}</div>
                                </div>
                            </div>
                            <button
                                onClick={(e) => onDeleteConversation(conv.id, e)}
                                className="relative z-10 p-1.5 hover:bg-red-700/80 rounded-md transition-all duration-200 text-zinc-400 hover:text-red-100 shrink-0 cursor-pointer md:opacity-0 group-hover:opacity-100"
                                aria-label="Delete conversation"
                                type="button"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </motion.div>
                    ))}
                </motion.div>
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
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-white transition-opacity duration-200 cursor-pointer text-sm"
                >
                    <LogOut className="w-4 h-4" />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </aside>
    );
}