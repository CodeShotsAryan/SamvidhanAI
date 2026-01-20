import React from 'react';
import { Scale, LogOut, LayoutDashboard, MessageSquare, FileText, Component, Search, User, Moon, Settings } from 'lucide-react';

interface TopNavProps {
    currentView: string;
    setCurrentView: (view: string) => void;
    onLogout: () => void;
}

export default function TopNav({ currentView, setCurrentView, onLogout }: TopNavProps) {
    const navItems = [
        { id: 'home', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'assistant', label: 'AI Assistant', icon: MessageSquare },
        { id: 'documents', label: 'Document Lab', icon: FileText },
        { id: 'templates', label: 'Templates', icon: Component },
        { id: 'search', label: 'Search', icon: Search },
        { id: 'citizen', label: 'Citizen Mode', icon: User },
    ];

    return (
        <nav className="sticky top-0 z-50 bg-white border-b border-zinc-200 px-4 lg:px-6 h-16 flex items-center justify-between shadow-sm">
            {/* Logo */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 via-white to-orange-500 rounded-xl shadow-inner flex items-center justify-center border border-zinc-200">
                    <span className="text-xl font-bold text-blue-900">स</span>
                </div>
                <div>
                    <h1 className="text-lg font-bold text-zinc-900 leading-tight">SamvidhanAI</h1>
                    <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest">Constitutional AI Platform</p>
                </div>
            </div>

            {/* Navigation Links */}
            <div className="hidden lg:flex items-center gap-1">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentView === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setCurrentView(item.id)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                    ? 'bg-indigo-50 text-indigo-700'
                                    : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'
                                }`}
                        >
                            <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                            {item.label}
                        </button>
                    );
                })}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
                <button className="p-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors">
                    <Moon className="w-5 h-5" />
                </button>
                <button className="p-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors">
                    <Settings className="w-5 h-5" />
                </button>
                <div className="h-6 w-px bg-zinc-200 mx-1"></div>
                <button
                    onClick={onLogout}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                    <LogOut className="w-4 h-4" />
                    Logout
                </button>
            </div>
        </nav>
    );
}
