import { useState } from 'react';
import axios from 'axios';
import { Languages, Copy, Check } from 'lucide-react';
import { PageHeader, ResultBox, ErrorBox, SubmitButton } from '../components/UI';

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
            <PageHeader title="Neural Translate" subtitle="Advanced English-to-Urdu translation using sequence models." />

            <form onSubmit={handleSubmit} className="glass-card p-6 sm:p-8 space-y-5">
                <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">English Text</label>
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Type or paste English text here..."
                        className="quantum-input min-h-[140px] resize-y"
                    />
                </div>
                <SubmitButton loading={loading}>
                    <Languages size={18} /> Translate to Urdu
                </SubmitButton>
            </form>

            <ErrorBox message={error} />

            {result && (
                <ResultBox>
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-bold uppercase tracking-widest text-purple-400">Urdu Translation</p>
                        <button onClick={copyText} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors bg-white/5 px-3 py-1.5 rounded-lg">
                            {copied ? <Check size={14} /> : <Copy size={14} />}
                            {copied ? 'Copied!' : 'Copy'}
                        </button>
                    </div>
                    <p className="text-xl text-slate-200 leading-relaxed text-right font-medium" dir="rtl">{result}</p>
                </ResultBox>
            )}
        </div>
    );
}
