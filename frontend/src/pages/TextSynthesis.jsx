import { useState } from 'react';
import axios from 'axios';
import { PenTool, Copy, Check, Wand2 } from 'lucide-react';
import { PageHeader, ResultBox, ErrorBox, SubmitButton, SectionLabel } from '../components/UI';

export default function TextSynthesis() {
    const [prompt, setPrompt] = useState('');
    const [result, setResult] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!prompt.trim()) return;
        setLoading(true); setError(''); setResult('');
        try {
            const res = await axios.post('/api/textgen', { prompt });
            setResult(res.data.generated_text);
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
            <PageHeader icon={PenTool} title="Text Synthesis" subtitle="Creative language generation powered by GPT-2 neural architecture." />

            <form onSubmit={handleSubmit} className="glass-card p-6 sm:p-8 space-y-6">
                <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2.5">Synthesis Prompt</label>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Enter a seed sentence for the AI to expand upon..."
                        className="quantum-input min-h-[150px] resize-y"
                    />
                </div>
                <SubmitButton loading={loading}>
                    <Wand2 size={18} /> Synthesize Text
                </SubmitButton>
            </form>

            <ErrorBox message={error} />

            {result && (
                <ResultBox>
                    <div className="flex items-center justify-between mb-4">
                        <SectionLabel>Generated Output</SectionLabel>
                        <button
                            onClick={copyText}
                            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-slate-400 hover:text-white hover:border-white/10 transition-all"
                        >
                            {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                            {copied ? 'Copied!' : 'Copy'}
                        </button>
                    </div>
                    <p className="text-slate-200 leading-relaxed text-[15px]">{result}</p>
                </ResultBox>
            )}
        </div>
    );
}
