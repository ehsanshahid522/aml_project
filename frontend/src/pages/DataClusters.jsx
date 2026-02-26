import { useState } from 'react';
import axios from 'axios';
import { PieChart } from 'lucide-react';
import { PageHeader, ResultBox, ErrorBox, SubmitButton, UploadZone } from '../components/UI';

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
            <PageHeader title="Data Clusters" subtitle="Unsupervised grouping of multivariate datasets using K-Means." />

            <form onSubmit={handleSubmit} className="glass-card p-6 sm:p-8 space-y-5">
                <UploadZone accept=".csv,.xlsx" onChange={(e) => setFile(e.target.files[0])} label="Upload Data Structure" sublabel=".CSV or .XLSX datasets" />
                {file && <p className="text-sm text-cyan-400 text-center font-medium">📊 {file.name}</p>}

                <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Cluster Centroids (K)</label>
                    <input
                        type="number"
                        value={clusters}
                        onChange={(e) => setClusters(e.target.value)}
                        min="2" max="10"
                        className="quantum-input w-32"
                    />
                </div>

                <SubmitButton loading={loading}>
                    <PieChart size={18} /> Map Clusters
                </SubmitButton>
            </form>

            <ErrorBox message={error} />

            {result && (
                <ResultBox>
                    <p className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-4">Clustering Visualization</p>
                    <div className="bg-white p-4 rounded-2xl">
                        <img src={`data:image/png;base64,${result.plot}`} alt="Cluster Plot" className="w-full rounded-xl" />
                    </div>
                    {result.cluster_info && (
                        <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {Object.entries(result.cluster_info).map(([k, v]) => (
                                <div key={k} className="p-3 rounded-xl bg-white/3 border-l-3 border-purple-500">
                                    <span className="text-xs font-bold text-purple-400 uppercase">Cluster {k}</span>
                                    <p className="text-lg font-extrabold mt-1">{v} Entities</p>
                                </div>
                            ))}
                        </div>
                    )}
                </ResultBox>
            )}
        </div>
    );
}
