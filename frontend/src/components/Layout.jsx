import { useState } from 'react';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Layout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <main className="flex-1 min-h-screen">
                {/* Top bar */}
                <header className="flex items-center gap-4 px-4 sm:px-8 py-4 lg:py-6">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden p-2 hover:bg-white/5 rounded-xl transition-colors"
                    >
                        <Menu size={22} />
                    </button>
                    <div className="flex-1" />
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                        <span className="text-xs font-semibold text-emerald-400">Online</span>
                    </div>
                </header>

                {/* Content */}
                <motion.div
                    key={location.pathname}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                    className="px-4 sm:px-8 pb-8"
                >
                    {children}
                </motion.div>
            </main>
        </div>
    );
}
