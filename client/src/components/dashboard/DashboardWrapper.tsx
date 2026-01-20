"use client"

import { Suspense } from 'react';
import Dashboard from './Dashboard';
import Image from 'next/image';
import { motion } from 'framer-motion';

function DashboardContent() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <Dashboard />
        </motion.div>
    );
}

export default function DashboardWrapper() {
    return (
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center bg-white">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center"
                >
                    <Image src="/iconn.png" alt="Logo" width={48} height={48} className="mx-auto mb-4 animate-pulse rounded-full border border-zinc-200" />
                    <p className="text-zinc-600 font-medium">Loading SamvidhanAI...</p>
                </motion.div>
            </div>
        }>
            <DashboardContent />
        </Suspense>
    );
}
