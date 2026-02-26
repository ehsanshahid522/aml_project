import { useState } from 'react';
import axios from 'axios';
import { ShoppingCart } from 'lucide-react';
import { PageHeader, ResultBox, ErrorBox, SubmitButton, UploadZone } from '../components/UI';

export default function AssociationRules() {
    const [file, setFile] = useState(null);
    const [metric, setMetric] = useState('lift');
    const [minSupport, setMinSupport] = useState(0.1);
    const [minThreshold, setMinThreshold] = useState(0.7);
    const [hasHeader, setHasHeader] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) return setError('Please upload a file');
        setLoading(true); setError(''); setResult(null);

        const fd = new FormData();
        fd.append('file', file);
        fd.append('metric', metric);
        fd.append('min_support', minSupport);
        fd.append('min_threshold', minThreshold);
        fd.append('has_header', hasHeader);

        try {
            const res = await axios.post('/api/apriori', fd);
            setResult(res.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Request failed');
        } finally { setLoading(false); }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <PageHeader title="Association Rules" subtitle="Discover hidden relationships in transactional datasets using Apriori." />

            <form onSubmit={handleSubmit} className="glass-card p-6 sm:p-8 space-y-5">
                <UploadZone accept=".csv,.xlsx" onChange={(e) => setFile(e.target.files[0])} label="Upload Transaction Data" sublabel=".CSV or .XLSX (each row = transaction)" />
                {file && <p className="text-sm text-cyan-400 text-center font-medium">📊 {file.name}</p>}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">Metric</label>
                        <select value={metric} onChange={(e) => setMetric(e.target.value)} className="quantum-input">
                            <option value="lift">Lift</option>
                            <option value="confidence">Confidence</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">Min Support</label>
                        <input type="number" value={minSupport} onChange={(e) => setMinSupport(e.target.value)} step="0.01" min="0.01" max="1" className="quantum-input" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">Min Threshold</label>
                        <input type="number" value={minThreshold} onChange={(e) => setMinThreshold(e.target.value)} step="0.1" min="0.1" className="quantum-input" />
                    </div>
                    <div className="flex items-end">
                        <label className="flex items-center gap-3 cursor-pointer text-sm text-slate-300">
                            <input type="checkbox" checked={hasHeader} onChange={(e) => setHasHeader(e.target.checked)} className="w-4 h-4 rounded" />
                            File has header row
                        </label>
                    </div>
                </div>

                <SubmitButton loading={loading}>
                    <ShoppingCart size={18} /> Generate Rules
                </SubmitButton>
            </form>

            <ErrorBox message={error} />

            {result && (
                <ResultBox>
                    <p className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-4">
                        Mining Results: {result.count} rules discovered
                    </p>
                    <div className="overflow-x-auto -mx-2">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-xs uppercase tracking-wider text-slate-500 border-b border-white/10">
                                    <th className="p-3">Antecedents (If)</th>
                                    <th className="p-3">Consequents (Then)</th>
                                    <th className="p-3">Support</th>
                                    <th className="p-3">Confidence</th>
                                    <th className="p-3">Lift</th>
                                </tr>
                            </thead>
                            <tbody>
                                {result.rules?.map((rule, i) => (
                                    <tr key={i} className="border-b border-white/5 hover:bg-white/3">
                                        <td className="p-3">
                                            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-500/20 text-blue-400">
                                                {rule.antecedents.join(', ')}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-purple-500/20 text-purple-400">
                                                {rule.consequents.join(', ')}
                                            </span>
                                        </td>
                                        <td className="p-3 text-slate-300">{rule.support.toFixed(4)}</td>
                                        <td className="p-3 text-slate-300">{rule.confidence.toFixed(4)}</td>
                                        <td className="p-3 text-slate-300">{rule.lift.toFixed(4)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </ResultBox>
            )}
        </div>
    );
}
