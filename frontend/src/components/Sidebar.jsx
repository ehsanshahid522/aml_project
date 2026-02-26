import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, User, PenTool, Languages, Smile, Brain,
    Target, PieChart, Braces, ShoppingCart, X, Sparkles
} from 'lucide-react';

const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/gender', label: 'Gender Discovery', icon: User },
    { path: '/textgen', label: 'Text Synthesis', icon: PenTool },
    { path: '/translate', label: 'Neural Translate', icon: Languages },
    { path: '/sentiment', label: 'Empathy Engine', icon: Smile },
    { path: '/qa', label: 'Cognitive QA', icon: Brain },
    { path: '/zsl', label: 'Zero-Shot Lab', icon: Target },
    { path: '/clustering', label: 'Data Clusters', icon: PieChart },
    { path: '/dbscan', label: 'DBSCAN Lab', icon: Braces },
    { path: '/apriori', label: 'Association Rules', icon: ShoppingCart },
];

export default function Sidebar({ isOpen, onClose }) {
    return (
        <>
            {/* Mobile overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 backdrop-blur-md z-40 lg:hidden"
                        onClick={onClose}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside className={`
        fixed top-0 left-0 h-screen w-[280px] z-50
        bg-[#060a15]/95 backdrop-blur-xl
        border-r border-white/[0.06]
        flex flex-col py-6 px-4 gap-4
        transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
        lg:translate-x-0 lg:static
        ${isOpen ? 'translate-x-0 shadow-[4px_0_40px_rgba(0,0,0,0.5)]' : '-translate-x-full'}
      `}>
                {/* Brand */}
                <div className="flex items-center gap-3 px-3 mb-2">
                    <div className="relative">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 grid place-items-center font-black text-white text-sm shadow-lg shadow-cyan-500/20">
                            AI
                        </div>
                        <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#060a15] animate-pulse" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-base font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">A.M.L Project</span>
                        <span className="text-[10px] text-cyan-500/80 font-semibold uppercase tracking-widest">AI Platform</span>
                    </div>
                    <button onClick={onClose} className="lg:hidden ml-auto p-1.5 hover:bg-white/5 rounded-xl transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mx-2" />

                {/* Label */}
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 px-4 mt-1">Services</p>

                {/* Nav */}
                <nav className="flex flex-col gap-0.5 flex-1 overflow-y-auto px-1">
                    {navItems.map(({ path, label, icon: Icon }) => (
                        <NavLink
                            key={path}
                            to={path}
                            onClick={onClose}
                            className={({ isActive }) => `
                flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-medium
                transition-all duration-200 group relative
                ${isActive
                                    ? 'bg-gradient-to-r from-cyan-500/10 to-purple-500/5 text-cyan-400 shadow-sm shadow-cyan-500/5'
                                    : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
                                }
              `}
                        >
                            {({ isActive }) => (
                                <>
                                    {isActive && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-gradient-to-b from-cyan-400 to-purple-500 rounded-full" />
                                    )}
                                    <Icon size={16} className={`transition-transform duration-200 ${isActive ? '' : 'group-hover:scale-110'}`} />
                                    <span>{label}</span>
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Footer */}
                <div className="mx-2 p-4 rounded-2xl bg-gradient-to-br from-cyan-500/[0.07] to-purple-500/[0.04] border border-white/[0.05]">
                    <div className="flex items-center gap-2 mb-1">
                        <Sparkles size={14} className="text-cyan-400" />
                        <p className="text-[11px] font-bold text-cyan-400">Pro Features</p>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">9 AI engines ready to process your data.</p>
                </div>
            </aside>
        </>
    );
}
