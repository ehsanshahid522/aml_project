import { useState } from 'react';
import axios from 'axios';
import { PenTool, Copy, Check } from 'lucide-react';
import { PageHeader, ResultBox, ErrorBox, SubmitButton } from '../components/UI';

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
            <PageHeader title="Text Synthesis" subtitle="Creative language generation powered by GPT-2 architecture." />

            <form onSubmit={handleSubmit} className="glass-card p-6 sm:p-8 space-y-5">
                <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Synthesis Prompt</label>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Enter a seed sentence for the AI to expand upon..."
                        className="quantum-input min-h-[140px] resize-y"
                    />
                </div>
                <SubmitButton loading={loading}>
                    <PenTool size={18} /> Synthesize Text
                </SubmitButton>
            </form>

            <ErrorBox message={error} />

            {result && (
                <ResultBox>
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-bold uppercase tracking-widest text-purple-400">Generated Output</p>
                        <button onClick={copyText} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors bg-white/5 px-3 py-1.5 rounded-lg">
                            {copied ? <Check size={14} /> : <Copy size={14} />}
                            {copied ? 'Copied!' : 'Copy'}
                        </button>
                    </div>
                    <p className="text-slate-200 leading-relaxed">{result}</p>
                </ResultBox>
            )}
        </div>
    );
}
