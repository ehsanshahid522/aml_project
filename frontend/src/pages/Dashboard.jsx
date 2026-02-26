import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    User, PenTool, Languages, Smile, Brain,
    Target, PieChart, Braces, ShoppingCart
} from 'lucide-react';
import { PageHeader } from '../components/UI';

const services = [
    { path: '/gender', label: 'Gender Discovery', desc: 'Vision Transformer for high-precision gender classification.', icon: User, color: 'from-pink-500 to-rose-500' },
    { path: '/textgen', label: 'Text Synthesis', desc: 'Creative language generation powered by GPT-2 architecture.', icon: PenTool, color: 'from-cyan-500 to-blue-500' },
    { path: '/translate', label: 'Neural Translate', desc: 'Advanced English-to-Urdu translation using sequence models.', icon: Languages, color: 'from-emerald-500 to-teal-500' },
    { path: '/sentiment', label: 'Empathy Engine', desc: 'Analyze emotional valence in text and vocal inputs.', icon: Smile, color: 'from-amber-500 to-orange-500' },
    { path: '/qa', label: 'Cognitive QA', desc: 'Extract precise knowledge from context with DistilBERT.', icon: Brain, color: 'from-violet-500 to-purple-500' },
    { path: '/zsl', label: 'Zero-Shot Lab', desc: 'BART-based classification for any unseen categories.', icon: Target, color: 'from-red-500 to-pink-500' },
    { path: '/clustering', label: 'Data Clusters', desc: 'Automated pattern discovery using K-Means clustering.', icon: PieChart, color: 'from-sky-500 to-indigo-500' },
    { path: '/dbscan', label: 'DBSCAN Lab', desc: 'Density-based clustering for complex patterns and outliers.', icon: Braces, color: 'from-lime-500 to-emerald-500' },
    { path: '/apriori', label: 'Market Analytics', desc: 'Generate association rules from transactional data.', icon: ShoppingCart, color: 'from-fuchsia-500 to-violet-500' },
];

const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.06 } }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export default function Dashboard() {
    return (
        <div>
            <PageHeader title="Quantum Analytics" subtitle="Select a specialized AI engine to begin processing." />

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
                            className="glass-card p-6 flex flex-col gap-4 group hover:translate-y-[-6px] block"
                        >
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} grid place-items-center opacity-80 group-hover:opacity-100 transition-all group-hover:scale-110`}>
                                <s.icon size={22} className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold mb-1">{s.label}</h3>
                                <p className="text-sm text-slate-400 leading-relaxed">{s.desc}</p>
                            </div>
                            <div className="mt-auto pt-2">
                                <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 group-hover:underline">
                                    Launch Engine →
                                </span>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
}
