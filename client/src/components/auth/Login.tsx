'use client';

import React, { useState } from "react";
import api from "../../lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Lock, User } from "lucide-react";
import Input from "./Input";
import AuthImageSlider from "./AuthImageSlider";

const Login = () => {
  const [id, setId] = useState(""); // Email or Username
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/login", {
        username: id,
        password,
      });

      if (response.data.access_token) {
        localStorage.setItem("access_token", response.data.access_token);
        localStorage.setItem("token_type", response.data.token_type);
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="w-full md:w-1/2 bg-white px-6 py-10 flex flex-col justify-center">
        <div className="w-full max-w-md mx-auto">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">SamvidhanAI</h1>
          <p className="text-slate-500 mb-6 text-sm">Welcome back! Login to your account</p>

          {error && <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 mb-4">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Username or Email" placeholder="aryanboss" type="text" required icon={<User size={18} />} value={id} onChange={(e) => setId(e.target.value)} />
            <Input label="Password" placeholder="••••••••" type="password" required icon={<Lock size={18} />} value={password} onChange={(e) => setPassword(e.target.value)} />

            <div className="flex justify-end">
              <Link href="/auth/forgot-password" size="sm" className="text-xs text-zinc-500 hover:text-black hover:underline">Forgot password?</Link>
            </div>

            <button disabled={loading} type="submit" className="w-full rounded-xl bg-black py-3 text-sm text-white font-semibold flex items-center justify-center gap-2 hover:bg-zinc-800 transition">
              {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "Login"}
            </button>
          </form>

          <p className="pt-5 text-center text-sm text-slate-500">Don't have an account? <Link href="/auth/register" className="font-semibold text-black hover:underline">Sign Up</Link></p>
        </div>
      </div>
      <AuthImageSlider />
    </div>
  );
};

export default Login;