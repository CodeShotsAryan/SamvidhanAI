'use client';

import React, { useState } from "react";
import Image from "next/image";
import api from "../../lib/api";
import { Loader2, Mail, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Input from "./Input";
import AuthImageSlider from "./AuthImageSlider";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await api.post("/api/auth/forgot-password", { email });
            setSuccess(true);
            setTimeout(() => {
                router.push(`/auth/reset-password?email=${encodeURIComponent(email)}`);
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.detail || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white px-4">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center">
                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-5">
                        <CheckCircle2 className="w-10 h-10 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-3">Check your email</h2>
                    <p className="text-slate-600">We've sent a reset code to {email}. Redirecting to reset page...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex">
            {}
            <div className="w-full md:w-1/2 bg-white px-6 py-10 flex flex-col justify-center">
                <div className="w-full max-w-md mx-auto">
                    <Image src="/loogoo.png" alt="SamvidhanAI" width={180} height={48} className="object-contain mb-2" />
                    <p className="text-slate-500 mb-6 text-sm">Enter your email to receive a password reset code</p>

                    {error && <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 mb-4">{error}</div>}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input label="Email Address" placeholder="name@company.com" type="email" required icon={<Mail size={18} />} value={email} onChange={(e) => setEmail(e.target.value)} />

                        <button disabled={loading} type="submit" className="w-full rounded-xl bg-black py-3 text-sm text-white font-semibold flex items-center justify-center gap-2 hover:bg-zinc-800 transition mt-4">
                            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "Send Reset Code"}
                        </button>
                    </form>

                    <p className="pt-5 text-center text-sm text-slate-500">Remember your password? <Link href="/auth/login" className="font-semibold text-black hover:underline">Sign in</Link></p>
                </div>
            </div>

            {}
            <AuthImageSlider />
        </div>
    );
};

export default ForgotPassword;