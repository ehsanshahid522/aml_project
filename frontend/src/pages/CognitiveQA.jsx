import { useState } from 'react';
import axios from 'axios';
import { Brain, Volume2 } from 'lucide-react';
import { PageHeader, ResultBox, ErrorBox, SubmitButton, UploadZone } from '../components/UI';

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
            <PageHeader title="Cognitive QA" subtitle="Knowledge extraction engine with vocal synthesis output." />

            <form onSubmit={handleSubmit} className="glass-card p-6 sm:p-8 space-y-5">
                <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Context Repository</label>
                    <textarea
                        value={context}
                        onChange={(e) => setContext(e.target.value)}
                        placeholder="Paste the reference document here..."
                        className="quantum-input min-h-[180px] resize-y"
                        required
                    />
                </div>

                <div className="flex gap-2 border-b border-white/10 pb-3">
                    {['text', 'voice'].map(t => (
                        <button
                            key={t}
                            type="button"
                            onClick={() => setTab(t)}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${tab === t ? 'bg-cyan-500/10 text-cyan-400' : 'text-slate-400 hover:bg-white/5'
                                }`}
                        >
                            {t === 'text' ? 'Type Question' : 'Voice Question'}
                        </button>
                    ))}
                </div>

                {tab === 'text' ? (
                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">Query</label>
                        <input
                            type="text"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder="Ask a question about the context..."
                            className="quantum-input"
                        />
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
                    <p className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-4">Reasoning Output</p>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 rounded-xl bg-black/20 border-l-4 border-cyan-400">
                        <div className="flex-1">
                            <span className="text-xs font-bold text-cyan-400 uppercase">Extracted Answer</span>
                            <p className="text-xl font-bold text-slate-100 mt-1">{result.answer}</p>
                        </div>
                        {result.audio_url && (
                            <button
                                type="button"
                                onClick={playAudio}
                                className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 grid place-items-center text-white hover:scale-110 transition-transform flex-shrink-0"
                            >
                                <Volume2 size={22} />
                            </button>
                        )}
                    </div>

                    {result.score > 0 && (
                        <div className="mt-4">
                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all duration-1000"
                                    style={{ width: `${result.score}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-sm text-slate-400 mt-1">
                                <span>Confidence</span>
                                <span>{result.score}%</span>
                            </div>
                        </div>
                    )}
                </ResultBox>
            )}
        </div>
    );
}
