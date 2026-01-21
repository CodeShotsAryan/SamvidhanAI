"use client"

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { API_ENDPOINTS } from '@/src/lib/config';
import { Search, ArrowLeft, AlertCircle, FileText, Mic, StopCircle } from 'lucide-react';
import Image from 'next/image';

interface ComparisonData {
    comparison_text: string;
    key_changes: string[];
}

export default function ComparePage() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [comparison, setComparison] = useState<ComparisonData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
    const chunksRef = React.useRef<Blob[]>([]);

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
                        setSearchQuery('Sanket is Listening...');
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
                        setSearchQuery(response.data.transcript);
                    } catch (error) {
                        setError('Failed to process speech. Please try typing.');
                        setSearchQuery('');
                    }

                    stream.getTracks().forEach(track => track.stop());
                };

                mediaRecorder.start();
                setIsRecording(true);
            } catch (err) {
                alert("Could not access microphone.");
            }
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            setError('Please enter an IPC section number');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await axios.post(API_ENDPOINTS.compare, {
                ipc_section: searchQuery.trim()
            });

            setComparison(response.data);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to fetch comparison. Please try again.');
            setComparison(null);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="min-h-screen px-2 bg-gradient-to-br from-zinc-50 to-zinc-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 lg:py-14">
                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="flex items-center gap-2 text-zinc-600 hover:text-zinc-900 mb-4 transition-colors text-sm sm:text-base cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </button>
                    <div className="flex items-start gap-3 mb-2">
                        <Image src="/iconn.png" alt="Logo" width={60} height={60} className='border-2 rounded-full border-slate-300' />
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900">IPC vs BNS Comparison</h1>
                            <p className="text-sm sm:text-base text-zinc-600 mt-1">
                                Compare old IPC sections with new BNS to track legislative changes
                            </p>
                        </div>
                    </div>
                </div>

                {/* Search Section */}
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 mb-6">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder={isRecording ? "Listening..." : "Enter IPC or BNS section (e.g., IPC 302 or BNS 103)"}
                                className="w-full pl-10 pr-12 py-3 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm sm:text-base"
                            />
                            <button
                                onClick={handleMicClick}
                                className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors ${isRecording ? 'text-red-500 bg-red-50 hover:bg-red-100 animate-pulse' : 'text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100'}`}
                                title="Voice Input"
                            >
                                {isRecording ? <StopCircle className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                            </button>
                        </div>
                        <button
                            onClick={handleSearch}
                            disabled={isLoading}
                            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-zinc-800 disabled:bg-zinc-300 disabled:cursor-not-allowed transition-colors font-medium text-sm sm:text-base whitespace-nowrap cursor-pointer"
                        >
                            {isLoading ? 'Searching...' : 'Compare'}
                        </button>
                    </div>

                    {error && (
                        <div className="mt-4 flex items-start gap-2 text-red-600 bg-red-50 p-3 sm:p-4 rounded-lg text-sm sm:text-base">
                            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}
                </div>

                {/* Comparison Results */}
                {comparison && (
                    <div className="space-y-4 sm:space-y-6">
                        {/* Comparison Text */}
                        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <h3 className="text-lg sm:text-xl font-bold text-zinc-900">
                                    Comparison Analysis
                                </h3>
                            </div>
                            <div className="bg-zinc-50 rounded-lg p-4 sm:p-5">
                                <p className="text-sm sm:text-base text-zinc-700 leading-relaxed whitespace-pre-wrap">
                                    {comparison.comparison_text}
                                </p>
                            </div>
                        </div>

                        {/* Key Changes */}
                        {comparison.key_changes && comparison.key_changes.length > 0 && (
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-green-200">
                                <div className="flex items-center gap-2 mb-4">
                                    <Image src="/iconn.png" alt="Logo" width={20} height={20} className="rounded-full shadow-sm" />
                                    <h3 className="text-lg sm:text-xl font-bold text-zinc-900">
                                        Key Changes & Differences
                                    </h3>
                                </div>
                                <div className="bg-white rounded-lg p-4 sm:p-5">
                                    <ul className="space-y-3">
                                        {comparison.key_changes.map((change, index) => (
                                            <li key={index} className="flex gap-2 sm:gap-3">
                                                <span className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold mt-0.5">
                                                    {index + 1}
                                                </span>
                                                <p className="text-sm sm:text-base text-zinc-700 leading-relaxed">
                                                    {change}
                                                </p>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}

                        {/* Legend */}
                        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
                            <h4 className="text-sm sm:text-base font-semibold text-zinc-900 mb-3">
                                Understanding the Comparison
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-1 h-12 bg-red-500 rounded-full flex-shrink-0"></div>
                                    <div>
                                        <p className="font-medium text-zinc-900 text-sm sm:text-base">IPC (Old Law)</p>
                                        <p className="text-xs sm:text-sm text-zinc-600">
                                            Indian Penal Code, 1860 - Repealed in 2023
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-1 h-12 bg-green-500 rounded-full flex-shrink-0"></div>
                                    <div>
                                        <p className="font-medium text-zinc-900 text-sm sm:text-base">BNS (New Law)</p>
                                        <p className="text-xs sm:text-sm text-zinc-600">
                                            Bharatiya Nyaya Sanhita, 2023 - Current Law
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!comparison && !isLoading && !error && (
                    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-8 sm:p-12 text-center">
                        <Image src="/iconn.png" alt="Logo" width={80} height={80} className="mx-auto mb-4 opacity-50 rounded-full" />
                        <h3 className="text-lg sm:text-xl font-semibold text-zinc-900 mb-2">
                            Start Comparing Sections
                        </h3>
                        <p className="text-sm sm:text-base text-zinc-600 max-w-md mx-auto">
                            Enter an IPC or BNS section number above to see a detailed comparison of the old and new laws
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
