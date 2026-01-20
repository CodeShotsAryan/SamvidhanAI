'use client';

import React, { useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Lock, Mail, Scale, ChevronLeft } from "lucide-react";
import Input from "./Input";
import AuthImageSlider from "./AuthImageSlider";
import Image from "next/image";
import { API_ENDPOINTS } from "@/src/lib/config";
import { motion } from "framer-motion";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(API_ENDPOINTS.auth.login, {
        username,
        password,
      });

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);

        setTimeout(() => {
          router.push("/dashboard");
        }, 500);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || "Invalid username or password";
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#020617] text-white overflow-hidden">
      <div className="w-full md:w-1/2 px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 py-8 md:py-10 flex flex-col justify-center relative">
        <div className="absolute top-8 left-8">
          <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm font-medium group">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md mx-auto"
        >
          <div className="flex items-center gap-2 mb-12">
            <div className="w-8 h-8 bg-amber-500 rounded flex items-center justify-center">
              <Scale className="text-black w-5 h-5" />
            </div>
            <span className="text-xl font-serif font-bold tracking-tight">SamvidhanAI</span>
          </div>

          <h1 className="text-3xl font-serif font-bold mb-2">Welcome Back</h1>
          <p className="text-gray-400 mb-8 text-sm font-light">
            Enter your credentials to access the legal intelligence platform.
          </p>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400 mb-5"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Username or Email</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                  <Mail size={18} />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Advocate credentials..."
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all placeholder:text-gray-600"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Password</label>
                <Link href="/auth/forgot-password" className="text-xs text-amber-500/80 hover:text-amber-500 transition-colors font-bold">
                  Recover Access
                </Link>
              </div>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all placeholder:text-gray-600"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              type="submit"
              className="w-full rounded-xl bg-amber-500 text-black py-4 text-sm font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-amber-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-8 shadow-xl shadow-amber-500/10"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin w-4 h-4" />
                  <span>Verifying Intelligence...</span>
                </>
              ) : (
                <span>Access Dashboard</span>
              )}
            </motion.button>
          </form>

          <p className="pt-10 text-center text-sm text-gray-500 font-light">
            Unauthorized for counsel?{" "}
            <Link
              href="/auth/register"
              className="font-bold text-white hover:text-amber-500 transition-colors"
            >
              Apply for Access
            </Link>
          </p>
        </motion.div>
      </div>

      <AuthImageSlider />
    </div>
  );
};

export default Login;