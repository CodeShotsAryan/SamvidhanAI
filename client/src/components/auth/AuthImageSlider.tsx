'use client'
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

const SLIDER_CONTENT = [
    {
        image: "/assets/legal_hero.png",
        title: "Supreme Intelligence",
        desc: "Advanced RAG framework indexing the entire Indian Constitution."
    },
    {
        image: "/assets/justice_scales.png",
        title: "Digital Fairness",
        desc: "Synthesizing case precedents with clinical precision."
    }
];

const AuthImageSlider = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % SLIDER_CONTENT.length);
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="hidden md:block md:w-1/2 h-screen bg-[#020617] relative overflow-hidden border-l border-white/10">
            {/* Background Image with Blur/Zoom */}
            <AnimatePresence mode='wait'>
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 0.4, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="absolute inset-0 z-0"
                >
                    <Image
                        src={SLIDER_CONTENT[currentIndex].image}
                        alt="Auth Background"
                        fill
                        className="object-cover"
                    />
                </motion.div>
            </AnimatePresence>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-[#020617]/40 z-10" />

            {/* Content Text */}
            <div className="absolute bottom-20 left-12 right-12 z-20">
                <AnimatePresence mode='wait'>
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="text-4xl font-serif font-bold text-white mb-4 leading-tight tracking-tight">
                            {SLIDER_CONTENT[currentIndex].title}
                        </h2>
                        <p className="text-gray-400 text-lg font-light leading-relaxed max-w-md">
                            {SLIDER_CONTENT[currentIndex].desc}
                        </p>
                    </motion.div>
                </AnimatePresence>

                {/* Indicators */}
                <div className="flex gap-2 mt-8">
                    {SLIDER_CONTENT.map((_, i) => (
                        <div
                            key={i}
                            className={`h-1 rounded-full transition-all duration-500 ${i === currentIndex ? 'w-8 bg-amber-500' : 'w-2 bg-white/20'
                                }`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AuthImageSlider;
