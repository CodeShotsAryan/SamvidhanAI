'use client';

import React, { useState } from "react";
import api from "../../lib/api";
import { Loader2, Lock, Mail, User, CheckCircle2, KeyRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Input from "./Input";
import AuthImageSlider from "./AuthImageSlider";

const Register = () => {
    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [otpCode, setOtpCode] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [step, setStep] = useState(1); // 1: Register, 2: OTP
    const [success, setSuccess] = useState(false);

    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await api.post("/auth/register", {
                username,
                email,
                password,
                full_name: name,
            });
            setStep(2);
        } catch (err: any) {
            setError(err.response?.data?.detail || "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await api.post("/auth/verify-otp", {
                email,
                otp_code: otpCode,
            });
            setSuccess(true);
            setTimeout(() => {
                router.push("/auth/login");
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.detail || "Verification failed. Check your code.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white px-4">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                        <CheckCircle2 className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-3">Verified!</h2>
                    <p className="text-slate-600">Account created successfully. Redirecting to login...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex">
            <div className="w-full md:w-1/2 bg-white px-6 py-10 flex flex-col justify-center">
                <div className="w-full max-w-md mx-auto">
                    <h1 className="text-4xl font-bold text-slate-900 mb-2">SamvidhanAI</h1>
                    {step === 1 ? (
                        <>
                            <p className="text-slate-500 mb-6 text-sm">Create your account to get started</p>
                            {error && <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 mb-4">{error}</div>}
                            <form onSubmit={handleRegister} className="space-y-4">
                                <Input label="Full Name" placeholder="John Doe" type="text" required icon={<User size={18} />} value={name} onChange={(e) => setName(e.target.value)} />
                                <Input label="Username" placeholder="johndoe123" type="text" required icon={<User size={18} />} value={username} onChange={(e) => setUsername(e.target.value)} />
                                <Input label="Email Address" placeholder="name@company.com" type="email" required icon={<Mail size={18} />} value={email} onChange={(e) => setEmail(e.target.value)} />
                                <Input label="Password" placeholder="••••••••" type="password" required icon={<Lock size={18} />} value={password} onChange={(e) => setPassword(e.target.value)} />
                                <button disabled={loading} type="submit" className="w-full rounded-xl bg-black py-3 text-sm text-white font-semibold flex items-center justify-center gap-2 hover:bg-zinc-800 transition">
                                    {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "Get Started"}
                                </button>
                            </form>
                        </>
                    ) : (
                        <>
                            <p className="text-slate-500 mb-6 text-sm">Enter the code sent to {email}</p>
                            {error && <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 mb-4">{error}</div>}
                            <form onSubmit={handleVerify} className="space-y-4">
                                <Input label="Verification Code" placeholder="123456" type="text" required icon={<KeyRound size={18} />} value={otpCode} onChange={(e) => setOtpCode(e.target.value)} />
                                <button disabled={loading} type="submit" className="w-full rounded-xl bg-black py-3 text-sm text-white font-semibold flex items-center justify-center gap-2 hover:bg-zinc-800 transition">
                                    {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "Verify Account"}
                                </button>
                                <button type="button" onClick={() => setStep(1)} className="w-full text-center text-xs text-slate-500 hover:text-black">Back to Register</button>
                            </form>
                        </>
                    )}
                    <p className="pt-5 text-center text-sm text-slate-500">Already have an account? <Link href="/auth/login" className="font-semibold text-black hover:underline">Sign in</Link></p>
                </div>
            </div>
            <AuthImageSlider />
        </div>
    );
};

export default Register;