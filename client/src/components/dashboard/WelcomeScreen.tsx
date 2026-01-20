import React from 'react';
import { Scale, Gavel, Book, Building2, Globe, Briefcase, FileText } from 'lucide-react';

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

interface WelcomeScreenProps {
    selectedDomain: string | null;
    onDomainSelect: (domain: string | null) => void;
    onSuggestionClick: (suggestion: string) => void;
}

export default function WelcomeScreen({
    selectedDomain,
    onDomainSelect,
    onSuggestionClick,
}: WelcomeScreenProps) {
    const suggestions = [
        'Compare IPC 420 vs BNS Section 318',
        'Summarize recent Supreme Court privacy judgments',
        'What are the new bail provisions under BNSS?',
        'Draft a legal notice for breach of contract',
    ];

    return (
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
                                onClick={() => onDomainSelect(selectedDomain === domain ? null : domain)}
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
                        onClick={() => onSuggestionClick(suggestion)}
                        className="p-4 border border-zinc-200 rounded-xl hover:border-zinc-400 hover:shadow-md hover:bg-zinc-50 transition-opacity duration-200 cursor-pointer group flex items-start gap-3 bg-white"
                    >
                        <Gavel className="w-4 h-4 mt-0.5 text-zinc-400 group-hover:text-zinc-900 transition-opacity duration-200 flex-shrink-0" />
                        <div className="text-sm font-medium text-zinc-700 group-hover:text-zinc-900">{suggestion}</div>
                    </button>
                ))}
            </div>
        </div>
    );
}
