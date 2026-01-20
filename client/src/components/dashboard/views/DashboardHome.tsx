import React from 'react';
import { FileText, Search, LayoutTemplate, MessageSquare, ArrowRight, Clock, CheckCircle2 } from 'lucide-react';

interface DashboardHomeProps {
    user: { full_name?: string; username: string } | null;
    stats: { queries: number };
    onChangeView: (view: string) => void;
}

export default function DashboardHome({ user, stats, onChangeView }: DashboardHomeProps) {
    const statCards = [
        { label: 'Documents Generated', value: 0, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Searches Performed', value: 0, icon: Search, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { label: 'Templates Used', value: 0, icon: LayoutTemplate, color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: 'AI Queries', value: stats.queries, icon: MessageSquare, color: 'text-green-600', bg: 'bg-green-50' },
    ];

    const quickActions = [
        {
            label: 'AI Assistant',
            desc: 'Chat with constitutional AI',
            icon: MessageSquare,
            bg: 'bg-blue-600',
            view: 'assistant'
        },
        {
            label: 'Document Lab',
            desc: 'Generate & edit documents',
            icon: FileText,
            bg: 'bg-green-600',
            view: 'documents'
        },
        {
            label: 'Templates',
            desc: 'Save common drafts',
            icon: LayoutTemplate,
            bg: 'bg-purple-600',
            view: 'templates'
        },
        {
            label: 'Official Search',
            desc: 'Search gov.in portals',
            icon: Search,
            bg: 'bg-orange-600',
            view: 'search'
        },
    ];

    return (
        <div className="max-w-7xl mx-auto p-6 lg:p-10 space-y-10">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-zinc-900">
                    Welcome back, {user?.full_name || user?.username || 'Citizen'}
                </h1>
                <p className="text-zinc-500 mt-1 flex items-center gap-2">
                    Role: <span className="font-semibold text-zinc-700">Citizen</span> <span className="text-zinc-300">|</span> Your governance AI assistant is ready
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, i) => (
                    <div key={i} className="bg-white border border-zinc-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                        <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <div className="text-3xl font-bold text-zinc-900 mb-1">{stat.value}</div>
                        <div className="text-sm font-medium text-zinc-500">{stat.label}</div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Quick Actions */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-bold text-zinc-900">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {quickActions.map((action, i) => (
                            <button
                                key={i}
                                onClick={() => onChangeView(action.view)}
                                className="group bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm hover:shadow-md hover:border-zinc-200 text-left transition-all"
                            >
                                <div className={`w-10 h-10 ${action.bg} text-white rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                    <action.icon className="w-5 h-5" />
                                </div>
                                <h3 className="font-bold text-zinc-900 mb-1">{action.label}</h3>
                                <p className="text-sm text-zinc-500 mb-4">{action.desc}</p>
                                <div className="text-xs font-semibold text-blue-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                                    Open <ArrowRight className="w-3 h-3" />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-zinc-900">Recent Activity</h2>
                    <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm min-h-[300px]">
                        <div className="space-y-6 relative">
                            {/* Connector Line */}
                            <div className="absolute left-[11px] top-2 bottom-2 w-px bg-zinc-100"></div>

                            {/* Demo Activity Items */}
                            <div className="relative pl-8">
                                <div className="absolute left-0 top-1 w-6 h-6 bg-green-50 rounded-full flex items-center justify-center border border-green-100">
                                    <CheckCircle2 className="w-3 h-3 text-green-600" />
                                </div>
                                <p className="text-sm font-medium text-zinc-900">Asked: "Government schemes for farmers"</p>
                                <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1"><Clock className="w-3 h-3" /> 28 minutes ago</p>
                            </div>

                            <div className="relative pl-8">
                                <div className="absolute left-0 top-1 w-6 h-6 bg-green-50 rounded-full flex items-center justify-center border border-green-100">
                                    <CheckCircle2 className="w-3 h-3 text-green-600" />
                                </div>
                                <p className="text-sm font-medium text-zinc-900">Asked: "Compare IPC 420 vs BNS Section 318"</p>
                                <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1"><Clock className="w-3 h-3" /> 2 hours ago</p>
                            </div>

                            <div className="relative pl-8 opacity-60">
                                <div className="absolute left-0 top-1 w-6 h-6 bg-zinc-50 rounded-full flex items-center justify-center border border-zinc-200">
                                    <Search className="w-3 h-3 text-zinc-400" />
                                </div>
                                <p className="text-sm font-medium text-zinc-700">Searched for "Digital India Act"</p>
                                <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1"><Clock className="w-3 h-3" /> Yesterday</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
