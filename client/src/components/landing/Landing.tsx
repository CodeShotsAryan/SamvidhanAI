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

  const features = [
    {
      title: "Bilingual Statutory Querying",
      description: "Submit queries in English and Hindi. Retrieve sections from BNS and IPC with total cross-linguistic accuracy.",
      icon: Globe
    },
    {
      title: "Automated Case Law Cross-Referencing",
      description: "Identifies relevant Supreme Court and High Court judgments specific to your legal sections instantly.",
      icon: Search
    },
    {
      title: "Interactive Clause Comparison",
      description: "Side-by-side comparison of old IPC sections and their updated BNS counterparts to track legislative shifts.",
      icon: FileText
    },
    {
      title: "Multi-Jurisdictional Filtering",
      description: "Refine searches by Corporate Law, IT Acts, or Environmental Regulations for domain-specific precision.",
      icon: Shield
    },
    {
      title: "Verifiable Source Footnoting",
      description: "Precise, clickable citations linking directly to official government gazettes or digitized statute documents.",
      icon: ExternalLink
    },
    {
      title: "Legal Document Summarization",
      description: "Process court orders to extract core arguments, final verdicts, and specific acts cited within the text.",
      icon: BookOpen
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
            <Image src="/SamvidhanAI.png" alt="Logo" width={300} height={300} className='mt-1' />

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="hidden md:flex items-center space-x-8"
            >
              <a href="#features" className="text-sm text-black/60 hover:text-black transition-colors cursor-pointer">Features</a>
              <a href="#framework" className="text-sm text-black/60 hover:text-black transition-colors cursor-pointer">Framework</a>
              <a href="#technology" className="text-sm text-black/60 hover:text-black transition-colors cursor-pointer">Technology</a>
              <a href="#docs" className="text-sm text-black/60 hover:text-black transition-colors cursor-pointer">Docs</a>
              <button onClick={() => router.push('/auth/register')} className="px-5 py-2 bg-black text-white text-sm font-medium hover:bg-black/90 transition-all cursor-pointer rounded">
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
                <button onClick={() => router.push('/auth/register')} className="w-full px-5 py-2 bg-black text-white text-sm font-medium hover:bg-black/90 transition-all cursor-pointer rounded">
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
              className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 "
            >
              Boost your productivity<br />with one tool
            </motion.h1>
            <motion.p
              variants={fadeIn}
              className="text-base md:text-lg text-black/60 max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              Advanced Retrieval-Augmented Generation framework providing precise, context-aware answers to complex legal queries regarding Indian penal codes and regulatory statutes.
            </motion.p>
            <motion.div variants={fadeIn}>
              <button className="px-7 py-3 bg-black text-white text-sm font-medium hover:bg-black/90 transition-all cursor-pointer rounded" onClick={() => router.push('/auth/register')}>
                Get started
              </button>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.6 }}
            className="bg-gray-50 rounded-lg p-6 md:p-8 border border-black/10 mb-12"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white text-xs">AI</div>
                <span className="text-sm font-medium">Legal Research</span>
              </div>
              <div className="text-xs text-black/50">BNS / IPC Database</div>
            </div>

            <h2 className="text-2xl font-bold mb-4">Bhartiya Nyaya Sanhita Transition</h2>

            <div className="bg-white rounded border border-black/10 p-6 mb-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-sm mb-1">Section Mapping</h3>
                  <div className="flex items-center space-x-2 text-xs text-black/50">
                    <span>Updated</span>
                    <span>2 minutes ago</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-black/70 leading-relaxed mb-4">
                The Bhartiya Nyaya Sanhita replaces the Indian Penal Code with modernized provisions. Our system tracks every legislative change, providing side-by-side comparisons of old IPC sections and their updated BNS counterparts for complete transparency.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black rounded h-32 flex items-center justify-center text-white font-bold">IPC 302</div>
                <div className="bg-gray-100 rounded h-32 flex items-center justify-center font-bold">BNS 101</div>
              </div>
            </div>

            <div className="text-center text-xs text-black/50">
              With SamvidhanAI, access comprehensive legal intelligence in a collaborative space
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
          >
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-black rounded mx-auto mb-4 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2 text-sm">Statutory Database</h3>
              <p className="text-xs text-black/60 leading-relaxed">Access complete IPC and BNS provisions with cross-referenced case law from Supreme Court and High Courts</p>
            </div>
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-black rounded mx-auto mb-4 flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2 text-sm">Legal Documents</h3>
              <p className="text-xs text-black/60 leading-relaxed">Process court orders to extract core arguments, verdicts, and cited provisions automatically</p>
            </div>
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-black rounded mx-auto mb-4 flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2 text-sm">Verified Sources</h3>
              <p className="text-xs text-black/60 leading-relaxed">Every citation links directly to official government gazettes and digitized statute documents</p>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="relative py-16 px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="text-3xl md:text-5xl font-bold mb-4"
            >
              Real time collaboration<br />with your team
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.2 }}
              className="text-sm text-black/60 max-w-xl mx-auto"
            >
              Share legal research findings instantly with your team. Collaborate on case analysis with synchronized updates across all devices.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.3 }}
            className="bg-white rounded-lg p-6 border border-black/10 mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm">Case Law Analysis</h3>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-7 h-7 bg-gray-200 rounded-full"></div>
                ))}
              </div>
            </div>
            <p className="text-xs text-black/60 leading-relaxed mb-3">
              Multi-jurisdictional filtering enables domain-specific searches across Corporate Law, IT Acts, and Environmental Regulations. Automated cross-referencing identifies landmark judgments relevant to your query.
            </p>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1 bg-black text-white text-xs rounded cursor-pointer">Copy Link</button>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="features" className="py-16 px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Architecture of Law,<br />Enhanced by AI
            </h2>
            <p className="text-sm text-black/60 max-w-2xl mx-auto">
              Our RAG framework is engineered to navigate the nuances of the Indian Justice system, providing high-fidelity responses with verifiable truth
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
                  className="border border-black/10 rounded-lg p-6 hover:border-black/30 hover:shadow-lg transition-all group cursor-pointer bg-white"
                >
                  <Icon className="w-10 h-10 mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-base font-semibold mb-2">{feature.title}</h3>
                  <p className="text-xs text-black/60 leading-relaxed mb-4">{feature.description}</p>
                  <div className="flex items-center text-xs font-medium group-hover:gap-2 transition-all">
                    Explore <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      <section className="py-16 px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="text-3xl md:text-5xl font-bold mb-3"
          >
            Also available on your phone
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-sm text-black/60 mb-12"
          >
            Access legal intelligence anywhere. Query statutes, compare sections, and research case law on any device with seamless synchronization.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.3 }}
            className="flex justify-center items-center gap-4 flex-wrap"
          >
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-48 h-96 bg-white rounded-2xl border border-black/10 shadow-lg"></div>
            ))}
          </motion.div>
        </div>
      </section>

      <section id="framework" className="py-16 px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
            >
              <div className="bg-gray-50 rounded-lg p-6 border border-black/10">
                <h3 className="text-xs font-semibold text-black/50 mb-4">Legal Domains</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white rounded border border-black/10">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-4 h-4" />
                      <span className="text-sm">Corporate Law</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded border border-black/10">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-4 h-4" />
                      <span className="text-sm">IT & Cyber Acts</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded border border-black/10">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-4 h-4" />
                      <span className="text-sm">Environmental Regulations</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Navigate complex legal queries with domain-specific precision
              </h2>
              <p className="text-sm text-black/60 leading-relaxed mb-6">
                Our multi-jurisdictional filtering system enables refined searches across specialized legal domains. Whether researching corporate compliance, information technology regulations, or environmental law, access relevant statutes and case precedents instantly.
              </p>
              <p className="text-sm text-black/60 leading-relaxed">
                Every query is processed through our advanced RAG framework to deliver context-aware answers synthesized from vast legal databases, empowering both legal professionals and citizens navigating the Indian justice system.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-16 px-6 lg:px-8 bg-black text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="text-3xl md:text-5xl font-bold mb-4"
          >
            Get SamvidhanAI for free,<br />Boost your productivity today
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-sm text-white/60 mb-8"
          >
            Start accessing India's comprehensive legal intelligence platform. Query in English or Hindi, compare IPC and BNS provisions, and research with verified citations.
          </motion.p>
          <motion.button
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.3 }}
            className="px-7 py-3 bg-white text-black text-sm font-medium hover:bg-white/90 transition-all cursor-pointer rounded"
            onClick={() => router.push('/auth/register')}
          >
            Sign Up
          </motion.button>
        </div>
      </section>

      <footer className="border-t border-black/10 py-12 px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-1">
              <div className="flex items-center space-x-2 mb-3">
                <Scale className="w-6 h-6" />
                <span className="text-lg font-semibold">SamvidhanAI</span>
              </div>
              <p className="text-xs text-black/50">© 2025. All rights reserved.</p>
            </div>

            <div>
              <h3 className="font-semibold text-sm mb-3">Product</h3>
              <ul className="space-y-2 text-xs text-black/60">
                <li className="hover:text-black transition-colors cursor-pointer">Features</li>
                <li className="hover:text-black transition-colors cursor-pointer">Documentation</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-sm mb-3">Resources</h3>
              <ul className="space-y-2 text-xs text-black/60">
                <li className="hover:text-black transition-colors cursor-pointer">Privacy Policy</li>
                <li className="hover:text-black transition-colors cursor-pointer">Terms of Service</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-sm mb-3">Connect</h3>
              <ul className="space-y-2 text-xs text-black/60">
                <li className="hover:text-black transition-colors cursor-pointer">Twitter</li>
                <li className="hover:text-black transition-colors cursor-pointer">GitHub</li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </motion.div>
  );
};

export default LandingPage;