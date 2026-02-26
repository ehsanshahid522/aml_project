import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, User, PenTool, Languages, Smile, Brain,
    Target, PieChart, Braces, ShoppingCart, Menu, X
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
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                        onClick={onClose}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside className={`
        fixed top-0 left-0 h-screen w-[280px] z-50
        bg-[#0a0f1c] border-r border-white/8
        flex flex-col p-6 gap-6
        transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
        lg:translate-x-0 lg:static
        ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}>
                {/* Brand */}
                <div className="flex items-center gap-3 px-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-500 grid place-items-center font-extrabold text-white text-sm">
                        AI
                    </div>
                    <span className="text-lg font-bold tracking-tight">Quantum Hub</span>
                    <button onClick={onClose} className="lg:hidden ml-auto p-1 hover:bg-white/5 rounded-lg">
                        <X size={20} />
                    </button>
                </div>

                {/* Nav */}
                <nav className="flex flex-col gap-1 flex-1 overflow-y-auto">
                    {navItems.map(({ path, label, icon: Icon }) => (
                        <NavLink
                            key={path}
                            to={path}
                            onClick={onClose}
                            className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                transition-all duration-200
                ${isActive
                                    ? 'bg-cyan-500/10 text-cyan-400'
                                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                                }
              `}
                        >
                            <Icon size={18} />
                            <span>{label}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* Footer */}
                <div className="px-3 py-3 rounded-xl bg-white/3 border border-white/5 text-center">
                    <p className="text-xs text-slate-500">Powered by</p>
                    <p className="text-xs font-semibold gradient-text">Quantum AI Engine</p>
                </div>
            </aside>
        </>
    );
}
