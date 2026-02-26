import { useState } from 'react';
import axios from 'axios';
import { Target, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageHeader, ResultBox, ErrorBox, SubmitButton, SectionLabel } from '../components/UI';

export default function ZeroShotLab() {
    const [text, setText] = useState('');
    const [labels, setLabels] = useState('');
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!text.trim() || !labels.trim()) return;
        setLoading(true); setError(''); setResult(null);
        try {
            const res = await axios.post('/api/zsl', { text, labels });
            setResult(res.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Request failed');
        } finally { setLoading(false); }
    };

    const barColors = [
        'from-cyan-500 to-blue-500',
        'from-purple-500 to-pink-500',
        'from-emerald-500 to-teal-500',
        'from-amber-500 to-orange-500',
        'from-red-500 to-rose-500',
    ];

    return (
        <div className="max-w-2xl mx-auto">
            <PageHeader icon={Target} title="Zero-Shot Lab" subtitle="BART-based classification for any unseen categories without fine-tuning." />

            <form onSubmit={handleSubmit} className="glass-card p-6 sm:p-8 space-y-6">
                <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2.5">Input Text</label>
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Enter text to classify..."
                        className="quantum-input min-h-[120px] resize-y"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2.5">Candidate Labels</label>
                    <input
                        type="text"
                        value={labels}
                        onChange={(e) => setLabels(e.target.value)}
                        placeholder="politics, sports, technology, health..."
                        className="quantum-input"
                        required
                    />
                    <p className="text-xs text-slate-500 mt-1.5">Separate labels with commas</p>
                </div>
                <SubmitButton loading={loading}>
                    <Target size={18} /> Classify Text
                </SubmitButton>
            </form>

            <ErrorBox message={error} />

            {result && (
                <ResultBox>
                    <SectionLabel>Classification Results</SectionLabel>

                    <div className="mb-5 p-5 rounded-2xl bg-gradient-to-br from-cyan-500/[0.08] to-purple-500/[0.04] border border-cyan-500/10 text-center">
                        <span className="text-xs text-slate-400 font-medium">Best Match</span>
                        <motion.p
                            initial={{ scale: 0.5 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 200 }}
                            className="text-2xl font-black gradient-text mt-1"
                        >
                            {result.best_label}
                        </motion.p>
                        <span className="text-sm text-slate-500">{result.best_score}% confidence</span>
                    </div>

                    <div className="space-y-3">
                        {result.results?.map((r, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="flex items-center gap-3"
                            >
                                <span className="text-sm text-slate-300 w-28 truncate capitalize font-medium">{r.label}</span>
                                <div className="flex-1 h-3 bg-white/[0.04] rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${r.score}%` }}
                                        transition={{ duration: 0.8, delay: 0.3 + i * 0.1 }}
                                        className={`h-full bg-gradient-to-r ${barColors[i % barColors.length]} rounded-full`}
                                    />
                                </div>
                                <span className="text-xs text-slate-400 w-14 text-right font-semibold">{r.score}%</span>
                            </motion.div>
                        ))}
                    </div>
                </ResultBox>
            )}
        </div>
    );
}
