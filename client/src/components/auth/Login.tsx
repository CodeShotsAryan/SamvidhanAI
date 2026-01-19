'use client';

import React, { useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Lock, Mail, Scale } from "lucide-react";
import Input from "./Input";
import AuthImageSlider from "./AuthImageSlider";
import Image from "next/image";

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
    <div className="min-h-screen flex bg-white">
      <div className="w-full md:w-1/2 bg-white px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 py-8 md:py-10 flex flex-col justify-center">
        <div className="w-full max-w-md mx-auto">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Image src="/loogoo.png" alt="Logo" width={150} height={150} className="w-48 sm:w-56 h-auto object-contain" />
          </div>

          <p className="text-zinc-600 mb-8 text-sm">
            Welcome back! Login to your account
          </p>

          {error && (
            <div className="w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
              <Link href="/auth/forgot-password" className="text-sm text-zinc-700 hover:text-black font-medium transition-opacity duration-200">
                Forgot password?
              </Link>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full rounded-xl bg-black text-white py-3 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-zinc-800 transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
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

          <p className="pt-6 text-center text-sm text-zinc-600">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/register"
              className="font-semibold text-black hover:text-zinc-700 transition-opacity duration-200"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>

      <div className="hidden md:block md:w-1/2">
        <AuthImageSlider />
      </div>
    </div>
  );
};

export default Login;