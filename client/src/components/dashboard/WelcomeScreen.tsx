import React from 'react';
import { Gavel, Book, Building2, Globe, Briefcase, FileText, LayoutGrid } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';

const LEGAL_DOMAINS = [
    'Criminal Law',
    'Corporate & Commercial Law',
    'Cyber & IT Law',
];

const DOMAIN_ICONS: Record<string, any> = {
    'Criminal Law': Gavel,
    'Constitutional Law': Book,
    'Civil Law': () => <Image src="/iconn.png" alt="Logo" width={12} height={12} className="rounded-full" />,
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

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.4
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { duration: 0.3 }
        }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="mt-8 text-center"
        >
            <motion.div
                variants={itemVariants}
                animate={{ rotate: 360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="inline-flex items-center justify-center bg-zinc-50 w-16 h-16 text-zinc-900 rounded-full mb-6 border border-zinc-200 shadow-sm"
            >
                <Image src="/iconn.png" alt="Logo" width={64} height={64} className='rounded-full' />
            </motion.div>

            <motion.div variants={itemVariants} className="mb-10">
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mb-4">
                    Research Domains
                </div>
                <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
                    {LEGAL_DOMAINS.map((domain) => {
                        const Icon = DOMAIN_ICONS[domain];
                        return (
                            <motion.button
                                variants={itemVariants}
                                key={domain}
                                onClick={() => onDomainSelect(selectedDomain === domain ? null : domain)}
                                className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-full transition-all duration-200 cursor-pointer ${selectedDomain === domain
                                    ? 'bg-black text-white'
                                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 shadow-sm'
                                    }`}
                            >
                                {typeof Icon === 'function' ? Icon() : <Icon className="w-3.5 h-3.5" />}
                                {domain}
                            </motion.button>
                        );
                    })}
                </div>
            </motion.div>

            <motion.div variants={itemVariants} className="mb-10 lg:hidden">
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mb-4 text-center">
                    Quick Tools
                </div>
                <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
                    <button
                        className="flex flex-col items-center gap-2 p-4 bg-zinc-50 border border-zinc-200 rounded-2xl hover:bg-zinc-100 transition-all"
                        onClick={() => window.location.href = '/dashboard/summarize'}
                    >
                        <FileText className="w-6 h-6 text-blue-500" />
                        <span className="text-xs font-bold text-zinc-700">Summarize</span>
                    </button>
                    <button
                        className="flex flex-col items-center gap-2 p-4 bg-zinc-50 border border-zinc-200 rounded-2xl hover:bg-zinc-100 transition-all"
                        onClick={() => window.location.href = '/dashboard/compare'}
                    >
                        <LayoutGrid className="w-6 h-6 text-green-500" />
                        <span className="text-xs font-bold text-zinc-700">Compare</span>
                    </button>
                </div>
            </motion.div>

            <motion.div
                variants={containerVariants}
                className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-3xl mx-auto text-left"
            >
                <div className="col-span-1 md:col-span-2 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mb-2 mt-4 text-center md:text-left">
                    Sample Queries
                </div>
                {suggestions.map((suggestion, idx) => (
                    <motion.button
                        variants={itemVariants}
                        key={idx}
                        onClick={() => onSuggestionClick(suggestion)}
                        className="p-4 border border-zinc-200 rounded-2xl hover:border-zinc-400 hover:shadow-md hover:bg-zinc-50 transition-all duration-200 cursor-pointer group flex items-start gap-4 bg-white"
                    >
                        <div className="p-2 bg-zinc-50 rounded-lg group-hover:bg-zinc-100 transition-colors">
                            <Gavel className="w-4 h-4 text-zinc-400 group-hover:text-zinc-900 transition-all duration-200 shrink-0" />
                        </div>
                        <div className="text-sm font-medium text-zinc-700 group-hover:text-zinc-900 pt-1.5">{suggestion}</div>
                    </motion.button>
                ))}
            </motion.div>
        </motion.div>
    );
}
