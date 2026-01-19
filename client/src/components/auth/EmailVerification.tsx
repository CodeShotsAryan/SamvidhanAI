'use client';

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Scale, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from "@/components/ui/input-otp";
import Image from "next/image";
import { API_ENDPOINTS } from "@/src/lib/config";

const EmailVerification = () => {
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [email, setEmail] = useState("");
    const router = useRouter();

    // Load email from sessionStorage on mount
    useEffect(() => {
        const storedEmail = sessionStorage.getItem('verification-email');
        if (storedEmail) {
            setEmail(storedEmail);
        } else {
            // If no email found, redirect to register
            // router.push('/auth/register');
        }
    }, [router]);

    const handleVerify = async () => {
        if (otp.length !== 6) {
            setError("Please enter the complete 6-digit code");
            return;
        }

        setLoading(true);
        setError("");

        try {
            await axios.post(API_ENDPOINTS.auth.verifyEmail, {
                otp_code: otp,
                email: email,
            });

            setSuccess(true);
            // Clear the stored email
            sessionStorage.removeItem('verification-email');

            setTimeout(() => {
                router.push("/auth/login");
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.detail || "Invalid verification code. Please try again.");
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setLoading(true);
        setError("");

        try {
            await axios.post(API_ENDPOINTS.auth.resendVerification, {
                email: email,
            });
            setError(""); // Clear any previous errors
            // You could show a success message here if you want
        } catch (err: any) {
            setError(err.response?.data?.detail || "Failed to resend code. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white px-4 py-6">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-zinc-200 p-6 sm:p-8 text-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-5">
                        <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" />
                    </div>

                    <h2 className="text-xl sm:text-2xl font-bold text-black mb-3">
                        Email Verified Successfully!
                    </h2>

                    <p className="text-sm text-zinc-600 mb-4">
                        Your email has been successfully verified. Redirecting to login...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-white px-4 py-6">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-zinc-200 p-6 sm:p-8">
                <div className="flex items-center justify-center gap-2 mb-6">
                    <Image src="/loogoo.png" alt="Logo" width={150} height={150} className="w-32 sm:w-40 h-auto object-contain" />
                </div>

                <h2 className="text-2xl sm:text-3xl font-bold text-black mb-2 text-center">
                    Verify Your Email
                </h2>

                <p className="text-sm text-zinc-600 mb-8 text-center">
                    Enter the 6-digit code sent to your email
                </p>

                {error && (
                    <div className="w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 mb-5 flex items-center gap-2">
                        <XCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <div className="flex justify-center mb-6">
                    <InputOTP maxLength={6} value={otp} onChange={setOtp} >
                        <InputOTPGroup >
                            <InputOTPSlot index={0} className="w-8 h-8 sm:w-12 sm:h-12 md:w-14 md:h-14 text-base sm:text-lg border-zinc-300 focus:border-black" />
                            <InputOTPSlot index={1} className="w-8 h-8 sm:w-12 sm:h-12 md:w-14 md:h-14 text-base sm:text-lg border-zinc-300 focus:border-black" />
                            <InputOTPSlot index={2} className="w-8 h-8 sm:w-12 sm:h-12 md:w-14 md:h-14 text-base sm:text-lg border-zinc-300 focus:border-black" />
                        </InputOTPGroup>
                        <InputOTPSeparator />
                        <InputOTPGroup >
                            <InputOTPSlot index={3} className="w-8 h-8 sm:w-12 sm:h-12 md:w-14 md:h-14 text-base sm:text-lg border-zinc-300 focus:border-black" />
                            <InputOTPSlot index={4} className="w-8 h-8 sm:w-12 sm:h-12 md:w-14 md:h-14 text-base sm:text-lg border-zinc-300 focus:border-black" />
                            <InputOTPSlot index={5} className="w-8 h-8 sm:w-12 sm:h-12 md:w-14 md:h-14 text-base sm:text-lg border-zinc-300 focus:border-black" />
                        </InputOTPGroup>
                    </InputOTP>
                </div>

                <button
                    onClick={handleVerify}
                    disabled={loading || otp.length !== 6}
                    className="w-full rounded-xl bg-black text-white py-3 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-zinc-800 transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                >
                    {loading ? (
                        <>
                            <Loader2 className="animate-spin w-4 h-4" />
                            <span>Verifying...</span>
                        </>
                    ) : (
                        <span>Verify Email</span>
                    )}
                </button>

                <button
                    onClick={handleResend}
                    disabled={loading}
                    className="w-full text-sm text-zinc-700 hover:text-black font-medium transition-opacity duration-200 disabled:opacity-50"
                >
                    Didn't receive the code? Resend
                </button>
            </div>
        </div>
    );
};

export default EmailVerification;