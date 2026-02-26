import { useState } from 'react';
import axios from 'axios';
import { Languages, Copy, Check, ArrowRight } from 'lucide-react';
import { PageHeader, ResultBox, ErrorBox, SubmitButton, SectionLabel } from '../components/UI';

export default function NeuralTranslate() {
    const [text, setText] = useState('');
    const [result, setResult] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!text.trim()) return;
        setLoading(true); setError(''); setResult('');
        try {
            const res = await axios.post('/api/translate', { text });
            setResult(res.data.translated_text);
        } catch (err) {
            setError(err.response?.data?.error || 'Request failed');
        } finally { setLoading(false); }
    };

    const copyText = () => {
        navigator.clipboard.writeText(result);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="max-w-2xl mx-auto">
            <PageHeader icon={Languages} title="Neural Translate" subtitle="Advanced English → Urdu translation using sequence-to-sequence models." />

            <form onSubmit={handleSubmit} className="glass-card p-6 sm:p-8 space-y-6">
                <div>
                    <div className="flex items-center gap-2 mb-2.5">
                        <span className="text-xs font-bold bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-lg">English</span>
                        <ArrowRight size={14} className="text-slate-600" />
                        <span className="text-xs font-bold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-lg">Urdu</span>
                    </div>
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Type or paste English text here..."
                        className="quantum-input min-h-[150px] resize-y"
                    />
                </div>
                <SubmitButton loading={loading}>
                    <Languages size={18} /> Translate
                </SubmitButton>
            </form>

            <ErrorBox message={error} />

            {result && (
                <ResultBox>
                    <div className="flex items-center justify-between mb-4">
                        <SectionLabel>Urdu Translation</SectionLabel>
                        <button
                            onClick={copyText}
                            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-slate-400 hover:text-white hover:border-white/10 transition-all"
                        >
                            {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                            {copied ? 'Copied!' : 'Copy'}
                        </button>
                    </div>
                    <p className="text-xl text-slate-200 leading-loose font-medium text-right" dir="rtl">{result}</p>
                </ResultBox>
            )}
        </div>
    );
}
