"use client"

import { Suspense } from 'react';
import Dashboard from './Dashboard';
import { Scale } from 'lucide-react';

function DashboardContent() {
    return <Dashboard />;
}

export default function DashboardWrapper() {
    return (
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center bg-white">
                <div className="text-center">
                    <Scale className="w-12 h-12 text-black mx-auto mb-4 animate-pulse" />
                    <p className="text-zinc-600">Loading...</p>
                </div>
            </div>
        }>
            <DashboardContent />
        </Suspense>
    );
}
