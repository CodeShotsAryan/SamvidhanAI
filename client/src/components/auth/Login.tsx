'use client';

import React, { useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Lock, Mail } from "lucide-react";
import Input from "./Input";
import AuthImageSlider from "./AuthImageSlider";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post("http://localhost:3000/api/auth/login", {
        email,
        password,
      });

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }

      setTimeout(() => {
        router.push("/dashboard");
      }, 500);
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid email or password");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="w-full md:w-1/2 bg-white px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 py-6 md:py-10 flex flex-col justify-center">
        <div className="w-full max-w-md mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
            BlackOps
          </h1>

          <p className="text-slate-500 mb-6 text-sm">
            Welcome back! Login to your account
          </p>

          {error && (
            <div className="w-full rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
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

            <div className="flex justify-end">
              <Link href="/auth/forgot-password" className="text-sm text-sky-500 hover:text-sky-600 font-medium transition">
                Forgot password?
              </Link>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full rounded-xl bg-sky-400 py-3   text-sm text-white font-semibold flex items-center justify-center gap-2 hover:bg-sky-300 transition disabled:opacity-60 disabled:cursor-not-allowed mt-5"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin w-4 h-4" />
                  <span>Logging in...</span>
                </>
              ) : (
                <span>Login</span>
              )}
            </button>
          </form>

          <p className="pt-5 text-center text-sm text-slate-500">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/register"
              className="font-semibold text-sky-500 hover:text-sky-600 transition"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>

     
        <AuthImageSlider />
    </div>
  );
};

export default Login;