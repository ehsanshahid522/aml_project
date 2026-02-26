import { useState } from 'react';
import axios from 'axios';
import { Braces } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageHeader, ResultBox, ErrorBox, SubmitButton, UploadZone, SectionLabel } from '../components/UI';

export default function DbscanLab() {
    const [file, setFile] = useState(null);
    const [eps, setEps] = useState(0.5);
    const [minSamples, setMinSamples] = useState(5);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) return setError('Please upload a file');
        setLoading(true); setError(''); setResult(null);
        const fd = new FormData();
        fd.append('file', file);
        fd.append('eps', eps);
        fd.append('min_samples', minSamples);
        try {
            const res = await axios.post('/api/dbscan', fd);
            setResult(res.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Request failed');
        } finally { setLoading(false); }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <PageHeader icon={Braces} title="DBSCAN Lab" subtitle="Density-based spatial clustering to identify complex patterns and outliers." />

            <form onSubmit={handleSubmit} className="glass-card p-6 sm:p-8 space-y-6">
                <UploadZone accept=".csv,.xlsx" onChange={(e) => setFile(e.target.files[0])} label="Upload Data Structure" sublabel=".CSV or .XLSX datasets" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2.5">Epsilon (eps)</label>
                        <input type="number" value={eps} onChange={(e) => setEps(e.target.value)} step="0.01" min="0.01" className="quantum-input" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2.5">Min Samples</label>
                        <input type="number" value={minSamples} onChange={(e) => setMinSamples(e.target.value)} min="1" className="quantum-input" />
                    </div>
                </div>
                <SubmitButton loading={loading}>
                    <Braces size={18} /> Run DBSCAN
                </SubmitButton>
            </form>

            <ErrorBox message={error} />

            {result && (
                <ResultBox>
                    <SectionLabel>DBSCAN Visualization</SectionLabel>
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-4 rounded-2xl">
                        <img src={`data:image/png;base64,${result.plot}`} alt="DBSCAN Plot" className="w-full rounded-xl" />
                    </motion.div>
                    {result.cluster_info && (
                        <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {Object.entries(result.cluster_info).map(([k, v], i) => (
                                <motion.div key={k} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                                    className="stat-glow p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                                    <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">{k === '-1' ? 'Noise Points' : `Cluster ${k}`}</span>
                                    <p className="text-xl font-black mt-1">{v}</p>
                                    <span className="text-[11px] text-slate-500">Entities</span>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </ResultBox>
            )}
        </div>
    );
}
