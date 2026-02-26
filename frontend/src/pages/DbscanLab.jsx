import { useState } from 'react';
import axios from 'axios';
import { Braces } from 'lucide-react';
import { PageHeader, ResultBox, ErrorBox, SubmitButton, UploadZone } from '../components/UI';

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
            <PageHeader title="DBSCAN Lab" subtitle="Density-based clustering to identify complex patterns and outliers." />

            <form onSubmit={handleSubmit} className="glass-card p-6 sm:p-8 space-y-5">
                <UploadZone accept=".csv,.xlsx" onChange={(e) => setFile(e.target.files[0])} label="Upload Data Structure" sublabel=".CSV or .XLSX datasets" />
                {file && <p className="text-sm text-cyan-400 text-center font-medium">📊 {file.name}</p>}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">Epsilon (eps)</label>
                        <input type="number" value={eps} onChange={(e) => setEps(e.target.value)} step="0.01" min="0.01" className="quantum-input" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">Min Samples</label>
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
                    <p className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-4">DBSCAN Visualization</p>
                    <div className="bg-white p-4 rounded-2xl">
                        <img src={`data:image/png;base64,${result.plot}`} alt="DBSCAN Plot" className="w-full rounded-xl" />
                    </div>
                    {result.cluster_info && (
                        <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {Object.entries(result.cluster_info).map(([k, v]) => (
                                <div key={k} className="p-3 rounded-xl bg-white/3 border-l-3 border-purple-500">
                                    <span className="text-xs font-bold text-purple-400 uppercase">{k === '-1' ? 'Noise' : `Cluster ${k}`}</span>
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
