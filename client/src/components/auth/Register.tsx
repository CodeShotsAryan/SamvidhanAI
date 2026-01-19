'use client';

import React, { useState } from "react";
import axios from "axios";
import { Loader2, Lock, Mail, User, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Input from "./Input";
import AuthImageSlider from "./AuthImageSlider";

const Register = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showVerificationMessage, setShowVerificationMessage] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await axios.post("http://localhost:3000/api/auth/register", {
                name,
                email,
                password,
            });

            setShowVerificationMessage(true);

            setTimeout(() => {
                router.push("/auth/login");
            }, 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || "Registration failed. Please try again.");
            setLoading(false);
        }
    };

    if (showVerificationMessage) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-white to-slate-50 px-4 py-6">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-6 sm:p-8 text-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-5">
                        <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" />
                    </div>

                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3">
                        Verification Email Sent!
                    </h2>

                    <p className="text-sm text-slate-600 mb-2">
                        We've sent a verification link to
                    </p>

                    <p className="text-sm font-semibold text-sky-600 mb-4 break-all">
                        {email}
                    </p>

                    <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 mb-4">
                        <p className="text-xs text-slate-700">
                            Please check your inbox and click the verification link to activate your account.
                        </p>
                    </div>

                    <p className="text-xs text-slate-500 mb-4">
                        Redirecting to login page...
                    </p>

                    <button
                        onClick={() => router.push("/auth/login")}
                        className="w-full rounded-xl bg-sky-400 py-2.5 text-sm text-white font-semibold hover:bg-sky-300 transition"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex">
            <div className="w-full md:w-1/2 bg-white px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 py-6 md:py-10 flex flex-col justify-center">
                <div className="w-full max-w-md mx-auto">
                    <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
                        BlackOps
                    </h1>

                    <p className="text-slate-500 mb-6 text-sm">
                        Create your account to get started
                    </p>

                    {error && (
                        <div className="w-full rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700 mb-4">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-3.5">
                        <Input
                            label="Full Name"
                            placeholder="John Doe"
                            type="text"
                            required
                            icon={<User size={18} />}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
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
                            className="w-full rounded-xl bg-sky-400 py-3 text-sm text-white font-semibold flex items-center justify-center gap-2 hover:bg-sky-300 transition disabled:opacity-60 disabled:cursor-not-allowed mt-5"
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

                    <p className="pt-5 text-center text-sm text-slate-500">
                        Already have an account?{" "}
                        <Link
                            href="/auth/login"
                            className="font-semibold text-sky-500 hover:text-sky-600 transition"
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