'use client';

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import api from "../../lib/api";
import { Loader2, Lock, KeyRound, CheckCircle2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Input from "./Input";
import AuthImageSlider from "./AuthImageSlider";

const ResetPasswordForm = () => {
    const searchParams = useSearchParams();
    const [email, setEmail] = useState("");
    const [otpCode, setOtpCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const e = searchParams.get("email");
        if (e) setEmail(e);
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await api.post("/api/auth/reset-password", {
                email,
                otp_code: otpCode,
                new_password: newPassword
            });
            setSuccess(true);
            setTimeout(() => {
                router.push("/auth/login");
            }, 2500);
        } catch (err: any) {
            setError(err.response?.data?.detail || "Reset failed. Please verify your code.");
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
                    <h2 className="text-2xl font-bold text-slate-900 mb-3">Password Reset!</h2>
                    <p className="text-slate-600">Your password has been changed. Redirecting to login...</p>
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
                    <p className="text-slate-500 mb-6 text-sm">Reset your password for {email}</p>

                    {error && <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 mb-4">{error}</div>}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input label="Verification Code" placeholder="123456" type="text" required icon={<KeyRound size={18} />} value={otpCode} onChange={(e) => setOtpCode(e.target.value)} />
                        <Input label="New Password" placeholder="••••••••" type="password" required icon={<Lock size={18} />} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />

                        <button disabled={loading} type="submit" className="w-full rounded-xl bg-black py-3 text-sm text-white font-semibold flex items-center justify-center gap-2 hover:bg-zinc-800 transition mt-4">
                            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "Reset Password"}
                        </button>
                    </form>
                </div>
            </div>

            {}
            <AuthImageSlider />
        </div>
    );
};

const ResetPassword = () => (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-black" /></div>}>
        <ResetPasswordForm />
    </Suspense>
);

export default ResetPassword;
