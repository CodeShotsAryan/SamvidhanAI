'use client';

import React, { useState } from "react";
import axios from "axios";
import { Loader2, Lock, Mail, User, Scale } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Input from "./Input";
import AuthImageSlider from "./AuthImageSlider";
import Image from "next/image";
import { API_ENDPOINTS } from "@/src/lib/config";

const Register = () => {
    const [username, setUsername] = useState("");
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await axios.post(API_ENDPOINTS.auth.register, {
                username,
                email,
                password,
                full_name: fullName,
            });

            // Store email in sessionStorage for the verification page
            sessionStorage.setItem('verification-email', email);

            // Redirect to verification page
            router.push("/auth/verify-email");
        } catch (err: any) {
            setError(err.response?.data?.detail || "Registration failed. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-white">
            <div className="w-full md:w-1/2 bg-white px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 py-8 md:py-10 flex flex-col justify-center">
                <div className="w-full max-w-md mx-auto">
                    <div className="flex items-center justify-center gap-2 mb-6">
                        <Image src="/loogoo.png" alt="Logo" width={150} height={150} className="w-48 sm:w-56 h-auto object-contain" />
                    </div>

                    <p className="text-zinc-600 mb-8 text-sm">
                        Create your account to get started
                    </p>

                    {error && (
                        <div className="w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 mb-5">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="Username"
                            placeholder="johndoe"
                            type="text"
                            required
                            icon={<User size={18} />}
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />

                        <Input
                            label="Full Name"
                            placeholder="John Doe"
                            type="text"
                            required
                            icon={<User size={18} />}
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                        />

                        <Input
                            label="Email Address"
                            placeholder="name@company.com"
                            type="email"
                            required
                            icon={<Mail size={18} />}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        <Input
                            label="Password"
                            placeholder="••••••••"
                            type="password"
                            required
                            icon={<Lock size={18} />}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />

                        <button
                            disabled={loading}
                            type="submit"
                            className="w-full rounded-xl bg-black py-3 text-sm text-white font-semibold flex items-center justify-center gap-2 hover:bg-zinc-800 transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin w-4 h-4" />
                                    <span>Setting up your account...</span>
                                </>
                            ) : (
                                <span>Register</span>
                            )}
                        </button>
                    </form>

                    <p className="pt-6 text-center text-sm text-zinc-600">
                        Already have an account?{" "}
                        <Link
                            href="/auth/login"
                            className="font-semibold text-black hover:text-zinc-700 transition-opacity duration-200"
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>

            
                <AuthImageSlider />
          
        </div>
    );
};

export default Register;