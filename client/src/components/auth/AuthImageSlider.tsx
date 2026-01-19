'use client'
import React, { useState, useEffect } from 'react';
import Image from 'next/image';

const SLIDER_IMAGES = [
    "/asdf.png",
    "/imggg.png",
];

const AuthImageSlider = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % SLIDER_IMAGES.length);
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="h-screen md:w-[50%] bg-[#e0f3ff] relative overflow-hidden flex items-center justify-center p-10">
            <div className="relative w-full h-full max-w-lg max-h-[600px]">
                {SLIDER_IMAGES.map((src, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ease-in-out transform ${index === currentIndex
                                ? 'opacity-100  scale-100'
                                : 'opacity-0  scale-95'
                            }`}
                    >
                        <Image
                            src={src}
                            alt={`Slide ${index + 1}`}
                            width={800}
                            height={800}
                            className="object-contain drop-shadow-2xl"
                            priority={index === 0}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AuthImageSlider;
