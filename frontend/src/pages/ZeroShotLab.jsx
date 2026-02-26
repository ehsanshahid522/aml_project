import { useState } from 'react';
import axios from 'axios';
import { Target } from 'lucide-react';
import { PageHeader, ResultBox, ErrorBox, SubmitButton } from '../components/UI';

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

    return (
        <div className="max-w-2xl mx-auto">
            <PageHeader title="Zero-Shot Lab" subtitle="BART-based classification for any unseen categories." />

            <form onSubmit={handleSubmit} className="glass-card p-6 sm:p-8 space-y-5">
                <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Input Text</label>
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Enter text to classify..."
                        className="quantum-input min-h-[120px] resize-y"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Candidate Labels</label>
                    <input
                        type="text"
                        value={labels}
                        onChange={(e) => setLabels(e.target.value)}
                        placeholder="politics, sports, technology, health..."
                        className="quantum-input"
                        required
                    />
                    <p className="text-xs text-slate-500 mt-1">Separate labels with commas</p>
                </div>
                <SubmitButton loading={loading}>
                    <Target size={18} /> Classify Text
                </SubmitButton>
            </form>

            <ErrorBox message={error} />

            {result && (
                <ResultBox>
                    <p className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-4">Classification Results</p>
                    <div className="mb-4 p-4 rounded-xl bg-black/20 text-center">
                        <span className="text-sm text-slate-400">Best Match</span>
                        <p className="text-2xl font-extrabold text-cyan-400 mt-1">{result.best_label}</p>
                        <span className="text-sm text-slate-500">{result.best_score}% confidence</span>
                    </div>
                    <div className="space-y-2">
                        {result.results?.map((r, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <span className="text-sm text-slate-300 w-28 truncate capitalize">{r.label}</span>
                                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all duration-700"
                                        style={{ width: `${r.score}%` }}
                                    />
                                </div>
                                <span className="text-xs text-slate-400 w-12 text-right">{r.score}%</span>
                            </div>
                        ))}
                    </div>
                </ResultBox>
            )}
        </div>
    );
}
