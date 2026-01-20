import React, { useState } from 'react';
import { FilePlus, Edit3, Split, FileText, Loader2, Info } from 'lucide-react';

export default function DocumentLab() {
    const [activeTab, setActiveTab] = useState<'generate' | 'redraft' | 'compare'>('generate');
    const [docType, setDocType] = useState('Office Memorandum');
    const [details, setDetails] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = () => {
        setIsGenerating(true);
        setTimeout(() => setIsGenerating(false), 2000); // Simulate
    };

    return (
        <div className="max-w-5xl mx-auto p-6 lg:p-10 space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-zinc-900">Document Lab</h1>
                <p className="text-zinc-500 mt-2">Generate, redraft, and compare official documents with AI precision.</p>
            </div>

            <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
                {/* Tabs */}
                <div className="flex border-b border-zinc-200 bg-zinc-50/50">
                    <button
                        onClick={() => setActiveTab('generate')}
                        className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'generate' ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100'}`}
                    >
                        <FilePlus className="w-4 h-4" /> Generate
                    </button>
                    <button
                        onClick={() => setActiveTab('redraft')}
                        className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'redraft' ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100'}`}
                    >
                        <Edit3 className="w-4 h-4" /> Redraft
                    </button>
                    <button
                        onClick={() => setActiveTab('compare')}
                        className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'compare' ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100'}`}
                    >
                        <Split className="w-4 h-4" /> Compare
                    </button>
                </div>

                <div className="p-8 space-y-6">
                    {/* Content */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-zinc-700 mb-2">Document Type</label>
                            <select
                                value={docType}
                                onChange={(e) => setDocType(e.target.value)}
                                className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                            >
                                <option>Office Memorandum</option>
                                <option>Legal Notice</option>
                                <option>Affidavit</option>
                                <option>RTI Application</option>
                                <option>Circular</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-zinc-700 mb-2">Document Details</label>
                            <textarea
                                value={details}
                                onChange={(e) => setDetails(e.target.value)}
                                placeholder="Provide key details for the document (subject, recipient, purpose, key points...)"
                                className="w-full p-4 h-48 bg-zinc-50 border border-zinc-200 rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating || !details}
                        className="w-full bg-zinc-900 text-white font-medium py-3 rounded-lg hover:bg-zinc-800 disabled:bg-zinc-200 disabled:text-zinc-400 transition-colors flex items-center justify-center gap-2"
                    >
                        {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                        {isGenerating ? 'Generating...' : 'Generate Document'}
                    </button>
                </div>

                <div className="px-8 pb-8">
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3">
                        <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-blue-800">
                            <strong>Important Notice:</strong> All generated documents are advisory drafts. Please review and verify with official guidelines or legal experts before use.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
