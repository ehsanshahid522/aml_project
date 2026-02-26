import { useState } from 'react';
import axios from 'axios';
import { Smile, Frown, Meh, Mic, HeartPulse } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageHeader, ResultBox, ErrorBox, SubmitButton, UploadZone, SectionLabel } from '../components/UI';

export default function EmpathyEngine() {
    const [tab, setTab] = useState('text');
    const [text, setText] = useState('');
    const [file, setFile] = useState(null);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setError(''); setResult(null);
        try {
            let res;
            if (tab === 'text') {
                res = await axios.post('/api/sentiment', { text });
            } else {
                const fd = new FormData();
                fd.append('voice', file);
                res = await axios.post('/api/sentiment', fd);
            }
            setResult(res.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Request failed');
        } finally { setLoading(false); }
    };

    const sentimentConfig = (label) => {
        const l = (label || '').toLowerCase();
        if (l === 'positive') return { icon: Smile, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' };
        if (l === 'negative') return { icon: Frown, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' };
        return { icon: Meh, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' };
    };

    return (
        <div className="max-w-2xl mx-auto">
            <PageHeader icon={HeartPulse} title="Empathy Engine" subtitle="Contextual sentiment analysis for text and vocal recordings." />

            <form onSubmit={handleSubmit} className="glass-card p-6 sm:p-8 space-y-6">
                {/* Tabs */}
                <div className="flex gap-1 p-1 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
                    {['text', 'voice'].map(t => (
                        <button
                            key={t}
                            type="button"
                            onClick={() => setTab(t)}
                            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === t
                                    ? 'bg-gradient-to-r from-cyan-500/15 to-purple-500/10 text-cyan-400 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-300'
                                }`}
                        >
                            {t === 'text' ? '📝 Text Analysis' : '🎙 Vocal Analysis'}
                        </button>
                    ))}
                </div>

                {tab === 'text' ? (
                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2.5">Input Text</label>
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Explain how you're feeling..."
                            className="quantum-input min-h-[140px] resize-y"
                        />
                    </div>
                ) : (
                    <UploadZone accept="audio/*" onChange={(e) => setFile(e.target.files[0])} label="Upload Voice Recording" sublabel="WAV or MP3 format" />
                )}

                <SubmitButton loading={loading}>
                    <HeartPulse size={18} /> Analyze Sentiment
                </SubmitButton>
            </form>

            <ErrorBox message={error} />

            {result && (() => {
                const cfg = sentimentConfig(result.result);
                const Icon = cfg.icon;
                return (
                    <ResultBox>
                        <SectionLabel>Engine Output</SectionLabel>

                        {result.transcript && (
                            <div className="mb-5 p-4 rounded-2xl bg-black/20 border border-white/[0.05]">
                                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">Transcription</span>
                                <p className="mt-1.5 text-slate-300 text-sm leading-relaxed">"{result.transcript}"</p>
                            </div>
                        )}

                        <div className={`flex items-center gap-6 p-5 rounded-2xl ${cfg.bg} border ${cfg.border}`}>
                            <div className="flex-1">
                                <span className="text-xs text-slate-400 font-medium">Detected Sentiment</span>
                                <motion.p
                                    initial={{ scale: 0.5 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 200 }}
                                    className={`text-3xl font-black capitalize ${cfg.color}`}
                                >
                                    {result.result}
                                </motion.p>
                                <div className="mt-2 flex items-center gap-2">
                                    <div className="h-1.5 flex-1 bg-black/20 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${result.score}%` }}
                                            transition={{ duration: 1, delay: 0.3 }}
                                            className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"
                                        />
                                    </div>
                                    <span className="text-xs text-slate-400 font-semibold">{result.score}%</span>
                                </div>
                            </div>
                            <motion.div
                                initial={{ rotate: -20, scale: 0 }}
                                animate={{ rotate: 0, scale: 1 }}
                                transition={{ type: 'spring', delay: 0.2 }}
                            >
                                <Icon size={52} className={cfg.color} />
                            </motion.div>
                        </div>
                    </ResultBox>
                );
            })()}
        </div>
    );
}
