import { useState } from 'react';
import axios from 'axios';
import { Upload } from 'lucide-react';
import { PageHeader, ResultBox, ErrorBox, SubmitButton, UploadZone } from '../components/UI';

export default function GenderDiscovery() {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [result, setResult] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleFile = (e) => {
        const f = e.target.files[0];
        if (f) {
            setFile(f);
            setPreview(URL.createObjectURL(f));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) return setError('Please select an image');
        setLoading(true); setError(''); setResult('');

        const fd = new FormData();
        fd.append('image', file);

        try {
            const res = await axios.post('/api/gender', fd);
            setResult(res.data.result);
        } catch (err) {
            setError(err.response?.data?.error || 'Request failed');
        } finally { setLoading(false); }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <PageHeader title="Gender Discovery" subtitle="Upload a visual specimen for neural gender classification." />

            <form onSubmit={handleSubmit} className="glass-card p-6 sm:p-8 space-y-5">
                <UploadZone accept="image/*" name="image" onChange={handleFile} label="Upload Image" sublabel="PNG, JPG or WEBP (max 10MB)" />

                {preview && (
                    <div className="rounded-2xl overflow-hidden border border-white/10">
                        <img src={preview} alt="Preview" className="w-full h-56 object-cover" />
                    </div>
                )}

                {file && <p className="text-sm text-cyan-400 text-center font-medium">📎 {file.name}</p>}

                <SubmitButton loading={loading}>
                    <Upload size={18} /> Run Discovery Engine
                </SubmitButton>
            </form>

            <ErrorBox message={error} />

            {result && (
                <ResultBox>
                    <p className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-2">Engine Output</p>
                    <div className="flex justify-between items-center">
                        <span className="text-slate-400">Detected Gender</span>
                        <span className="text-3xl font-extrabold">{result}</span>
                    </div>
                </ResultBox>
            )}
        </div>
    );
}
