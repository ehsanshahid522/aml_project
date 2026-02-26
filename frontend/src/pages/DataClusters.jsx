import { useState } from 'react';
import axios from 'axios';
import { PieChart } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageHeader, ResultBox, ErrorBox, SubmitButton, UploadZone, SectionLabel } from '../components/UI';

export default function DataClusters() {
    const [file, setFile] = useState(null);
    const [clusters, setClusters] = useState(3);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) return setError('Please upload a file');
        setLoading(true); setError(''); setResult(null);
        const fd = new FormData();
        fd.append('file', file);
        fd.append('clusters', clusters);
        try {
            const res = await axios.post('/api/clustering', fd);
            setResult(res.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Request failed');
        } finally { setLoading(false); }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <PageHeader icon={PieChart} title="Data Clusters" subtitle="Unsupervised grouping of multivariate datasets using K-Means algorithm." />

            <form onSubmit={handleSubmit} className="glass-card p-6 sm:p-8 space-y-6">
                <UploadZone accept=".csv,.xlsx" onChange={(e) => setFile(e.target.files[0])} label="Upload Data Structure" sublabel=".CSV or .XLSX datasets" />
                <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2.5">Cluster Centroids (K)</label>
                    <input type="number" value={clusters} onChange={(e) => setClusters(e.target.value)} min="2" max="10" className="quantum-input w-32" />
                </div>
                <SubmitButton loading={loading}>
                    <PieChart size={18} /> Map Clusters
                </SubmitButton>
            </form>

            <ErrorBox message={error} />

            {result && (
                <ResultBox>
                    <SectionLabel>Clustering Visualization</SectionLabel>
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-4 rounded-2xl">
                        <img src={`data:image/png;base64,${result.plot}`} alt="Cluster Plot" className="w-full rounded-xl" />
                    </motion.div>
                    {result.cluster_info && (
                        <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {Object.entries(result.cluster_info).map(([k, v], i) => (
                                <motion.div key={k} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                                    className="stat-glow p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                                    <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Cluster {k}</span>
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
