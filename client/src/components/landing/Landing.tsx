'use client'

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, Shield, Search, BookOpen, FileText, Globe, Menu, X, ArrowRight, ExternalLink, Gavel, ChevronRight, Check } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const LandingPage: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsLoaded(true);

    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
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
      title: "IPC vs BNS Comparison",
      description: "Efficiently map old sections to new laws with crystal-clear explanations of legislative shifts.",
      icon: Search
    },
    {
      title: "Legal PDF AI Summarizer",
      description: "Trained on reliable Indian Law context to extract verdicts and core arguments from complex court orders.",
      icon: FileText
    },
    {
      title: "Interactive Voice Assistant",
      description: "Click to listen to AI responses. Learn the law through speech for a more accessible experience.",
      icon: Globe
    },
    {
      title: "History Management",
      description: "Your research history is saved securely, allowing you to revisit and learn from previous queries.",
      icon: BookOpen
    },
    {
      title: "Reliable Law Context",
      description: "Every response is superb, efficient, and backed by verified snippets from official Indian legal sources.",
      icon: Shield
    },
    {
      title: "Landmark Judgment Finder",
      description: "Superb & efficient lookup for Supreme Court and High Court precedents relevant to your case.",
      icon: Scale
    }
  ];

  const fadeIn = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 1, ease: "easeOut" }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isLoaded ? 1 : 0 }}
      transition={{ duration: 1, ease: "easeOut" }}
      className="min-h-screen bg-white text-black overflow-x-hidden"
    >
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-lg border-b border-gray-50 shadow-sm' : 'bg-white'}`}>
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-19 overflow-hidden">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 flex items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 shadow-sm">
                <Image src="/iconn.png" alt="Logo" width={24} height={24} className="rounded-full" />
              </div>
              <span className="text-xl font-bold tracking-tight">SamvidhanAI</span>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="hidden md:flex items-center space-x-8"
            >
              <a href="#features" className="text-sm text-black/60 hover:text-black transition-colors cursor-pointer">Features</a>
              <a href="#framework" className="text-sm text-black/60 hover:text-black transition-colors cursor-pointer">Domains</a>
              <a href="/auth/login" className="text-sm text-black/60 hover:text-black transition-colors cursor-pointer">Login</a>
              <button
                onClick={handleAuthAction}
                className="px-5 py-2 bg-black text-white text-sm font-medium hover:bg-black/90 transition-all cursor-pointer rounded"
              >
                Sign Up
              </button>
            </motion.div>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden cursor-pointer z-50"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </motion.button>
          </div>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="md:hidden bg-white border-t border-black/10 overflow-hidden"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="px-6 py-4 space-y-3"
              >
                <a href="#features" onClick={() => setIsMenuOpen(false)} className="block text-sm text-black/60 hover:text-black transition-colors cursor-pointer">Features</a>
                <a href="#framework" onClick={() => setIsMenuOpen(false)} className="block text-sm text-black/60 hover:text-black transition-colors cursor-pointer">Framework</a>
                <a href="#technology" onClick={() => setIsMenuOpen(false)} className="block text-sm text-black/60 hover:text-black transition-colors cursor-pointer">Technology</a>
                <a href="#docs" onClick={() => setIsMenuOpen(false)} className="block text-sm text-black/60 hover:text-black transition-colors cursor-pointer">Docs</a>
                <button
                  onClick={handleAuthAction}
                  className="w-full px-5 py-2 bg-black text-white text-sm font-medium hover:bg-black/90 transition-all cursor-pointer rounded"
                >
                  Sign Up
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <section className="relative pt-52 pb-16 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="text-center mb-12"
          >
            <motion.h1
              variants={fadeIn}
              className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight"
            >
              Master the New <br />Indian Laws with AI
            </motion.h1>
            <motion.p
              variants={fadeIn}
              className="text-base md:text-lg text-black/60 max-w-2xl mx-auto mb-10 leading-relaxed font-medium"
            >
              Understand Indian laws like never before. SamvidhanAI is your intelligent legal helper that simplifies the BNS-IPC transition, analyzes complex court orders, and provides reliable research for everyone.
            </motion.p>
            <motion.div variants={fadeIn}>
              <button className="px-8 py-4 bg-black text-white text-sm font-bold hover:bg-black/90 transition-all cursor-pointer rounded-lg shadow-sm" onClick={handleAuthAction}>
                Get Started for Free
              </button>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.6 }}
            className="bg-gray-50 rounded-2xl p-6 md:p-10 border border-black/10 mb-12"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-zinc-900 rounded-full flex items-center justify-center text-white text-[10px] font-bold">Helper</div>
                <span className="text-sm font-bold text-zinc-800">New Law Assistant</span>
              </div>
              <div className="text-xs text-black/40 font-bold uppercase tracking-wider">BNS vs IPC Helper</div>
            </div>

            <h2 className="text-3xl font-bold mb-4 tracking-tight text-zinc-900">Making the Switch Simple</h2>

            <div className="bg-white rounded-xl border border-black/10 p-6 md:p-8 mb-4 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-base mb-1">Interactive Learning</h3>
                  <div className="flex items-center space-x-2 text-xs text-black/40 font-bold uppercase tracking-wide">
                    <span>Topic: Murder (Punishment)</span>
                  </div>
                </div>
              </div>
              <p className="text-sm md:text-base text-black/70 leading-relaxed mb-6 font-medium">
                Confused about what changed? SamvidhanAI shows you exactly how old IPC sections map to new BNS provisions, with simple explanations of any changes in punishment or definition.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-zinc-900 rounded-xl h-36 flex flex-col items-center justify-center text-white p-6 shadow-md transition-transform">
                  <span className="text-[10px] font-bold uppercase opacity-60 mb-2 tracking-widest">The Old Law</span>
                  <span className="text-2xl font-black">IPC 302</span>
                  <span className="text-[10px] opacity-60 mt-2 font-bold">Murder (Punishment)</span>
                </div>
                <div className="bg-white rounded-xl h-36 flex flex-col items-center justify-center text-zinc-900 p-6 border-2 border-zinc-200 shadow-md transition-transform">
                  <span className="text-[10px] font-bold uppercase text-zinc-400 mb-2 tracking-widest">The New Law</span>
                  <span className="text-2xl font-black">BNS 103</span>
                  <span className="text-[10px] text-zinc-400 mt-2 font-bold">(1) Section Updated</span>
                </div>
              </div>
            </div>

            <div className="text-center text-xs text-black/40 font-bold uppercase tracking-widest py-2">
              SamvidhanAI: Learn the law, don't just search it.
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
          >
            <div className="text-left p-8 bg-white rounded-2xl border border-zinc-100 shadow-sm transition-all">
              <div className="w-12 h-12 bg-zinc-50 rounded-xl mx-0 mb-6 flex items-center justify-center border border-zinc-100">
                <BookOpen className="w-6 h-6 text-zinc-900" />
              </div>
              <h3 className="font-bold mb-3 text-lg">Smart Dictionary</h3>
              <p className="text-sm text-black/60 leading-relaxed font-medium">Access every single section of BNS and IPC with simple summaries that anyone can understand.</p>
            </div>
            <div className="text-left p-8 bg-white rounded-2xl border border-zinc-100 shadow-sm transition-all">
              <div className="w-12 h-12 bg-zinc-50 rounded-xl mx-0 mb-6 flex items-center justify-center border border-zinc-100">
                <FileText className="w-6 h-6 text-zinc-900" />
              </div>
              <h3 className="font-bold mb-3 text-lg">Case Investigator</h3>
              <p className="text-sm text-black/60 leading-relaxed font-medium">Find exactly which judge said what. Lookup important Supreme Court cases relevant to your specific situation.</p>
            </div>
            <div className="text-left p-8 bg-white rounded-2xl border border-zinc-100 shadow-sm transition-all">
              <div className="w-12 h-12 bg-zinc-50 rounded-xl mx-0 mb-6 flex items-center justify-center border border-zinc-100">
                <Shield className="w-6 h-6 text-zinc-900" />
              </div>
              <h3 className="font-bold mb-3 text-lg">Order Reader</h3>
              <p className="text-sm text-black/60 leading-relaxed font-medium">Upload any court order PDF. Our AI reads it for you and tells you the core decision and the reasons behind it.</p>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="features" className="py-16 px-6 lg:px-8 bg-zinc-50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
              Powerful Features <br />to Help You
            </h2>
            <p className="text-sm text-black/60 max-w-2xl mx-auto font-medium">
              We have built everything you need to understand the new laws easily. No more confusion, just clear answers.
            </p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={i}
                  variants={fadeIn}
                  className="border border-black/10 rounded-lg p-6 transition-all group cursor-pointer bg-white"
                >
                  <Icon className="w-10 h-10 mb-4 transition-transform text-zinc-900" />
                  <h3 className="text-base font-semibold mb-2">{feature.title}</h3>
                  <p className="text-xs text-black/60 leading-relaxed mb-4 font-medium">{feature.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-6 lg:px-8 bg-white border-y border-zinc-100">
        <div className="max-w-6xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="text-3xl md:text-5xl font-bold mb-3 tracking-tight"
          >
            Legal Research at Your Fingertips
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-sm text-black/60 mb-12 font-medium"
          >
            Access comprehensive legal intelligence anywhere. Query statutes, compare sections, and research case laws with seamless synchronization.
          </motion.p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
            <div className="bg-zinc-50 p-8 rounded-2xl border border-zinc-200">
              <h3 className="text-lg font-bold mb-2">Bilingual Support</h3>
              <p className="text-sm text-zinc-600 font-medium">Submit queries in English or Hindi. Retrieve sections from both BNS and IPC with perfect cross-linguistic accuracy.</p>
            </div>
            <div className="bg-zinc-50 p-8 rounded-2xl border border-zinc-200">
              <h3 className="text-lg font-bold mb-2">Verified Citations</h3>
              <p className="text-sm text-zinc-600 font-medium">Every answer includes precise footnotes linking directly to official government gazettes and digitized legal documents.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="framework" className="py-20 px-6 lg:px-8 bg-zinc-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
            >
              <div className="bg-white rounded-2xl p-8 border border-black/10 shadow-sm">
                <h3 className="text-xs font-bold text-zinc-400 mb-6 uppercase tracking-widest">Available Domains</h3>
                <div className="space-y-4">
                  {[
                    "Criminal & Penal Law",
                    "Constitutional Law",
                    "Corporate & Commercial Acts",
                    "Cyber, IT & Digital Privacy",
                    "Labour & Employment Regulations"
                  ].map((domain, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl border border-zinc-100 hover:border-zinc-300 transition-colors">
                      <div className="flex items-center space-x-3">
                        <Scale className="w-5 h-5 text-zinc-900" />
                        <span className="text-sm font-semibold">{domain}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
                Navigate the Indian Justice System with Domain-Specific Precision
              </h2>
              <p className="text-sm text-black/60 leading-relaxed mb-6 font-medium">
                Our advanced AI models are trained on the nuances of Indian statutes. Whether you are researching corporate compliance, digital privacy regulations, or criminal procedure shifts, SamvidhanAI delivers refined answers instantly.
              </p>
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full bg-zinc-800 border-2 border-white flex items-center justify-center text-[10px] text-white">
                      AI
                    </div>
                  ))}
                </div>
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Trusted by Professionals</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 lg:px-8 bg-black text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="text-4xl md:text-5xl font-bold mb-4 tracking-tight"
          >
            Step into the New Era <br />of Indian Legal Research
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-sm text-white/60 mb-8 font-medium max-w-xl mx-auto"
          >
            Join thousands of legal practitioners and researchers using SamvidhanAI to navigate the IPC to BNS transition with accuracy and speed.
          </motion.p>
          <motion.button
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.3 }}
            onClick={handleAuthAction}
            className="px-8 py-4 bg-white text-black text-sm font-bold hover:bg-white/90 transition-all cursor-pointer rounded-lg shadow-xl"
          >
            Get Started for Free
          </motion.button>
        </div>
      </section>

      <footer className="border-t border-black/10 py-12 px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-1">
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-8 h-8 flex items-center justify-center rounded-full border border-zinc-200 bg-zinc-50">
                  <Image src="/iconn.png" alt="Logo" width={20} height={20} className="rounded-full" />
                </div>
                <span className="text-lg font-bold tracking-tight">SamvidhanAI</span>
              </div>
              <p className="text-[10px] text-black/50 font-bold uppercase tracking-widest leading-loose">
                Empowering Legal Intelligence <br /> across India
              </p>
            </div>

            <div>
              <h3 className="font-bold text-xs uppercase tracking-widest text-zinc-400 mb-4">Platform</h3>
              <ul className="space-y-2 text-sm text-black/60 font-medium">
                <li className="hover:text-black transition-colors cursor-pointer">BNS-IPC Mapping</li>
                <li className="hover:text-black transition-colors cursor-pointer">Case Law Research</li>
                <li className="hover:text-black transition-colors cursor-pointer">PDF Analysis</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-xs uppercase tracking-widest text-zinc-400 mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-black/60 font-medium">
                <li className="hover:text-black transition-colors cursor-pointer">Privacy Policy</li>
                <li className="hover:text-black transition-colors cursor-pointer">Terms of Service</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-xs uppercase tracking-widest text-zinc-400 mb-4">Connect</h3>
              <ul className="space-y-2 text-sm text-black/60 font-medium">
                <li className="hover:text-black transition-colors cursor-pointer">About Us</li>
                <li className="hover:text-black transition-colors cursor-pointer">Contact</li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-zinc-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-black/40 font-medium">© 2025 SamvidhanAI. All rights reserved.</p>
            <div className="flex gap-6">
              <span className="text-xs text-black/40 font-bold">English</span>
              <span className="text-xs text-black/40 font-bold">Hindi</span>
            </div>
          </div>
        </div>
      </footer>
    </motion.div>
  );
};

export default LandingPage;