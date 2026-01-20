import { Scale, Book, MessageSquare, FileText, ExternalLink, Volume2, Square, Network } from 'lucide-react';
import { renderMarkdown } from '@/src/lib/markdown';
import { Message, MessageContent } from '../ai-elements/message';
import { Shimmer } from '../ai-elements/shimmer';

interface SDKMessage {
    id: string;
    role: 'user' | 'assistant' | 'system' | 'data';
    content: string;
    files?: { name: string; type: string; size: number }[];
    citations?: { id: number; title: string; source: string; section?: string; url: string }[];
}

interface MessageListProps {
    messages: SDKMessage[];
    isLoading: boolean;
    messagesEndRef: React.RefObject<HTMLDivElement | null>;
    onPlayAudio: (text: string, id: string) => void;
    playingMessageId: string | null;
    onViewGraph: (content: string) => void;
}

export default function MessageList({ messages, isLoading, messagesEndRef, onPlayAudio, playingMessageId, onViewGraph }: MessageListProps) {
    return (
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
                                    <div
                                        className="whitespace-pre-wrap leading-relaxed"
                                        dangerouslySetInnerHTML={{
                                            __html: renderMarkdown((() => {
                                                try {
                                                    const parsed = JSON.parse(m.content);
                                                    if (parsed.casual) {
                                                        return parsed.casual;
                                                    }
                                                    return m.content;
                                                } catch (e) {
                                                    return m.content;
                                                }
                                            })())
                                        }}
                                    />
                                )}

                                {m.role !== 'user' && (
                                    <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-3">
                                        <button
                                            onClick={() => onViewGraph(m.content)}
                                            className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
                                        >
                                            <Network className="w-4 h-4" />
                                            View Reasoning Graph
                                        </button>

                                        <button
                                            onClick={() => onPlayAudio(m.content, m.id)}
                                            className={`p-2 rounded-full hover:bg-zinc-100 transition-colors ${playingMessageId === m.id ? 'text-red-500 bg-red-50' : 'text-zinc-400'}`}
                                            title={playingMessageId === m.id ? "Stop" : "Listen to this"}
                                        >
                                            {playingMessageId === m.id ? <Square className="w-5 h-5 fill-current" /> : <Volume2 className="w-5 h-5" />}
                                        </button>
                                    </div>
                                )}

                                {m.citations && m.citations.length > 0 && (
                                    <div className="mt-6 border-t border-zinc-100 pt-5">
                                        <div className="text-xs font-semibold text-zinc-500 mb-3 uppercase tracking-wider flex items-center gap-2">
                                            <FileText className="w-3 h-3" /> Verifiable Sources & Footnotes
                                        </div>
                                        <div className="grid grid-cols-1 gap-2">
                                            {m.citations.map((citation: any) => (
                                                <a
                                                    id={`citation-${citation.id}`}
                                                    key={citation.id}
                                                    href={citation.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="group flex items-start gap-3 p-3 bg-zinc-50 border border-zinc-100 rounded-xl hover:bg-zinc-100 hover:border-zinc-300 transition-all duration-200 scroll-mt-20"
                                                >
                                                    <div className="flex-shrink-0 w-5 h-5 bg-white border border-zinc-200 rounded flex items-center justify-center text-[10px] font-bold text-zinc-900 group-hover:border-zinc-400">
                                                        {citation.id}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-xs font-semibold text-zinc-900 truncate group-hover:text-black">
                                                            {citation.title}
                                                        </div>
                                                        <div className="text-[10px] text-zinc-500 mt-0.5 flex items-center gap-1">
                                                            {citation.source} {citation.section && `• ${citation.section}`}
                                                        </div>
                                                    </div>
                                                    <ExternalLink className="w-3 h-3 text-zinc-400 group-hover:text-zinc-600 transition-colors mt-0.5" />
                                                </a>
                                            ))}
                                        </div>
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
    );
}
