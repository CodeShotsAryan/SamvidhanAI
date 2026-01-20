import React, { useState } from 'react';
import { Search, Globe, Filter, ExternalLink, ShieldCheck, Loader2 } from 'lucide-react';

export default function OfficialSearch() {
    const [query, setQuery] = useState('');
    const [ministry, setMinistry] = useState('');
    const [year, setYear] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = () => {
        if (!query) return;
        setIsSearching(true);
        setTimeout(() => {
            setIsSearching(false);
            setHasSearched(true);
        }, 1500);
    };

    return (
        <div className="max-w-5xl mx-auto p-6 lg:p-10 space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-zinc-900">Official Government Search</h1>
                <p className="text-zinc-500 mt-2 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-green-600" />
                    Search only verified government sources (.gov.in, nic.in, ministry portals)
                </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm space-y-6">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search government policies, schemes, circulars, orders..."
                        className="w-full pl-12 pr-4 py-4 bg-zinc-50 border border-zinc-200 rounded-xl text-base focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Ministry/Department</label>
                        <select
                            value={ministry}
                            onChange={(e) => setMinistry(e.target.value)}
                            className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                        >
                            <option value="">All Ministries</option>
                            <option>Ministry of Electronics & IT</option>
                            <option>Ministry of Home Affairs</option>
                            <option>Ministry of Finance</option>
                            <option>Department of Legal Affairs</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Year</label>
                        <input
                            type="text"
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            placeholder="e.g., 2024"
                            className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="flex gap-3 pt-2">
                    <button
                        onClick={handleSearch}
                        className="flex-1 bg-zinc-900 text-white font-medium py-3 rounded-lg hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2"
                    >
                        {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                        Search Sources
                    </button>
                    <button
                        onClick={() => { setQuery(''); setMinistry(''); setYear(''); setHasSearched(false); }}
                        className="px-6 py-3 bg-zinc-100 text-zinc-600 font-medium rounded-lg hover:bg-zinc-200 transition-colors"
                    >
                        Clear
                    </button>
                </div>
            </div>

            {hasSearched ? (
                <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-8 text-center">
                    <p className="text-zinc-500">Demo Mode: Official search API integration pending.</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-zinc-200 border-dashed shadow-sm min-h-[300px] flex flex-col items-center justify-center p-8 text-center">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                        <Globe className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-zinc-900">Search Official Government Sources</h3>
                    <p className="text-zinc-500 max-w-md mt-2 mb-8">Enter your query above to search verified government portals like india.gov.in, egazette.nic.in, and ministry websites.</p>

                    <div className="flex flex-wrap gap-2 justify-center">
                        {['RTI Guidelines', 'PM-KISAN Scheme', 'GFR Rules 2017', 'Digital India Act'].map(tag => (
                            <span key={tag} className="px-3 py-1.5 bg-zinc-100 text-zinc-600 text-xs font-medium rounded-md cursor-pointer hover:bg-zinc-200">{tag}</span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
