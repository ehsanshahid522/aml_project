import { useState } from 'react';
import axios from 'axios';
import { Smile, Frown, Meh, Mic } from 'lucide-react';
import { PageHeader, ResultBox, ErrorBox, SubmitButton, UploadZone } from '../components/UI';

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

    const sentimentIcon = (label) => {
        const l = (label || '').toLowerCase();
        if (l === 'positive') return <Smile size={48} className="text-emerald-400" />;
        if (l === 'negative') return <Frown size={48} className="text-red-400" />;
        return <Meh size={48} className="text-cyan-400" />;
    };

    const sentimentColor = (label) => {
        const l = (label || '').toLowerCase();
        if (l === 'positive') return 'text-emerald-400';
        if (l === 'negative') return 'text-red-400';
        return 'text-cyan-400';
    };

    return (
        <div className="max-w-2xl mx-auto">
            <PageHeader title="Empathy Engine" subtitle="Contextual sentiment analysis for text and vocal recordings." />

            <form onSubmit={handleSubmit} className="glass-card p-6 sm:p-8 space-y-5">
                {/* Tabs */}
                <div className="flex gap-2 border-b border-white/10 pb-3">
                    {['text', 'voice'].map(t => (
                        <button
                            key={t}
                            type="button"
                            onClick={() => setTab(t)}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${tab === t ? 'bg-cyan-500/10 text-cyan-400' : 'text-slate-400 hover:bg-white/5'
                                }`}
                        >
                            {t === 'text' ? 'Text Analysis' : 'Vocal Analysis'}
                        </button>
                    ))}
                </div>

                {tab === 'text' ? (
                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">Input Text</label>
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Explain how you're feeling..."
                            className="quantum-input min-h-[140px] resize-y"
                        />
                    </div>
                ) : (
                    <div>
                        <UploadZone accept="audio/*" onChange={(e) => setFile(e.target.files[0])} label="Upload Voice Recording" sublabel="WAV or MP3 format" />
                        {file && <p className="text-sm text-cyan-400 text-center mt-2 font-medium">🎙 {file.name}</p>}
                    </div>
                )}

                <SubmitButton loading={loading}>
                    <Mic size={18} /> Analyze Sentiment
                </SubmitButton>
            </form>

            <ErrorBox message={error} />

            {result && (
                <ResultBox>
                    <p className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-4">Engine Output</p>
                    {result.transcript && (
                        <div className="mb-4 p-3 rounded-xl bg-black/20 text-sm">
                            <span className="text-xs font-bold text-cyan-400 uppercase">Transcription</span>
                            <p className="mt-1 text-slate-300">"{result.transcript}"</p>
                        </div>
                    )}
                    <div className="flex items-center gap-6 p-4 rounded-xl bg-white/3">
                        <div className="flex-1">
                            <span className="text-sm text-slate-400">Detected Sentiment</span>
                            <p className={`text-3xl font-extrabold capitalize ${sentimentColor(result.result)}`}>
                                {result.result}
                            </p>
                            <span className="text-sm text-slate-500">{result.score}% confidence</span>
                        </div>
                        {sentimentIcon(result.result)}
                    </div>
                </ResultBox>
            )}
        </div>
    );
}
