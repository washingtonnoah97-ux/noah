/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Terminal, 
  Link as LinkIcon, 
  Copy, 
  Check, 
  Zap, 
  Github, 
  FileCode, 
  ExternalLink,
  Info,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types & Constants ---

type SupportedSite = 
  | 'Pastebin' 
  | 'GitHub' 
  | 'Gist' 
  | 'Pastefy' 
  | 'Ghostbin' 
  | 'Catbox' 
  | 'Control-C' 
  | 'Rclua' 
  | 'Luarmor' 
  | 'Rentry'
  | 'Unknown';

interface SiteTemplate {
  name: SupportedSite;
  url: string;
}

const SUPPORTED_SITES: SiteTemplate[] = [
  { name: 'Pastebin', url: 'https://pastebin.com/' },
  { name: 'GitHub', url: 'https://github.com/' },
  { name: 'Gist', url: 'https://gist.github.com/' },
  { name: 'Pastefy', url: 'https://pastefy.app/' },
  { name: 'Ghostbin', url: 'https://ghostbin.com/' },
  { name: 'Catbox', url: 'https://catbox.moe/' },
  { name: 'Control-C', url: 'https://controlc.com/' },
  { name: 'Rentry', url: 'https://rentry.co/' },
];

// --- Utility Functions ---

const convertToRaw = (url: string): { rawUrl: string; site: SupportedSite } => {
  const trimmedUrl = url.trim();
  if (!trimmedUrl) return { rawUrl: '', site: 'Unknown' };

  try {
    const urlObj = new URL(trimmedUrl);
    const host = urlObj.hostname.toLowerCase();
    const path = urlObj.pathname;

    // GitHub
    if (host.includes('github.com') && !host.includes('gist')) {
      if (path.includes('/blob/')) {
        const rawPath = path.replace('/blob/', '/');
        return { 
          rawUrl: `https://raw.githubusercontent.com${rawPath}`, 
          site: 'GitHub' 
        };
      }
      return { rawUrl: trimmedUrl, site: 'GitHub' };
    }

    // GitHub Gist
    if (host.includes('gist.github.com')) {
      if (!path.endsWith('/raw')) {
        return { rawUrl: `${trimmedUrl}/raw`, site: 'Gist' };
      }
      return { rawUrl: trimmedUrl, site: 'Gist' };
    }

    // Pastebin
    if (host.includes('pastebin.com')) {
      const id = path.split('/').pop();
      if (id && !path.includes('/raw/')) {
        return { rawUrl: `https://pastebin.com/raw/${id}`, site: 'Pastebin' };
      }
      return { rawUrl: trimmedUrl, site: 'Pastebin' };
    }

    // Pastefy
    if (host.includes('pastefy.app')) {
      const id = path.split('/').pop();
      if (id && !path.includes('/raw')) {
        return { rawUrl: `https://pastefy.app/${id}/raw`, site: 'Pastefy' };
      }
      return { rawUrl: trimmedUrl, site: 'Pastefy' };
    }

    // Luarmor
    if (host.includes('luarmor.net')) {
      return { rawUrl: trimmedUrl, site: 'Luarmor' };
    }

    // Rentry
    if (host.includes('rentry.co') || host.includes('rentry.org')) {
      if (!path.includes('/raw')) {
        return { rawUrl: `${trimmedUrl}/raw`, site: 'Rentry' };
      }
      return { rawUrl: trimmedUrl, site: 'Rentry' };
    }

    return { rawUrl: trimmedUrl, site: 'Unknown' };
  } catch (e) {
    return { rawUrl: trimmedUrl, site: 'Unknown' };
  }
};

const wrapScript = (rawUrl: string) => {
  if (!rawUrl) return '';
  return `loadstring(game:HttpGet("${rawUrl}"))()`;
};

// --- Components ---

export default function App() {
  const [inputUrl, setInputUrl] = useState('');
  const [rawUrl, setRawUrl] = useState('');
  const [detectedSite, setDetectedSite] = useState<SupportedSite>('Unknown');
  const [generatedScript, setGeneratedScript] = useState('');
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const processInput = () => {
      if (!inputUrl) {
        setRawUrl('');
        setDetectedSite('Unknown');
        setGeneratedScript('');
        return;
      }

      setIsProcessing(true);
      const { rawUrl: converted, site } = convertToRaw(inputUrl);
      setRawUrl(converted);
      setDetectedSite(site);
      setGeneratedScript(wrapScript(converted));
      setIsProcessing(false);
    };

    const timer = setTimeout(processInput, 300);
    return () => clearTimeout(timer);
  }, [inputUrl]);

  const handleCopy = () => {
    if (!generatedScript) return;
    navigator.clipboard.writeText(generatedScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-zinc-300 font-sans selection:bg-purple-500/30 selection:text-purple-200">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-900/10 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
      </div>

      <main className="relative z-10 max-w-4xl mx-auto px-6 py-12 md:py-20">
        {/* Header */}
        <header className="mb-12 text-center md:text-left">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-mono uppercase tracking-widest mb-4"
          >
            <Zap size={12} className="fill-current" />
            Script Fetcher Engine
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold text-white tracking-tighter mb-4"
          >
            NIGHT <span className="text-purple-500">HUB</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-zinc-500 max-w-xl"
          >
            A minimalist utility for Luau developers. Convert any script link from GitHub, Pastebin, Pastefy, or Luarmor into a functional loadstring command instantly.
          </motion.p>
        </header>

        {/* Input Section */}
        <section className="mb-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-[#121216] border border-zinc-800/50 rounded-2xl p-1 shadow-2xl shadow-black/50"
          >
            <div className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-600 group-focus-within:text-purple-500 transition-colors">
                <LinkIcon size={20} />
              </div>
              <input 
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="Paste your script link here (GitHub, Pastebin, etc.)"
                className="w-full bg-transparent border-none py-6 pl-12 pr-4 text-white placeholder:text-zinc-700 focus:ring-0 text-lg transition-all"
              />
              {isProcessing && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <RefreshCw size={20} className="text-purple-500 animate-spin" />
                </div>
              )}
            </div>
          </motion.div>
        </section>

        {/* Output Section */}
        <AnimatePresence mode="wait">
          {generatedScript ? (
            <motion.section
              key="output"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Info Bar */}
              <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/80 border border-zinc-800 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                  <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">
                    Detected: <span className="text-purple-400">{detectedSite}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-zinc-600 font-mono">
                  <Terminal size={12} />
                  LUAU COMPILER V3.0
                </div>
              </div>

              {/* Code Block */}
              <div className="relative group">
                <div className="absolute -inset-[1px] bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-2xl blur-sm opacity-50 group-hover:opacity-100 transition-opacity" />
                <div className="relative bg-[#0d0d11] border border-zinc-800 rounded-2xl overflow-hidden">
                  {/* Code Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/50 bg-zinc-900/30">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
                      <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
                      <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
                    </div>
                    <button 
                      onClick={handleCopy}
                      className={`flex items-center gap-2 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                        copied 
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                        : 'bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20'
                      }`}
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                      {copied ? 'Copied!' : 'Copy Script'}
                    </button>
                  </div>

                  {/* Code Content */}
                  <div className="p-6 overflow-x-auto custom-scrollbar">
                    <pre className="font-mono text-sm leading-relaxed">
                      {generatedScript.split('\n').map((line, i) => (
                        <div key={i} className="flex gap-4">
                          <span className="text-zinc-700 select-none w-4 text-right">{i + 1}</span>
                          <span className={
                            line.startsWith('--') ? 'text-zinc-600 italic' :
                            line.includes('"') ? 'text-purple-300' :
                            line.includes('print') ? 'text-indigo-400' :
                            line.includes('loadstring') ? 'text-purple-500 font-bold' :
                            'text-zinc-300'
                          }>
                            {line}
                          </span>
                        </div>
                      ))}
                    </pre>
                  </div>
                </div>
              </div>

              {/* Raw URL Info */}
              <div className="flex items-start gap-3 p-4 bg-purple-500/5 border border-purple-500/10 rounded-xl">
                <Info size={18} className="text-purple-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-medium text-purple-200">Raw URL Extracted</p>
                  <p className="text-[10px] font-mono text-purple-400/60 break-all">{rawUrl}</p>
                </div>
              </div>
            </motion.section>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 text-center space-y-4"
            >
              <div className="w-16 h-16 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-700">
                <Terminal size={32} />
              </div>
              <div className="space-y-1">
                <h3 className="text-zinc-400 font-medium">Waiting for Input</h3>
                <p className="text-zinc-600 text-sm max-w-xs mx-auto">
                  Enter a script URL above to generate your loadstring command.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Info */}
        <footer className="mt-20 pt-8 border-t border-zinc-900 flex flex-col md:flex-row items-center justify-between gap-6 text-zinc-600 text-xs font-mono uppercase tracking-widest">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5"><Zap size={12} className="text-purple-500" /> Fast</span>
            <span className="flex items-center gap-1.5"><Zap size={12} className="text-purple-500" /> Secure</span>
            <span className="flex items-center gap-1.5"><Zap size={12} className="text-purple-500" /> Universal</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-purple-500 transition-colors">Documentation</a>
            <a href="https://discord.gg/MQMBu8N3EE" target="_blank" rel="noopener noreferrer" className="hover:text-purple-500 transition-colors">Discord</a>
            <a href="#" className="hover:text-purple-500 transition-colors">GitHub</a>
          </div>
        </footer>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e1e24;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #2a2a32;
        }
      `}} />
    </div>
  );
}
