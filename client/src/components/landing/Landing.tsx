'use client'

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import {
  Scale, Shield, Search, BookOpen, FileText, Globe, Menu, X,
  ArrowRight, ExternalLink, Gavel, ChevronRight, Check,
  Landmark, ScrollText, Sparkles
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const LandingPage: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const { scrollY } = useScroll();

  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 300], [1, 1.1]);
  const heroY = useTransform(scrollY, [0, 300], [0, 100]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAuthAction = () => {
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/dashboard');
    } else {
      router.push('/auth/register');
    }
  };

  const features = [
    {
      title: "Statutory Intelligence",
      description: "Seamlessly navigate BNS and IPC with AI-powered cross-linguistic accuracy in English and Hindi.",
      icon: ScrollText,
      color: "from-blue-500/20 to-cyan-500/20"
    },
    {
      title: "Case Law Synthesis",
      description: "Instant access to Supreme Court and High Court judgments relevant to your specific legal context.",
      icon: Landmark,
      color: "from-purple-500/20 to-pink-500/20"
    },
    {
      title: "Legislative Bridge",
      description: "Interactive clause comparison tracking shifts between traditional IPC and modern BNS provisions.",
      icon: Scale,
      color: "from-amber-500/20 to-orange-500/20"
    }
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-amber-500/30 font-sans overflow-x-hidden">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-[100] transition-all duration-500 ${scrolled ? 'py-4 bg-black/40 backdrop-blur-xl border-b border-white/10' : 'py-6 bg-transparent'
        }`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Scale className="text-black w-6 h-6" />
            </div>
            <span className="text-2xl font-serif font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              SamvidhanAI
            </span>
          </motion.div>

          <div className="hidden md:flex items-center gap-8">
            {['Features', 'Framework', 'Technology'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
                {item}
              </a>
            ))}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAuthAction}
              className="px-6 py-2.5 bg-white text-black text-sm font-bold rounded-full hover:bg-amber-400 transition-all shadow-xl shadow-white/5"
            >
              Enter The Courtroom
            </motion.button>
          </div>

          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-white">
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Overlay */}
        <motion.div
          style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
          className="absolute inset-0 z-0"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/60 via-[#020617]/80 to-[#020617] z-10" />
          <Image
            src="/assets/legal_hero.png"
            alt="Hero Background"
            fill
            className="object-cover opacity-40"
            priority
          />
        </motion.div>

        {/* Animated Particles/Orbs */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-amber-600/10 rounded-full blur-[120px] animate-pulse delay-700" />

        <div className="relative z-20 max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-amber-400 text-xs font-bold uppercase tracking-widest mb-8 backdrop-blur-sm">
              <Sparkles className="w-3 h-3" /> Built for the Indian Justice System
            </div>
            <h1 className="text-6xl md:text-8xl font-serif font-bold mb-8 leading-[1.1] tracking-tight">
              Where AI Meets <br />
              <span className="bg-gradient-to-r from-amber-200 via-amber-500 to-amber-200 bg-clip-text text-transparent">Divine Justice</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed font-light">
              SamvidhanAI is an elite intelligence layer for legal professionals,
              synthesizing the Indian Constitution, BNS, and IPC into actionable precision.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(245, 158, 11, 0.3)" }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAuthAction}
                className="group relative px-8 py-4 bg-amber-500 text-black font-bold rounded-2xl overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-12" />
                <span className="relative flex items-center gap-2">
                  Start Legal Query <ArrowRight className="w-5 h-5" />
                </span>
              </motion.button>
              <button className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-2xl border border-white/10 transition-all backdrop-blur-md">
                View Documentation
              </button>
            </div>
          </motion.div>
        </div>

        {/* Bottom Fade */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#020617] to-transparent z-20" />
      </section>

      {/* Stats/Proof Section */}
      <section className="relative z-30 -mt-20 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: "Statutes Indexed", value: "10,000+" },
            { label: "Case Law Database", value: "2M+" },
            { label: "Query Accuracy", value: "99.9%" }
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-3xl text-center"
            >
              <div className="text-4xl font-serif font-bold text-amber-500 mb-2">{stat.value}</div>
              <div className="text-gray-400 text-sm font-medium uppercase tracking-widest">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">Supreme Capabilities</h2>
            <div className="w-24 h-1 bg-amber-500 mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10 }}
                className="group relative p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-amber-500/50 transition-all duration-500"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4 group-hover:text-amber-400 transition-colors uppercase tracking-tight">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed font-light mb-8">
                  {feature.description}
                </p>
                <div className="flex items-center gap-2 text-amber-500 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn More <ChevronRight className="w-4 h-4" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Immersive Section */}
      <section className="py-32 px-6 bg-gradient-to-b from-transparent to-black/40">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute inset-0 bg-blue-500/20 blur-[100px]" />
            <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
              <Image
                src="/assets/justice_scales.png"
                alt="Justice Scales AI"
                width={800}
                height={800}
                className="w-full object-cover"
              />
            </div>
            {/* Floating Card */}
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -bottom-10 -right-10 hidden md:block w-64 p-6 bg-black/60 backdrop-blur-3xl border border-white/20 rounded-2xl shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs font-bold text-gray-400">AI AGENT ACTIVE</span>
              </div>
              <p className="text-sm font-medium leading-relaxed italic">
                "Cross-referencing Section 302 IPC with Section 101 BNS. Verifying Supreme Court precedents..."
              </p>
            </motion.div>
          </motion.div>

          <div>
            <h4 className="text-amber-500 font-bold tracking-[0.2em] uppercase text-sm mb-6">Unrivaled Precision</h4>
            <h2 className="text-4xl md:text-6xl font-serif font-bold mb-8 leading-tight">
              Justice is Blind. <br />
              <span className="text-gray-500">AI is Not.</span>
            </h2>
            <div className="space-y-8">
              {[
                { title: "Verifiable Source Footnoting", desc: "Every answer is backed by direct links to official government gazettes." },
                { title: "Multi-Jurisdictional Logic", desc: "Filter by Corporate Law, IT Acts, or Environmental Regulations." },
                { title: "Bilingual statutory logic", desc: "Switch instantly between Hindi and English statutory contexts." }
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="mt-1 w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4 text-amber-500" />
                  </div>
                  <div>
                    <h5 className="font-bold text-lg mb-1">{item.title}</h5>
                    <p className="text-gray-400 font-light">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-40 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 to-transparent blur-[120px]" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-7xl font-serif font-bold mb-8">A New Era of Legal Intelligence</h2>
            <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
              Join the elite league of law practitioners leveraging SamvidhanAI.
              Efficiency is no longer a luxury, it's a mandate.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAuthAction}
              className="px-12 py-5 bg-white text-black font-black text-lg rounded-2xl hover:bg-amber-400 transition-all shadow-2xl shadow-amber-500/20 uppercase tracking-widest"
            >
              Access The Intelligence
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-white/5 bg-black/20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-amber-500 rounded flex items-center justify-center">
                <Scale className="text-black w-5 h-5" />
              </div>
              <span className="text-xl font-serif font-bold">SamvidhanAI</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              Empowering the Indian judicial ecosystem with high-fidelity artificial intelligence and verifiable statutory data.
            </p>
          </div>

          {[
            { title: "Ecosystem", links: ["Statutes", "Case Law", "Summarization"] },
            { title: "Trust", links: ["Privacy Policy", "Legal Disclosure", "Source Verification"] },
            { title: "Connect", links: ["Institutional Access", "Professional Support", "Developer API"] }
          ].map((column, i) => (
            <div key={i}>
              <h4 className="font-bold text-gray-300 mb-6 uppercase tracking-widest text-xs">{column.title}</h4>
              <ul className="space-y-4">
                {column.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-gray-500 hover:text-white transition-colors text-sm">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/5 text-center text-gray-600 text-xs tracking-widest uppercase">
          © 2026 SamvidhanAI Intelligence Systems. Pro Bono Publico.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;