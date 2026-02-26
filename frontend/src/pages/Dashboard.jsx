import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    User, PenTool, Languages, Smile, Brain,
    Target, PieChart, Braces, ShoppingCart,
    ArrowRight, Sparkles, Activity
} from 'lucide-react';

const services = [
    { path: '/gender', label: 'Gender Discovery', desc: 'Vision Transformer for high-precision gender classification from facial images.', icon: User, gradient: 'from-pink-500 to-rose-500', glow: 'shadow-pink-500/20' },
    { path: '/textgen', label: 'Text Synthesis', desc: 'Creative language generation powered by GPT-2 neural architecture.', icon: PenTool, gradient: 'from-cyan-500 to-blue-500', glow: 'shadow-cyan-500/20' },
    { path: '/translate', label: 'Neural Translate', desc: 'Advanced English → Urdu translation using sequence-to-sequence models.', icon: Languages, gradient: 'from-emerald-500 to-teal-500', glow: 'shadow-emerald-500/20' },
    { path: '/sentiment', label: 'Empathy Engine', desc: 'Analyze emotional valence and sentiment in text and vocal inputs.', icon: Smile, gradient: 'from-amber-500 to-orange-500', glow: 'shadow-amber-500/20' },
    { path: '/qa', label: 'Cognitive QA', desc: 'Extract precise answers from context documents with DistilBERT.', icon: Brain, gradient: 'from-violet-500 to-purple-500', glow: 'shadow-violet-500/20' },
    { path: '/zsl', label: 'Zero-Shot Lab', desc: 'BART-based classification for any unseen categories without training.', icon: Target, gradient: 'from-red-500 to-pink-500', glow: 'shadow-red-500/20' },
    { path: '/clustering', label: 'Data Clusters', desc: 'Automated pattern discovery using K-Means unsupervised clustering.', icon: PieChart, gradient: 'from-sky-500 to-indigo-500', glow: 'shadow-sky-500/20' },
    { path: '/dbscan', label: 'DBSCAN Lab', desc: 'Density-based spatial clustering for complex patterns and outliers.', icon: Braces, gradient: 'from-lime-500 to-emerald-500', glow: 'shadow-lime-500/20' },
    { path: '/apriori', label: 'Market Analytics', desc: 'Generate association rules from transactional data with Apriori algorithm.', icon: ShoppingCart, gradient: 'from-fuchsia-500 to-violet-500', glow: 'shadow-fuchsia-500/20' },
];

const stats = [
    { label: 'AI Models', value: '9', icon: Sparkles, color: 'text-cyan-400' },
    { label: 'NLP Engines', value: '5', icon: Brain, color: 'text-purple-400' },
    { label: 'ML Pipelines', value: '3', icon: Activity, color: 'text-emerald-400' },
];

const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.05, delayChildren: 0.15 } }
};

const item = {
    hidden: { opacity: 0, y: 24, scale: 0.96 },
    show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: [0.4, 0, 0.2, 1] } }
};

export default function Dashboard() {
    return (
        <div>
            {/* Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-10"
            >
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 grid place-items-center">
                        <Sparkles size={18} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight underline decoration-cyan-500/30 underline-offset-8">A.M.L Project</h1>
                    </div>
                </div>
                <p className="text-slate-400 text-sm sm:text-base max-w-lg leading-relaxed">
                    Select a specialized AI engine to begin processing. Each service is powered by state-of-the-art deep learning models.
                </p>
            </motion.div>

            {/* Stats Bar */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-3 gap-3 sm:gap-4 mb-8"
            >
                {stats.map((s, i) => (
                    <div key={i} className="glass-card stat-glow p-4 sm:p-5 text-center group cursor-default">
                        <s.icon size={20} className={`${s.color} mx-auto mb-2 group-hover:scale-110 transition-transform`} />
                        <p className="text-xl sm:text-2xl font-black">{s.value}</p>
                        <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider mt-1">{s.label}</p>
                    </div>
                ))}
            </motion.div>

            {/* Service Cards Grid */}
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5"
            >
                {services.map((s) => (
                    <motion.div key={s.path} variants={item}>
                        <Link
                            to={s.path}
                            className="glass-card p-6 flex flex-col gap-4 group block hover:translate-y-[-6px] transition-all duration-300"
                        >
                            {/* Icon */}
                            <div className="flex items-center justify-between">
                                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${s.gradient} grid place-items-center shadow-lg ${s.glow} opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300`}>
                                    <s.icon size={20} className="text-white" />
                                </div>
                                <ArrowRight size={16} className="text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all duration-300" />
                            </div>

                            {/* Content */}
                            <div className="flex-1">
                                <h3 className="text-base font-bold mb-1.5 group-hover:text-cyan-300 transition-colors">{s.label}</h3>
                                <p className="text-[13px] text-slate-500 leading-relaxed">{s.desc}</p>
                            </div>

                            {/* Footer */}
                            <div className="pt-3 border-t border-white/[0.05]">
                                <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-cyan-500/70 group-hover:text-cyan-400 transition-colors">
                                    Launch Engine
                                </span>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
}
