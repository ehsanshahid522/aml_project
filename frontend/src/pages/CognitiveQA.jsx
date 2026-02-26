import { useState } from 'react';
import axios from 'axios';
import { Brain, Volume2, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageHeader, ResultBox, ErrorBox, SubmitButton, UploadZone, SectionLabel } from '../components/UI';

export default function CognitiveQA() {
    const [tab, setTab] = useState('text');
    const [context, setContext] = useState('');
    const [question, setQuestion] = useState('');
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
                res = await axios.post('/api/qa', { context, question });
            } else {
                const fd = new FormData();
                fd.append('context', context);
                fd.append('voice', file);
                res = await axios.post('/api/qa', fd);
            }
            setResult(res.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Request failed');
        } finally { setLoading(false); }
    };

    const playAudio = () => {
        if (result?.audio_url) {
            const audio = new Audio(result.audio_url + '?v=' + Date.now());
            audio.play();
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <PageHeader icon={Brain} title="Cognitive QA" subtitle="Knowledge extraction engine with vocal synthesis output using DistilBERT." />

            <form onSubmit={handleSubmit} className="glass-card p-6 sm:p-8 space-y-6">
                <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2.5">Context Repository</label>
                    <textarea
                        value={context}
                        onChange={(e) => setContext(e.target.value)}
                        placeholder="Paste the reference document here..."
                        className="quantum-input min-h-[180px] resize-y"
                        required
                    />
                </div>

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
                            {t === 'text' ? '⌨️ Type Question' : '🎙 Voice Question'}
                        </button>
                    ))}
                </div>

                {tab === 'text' ? (
                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2.5">Query Expression</label>
                        <div className="relative">
                            <MessageSquare size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-500/60" />
                            <input
                                type="text"
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                placeholder="Ask a question about the context..."
                                className="quantum-input pl-11"
                            />
                        </div>
                    </div>
                ) : (
                    <UploadZone accept="audio/*" onChange={(e) => setFile(e.target.files[0])} label="Record Your Query" sublabel="Upload audio for voice-to-voice QA" />
                )}

                <SubmitButton loading={loading}>
                    <Brain size={18} /> Execute Reasoning
                </SubmitButton>
            </form>

            <ErrorBox message={error} />

            {result && (
                <ResultBox>
                    <SectionLabel>Reasoning Output</SectionLabel>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 rounded-2xl bg-black/20 border-l-4 border-cyan-400">
                        <div className="flex-1">
                            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">Extracted Answer</span>
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="text-lg sm:text-xl font-bold text-slate-100 mt-2 leading-relaxed"
                            >
                                {result.answer}
                            </motion.p>
                        </div>
                        {result.audio_url && (
                            <motion.button
                                type="button"
                                onClick={playAudio}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 grid place-items-center text-white shadow-lg shadow-cyan-500/20 flex-shrink-0"
                            >
                                <Volume2 size={22} />
                            </motion.button>
                        )}
                    </div>

                    {result.score > 0 && (
                        <div className="mt-5">
                            <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${result.score}%` }}
                                    transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
                                    className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full shadow-sm shadow-cyan-500/30"
                                />
                            </div>
                            <div className="flex justify-between text-xs text-slate-500 mt-1.5 font-medium">
                                <span>Confidence Score</span>
                                <span className="text-cyan-400">{result.score}%</span>
                            </div>
                        </div>
                    )}
                </ResultBox>
            )}
        </div>
    );
}
