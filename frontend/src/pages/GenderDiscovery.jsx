import { useState } from 'react';
import axios from 'axios';
import { Upload, User, Scan } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageHeader, ResultBox, ErrorBox, SubmitButton, UploadZone, SectionLabel } from '../components/UI';

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
            <PageHeader icon={User} title="Gender Discovery" subtitle="Upload a visual specimen for neural gender classification using Vision Transformer." />

            <form onSubmit={handleSubmit} className="glass-card p-6 sm:p-8 space-y-6">
                {!preview ? (
                    <UploadZone accept="image/*" name="image" onChange={handleFile} label="Upload Image" sublabel="PNG, JPG or WEBP (max 10MB)" />
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative rounded-2xl overflow-hidden border border-white/10 group"
                    >
                        <img src={preview} alt="Preview" className="w-full h-60 object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                            <label className="text-xs text-white/80 cursor-pointer hover:text-white font-medium">
                                Click to change →
                                <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
                            </label>
                        </div>
                    </motion.div>
                )}

                <SubmitButton loading={loading}>
                    <Scan size={18} /> Run Discovery Engine
                </SubmitButton>
            </form>

            <ErrorBox message={error} />

            {result && (
                <ResultBox>
                    <SectionLabel>Engine Output</SectionLabel>
                    <div className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                        <span className="text-sm text-slate-400 font-medium">Detected Gender</span>
                        <motion.span
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: 'spring', stiffness: 200 }}
                            className="text-3xl font-black gradient-text"
                        >
                            {result}
                        </motion.span>
                    </div>
                    <p className="text-xs text-slate-500 mt-3 flex items-center gap-1.5">
                        <Scan size={12} /> Vision model identifies facial features for classification
                    </p>
                </ResultBox>
            )}
        </div>
    );
}
