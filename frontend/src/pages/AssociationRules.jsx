import { useState } from 'react';
import axios from 'axios';
import { ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageHeader, ResultBox, ErrorBox, SubmitButton, UploadZone, SectionLabel } from '../components/UI';

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
            <PageHeader icon={ShoppingCart} title="Association Rules" subtitle="Discover hidden relationships in transactional datasets using the Apriori algorithm." />

            <form onSubmit={handleSubmit} className="glass-card p-6 sm:p-8 space-y-6">
                <UploadZone accept=".csv,.xlsx" onChange={(e) => setFile(e.target.files[0])} label="Upload Transaction Data" sublabel=".CSV or .XLSX (each row = transaction)" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2.5">Metric</label>
                        <select value={metric} onChange={(e) => setMetric(e.target.value)} className="quantum-input">
                            <option value="lift">Lift</option>
                            <option value="confidence">Confidence</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2.5">Min Support</label>
                        <input type="number" value={minSupport} onChange={(e) => setMinSupport(e.target.value)} step="0.01" min="0.01" max="1" className="quantum-input" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2.5">Min Threshold</label>
                        <input type="number" value={minThreshold} onChange={(e) => setMinThreshold(e.target.value)} step="0.1" min="0.1" className="quantum-input" />
                    </div>
                    <div className="flex items-end">
                        <label className="flex items-center gap-3 cursor-pointer text-sm text-slate-300 bg-white/[0.02] border border-white/[0.05] rounded-2xl px-4 py-3 w-full hover:bg-white/[0.04] transition-colors">
                            <input type="checkbox" checked={hasHeader} onChange={(e) => setHasHeader(e.target.checked)} className="w-4 h-4 rounded accent-cyan-500" />
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
                    <SectionLabel>Mining Results: {result.count} rules discovered</SectionLabel>
                    <div className="overflow-x-auto -mx-2 rounded-2xl border border-white/[0.05]">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-[11px] uppercase tracking-wider text-slate-500 bg-white/[0.02]">
                                    <th className="p-4">Antecedents</th>
                                    <th className="p-4">Consequents</th>
                                    <th className="p-4">Support</th>
                                    <th className="p-4">Confidence</th>
                                    <th className="p-4">Lift</th>
                                </tr>
                            </thead>
                            <tbody>
                                {result.rules?.map((rule, i) => (
                                    <motion.tr
                                        key={i}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="border-t border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                                    >
                                        <td className="p-4">
                                            <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-500/15 text-blue-400">
                                                {rule.antecedents.join(', ')}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-500/15 text-purple-400">
                                                {rule.consequents.join(', ')}
                                            </span>
                                        </td>
                                        <td className="p-4 text-slate-300 font-mono text-xs">{rule.support.toFixed(4)}</td>
                                        <td className="p-4 text-slate-300 font-mono text-xs">{rule.confidence.toFixed(4)}</td>
                                        <td className="p-4 text-cyan-400 font-mono text-xs font-bold">{rule.lift.toFixed(4)}</td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </ResultBox>
            )}
        </div>
    );
}
