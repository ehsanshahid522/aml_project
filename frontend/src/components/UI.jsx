import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export function PageHeader({ title, subtitle }) {
    return (
        <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h1>
            {subtitle && <p className="text-slate-400 mt-1 text-sm sm:text-base">{subtitle}</p>}
        </div>
    );
}

export function ResultBox({ children, className = '' }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-6 p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-cyan-500/5 to-purple-500/5 border border-cyan-500/10 ${className}`}
        >
            {children}
        </motion.div>
    );
}

export function ErrorBox({ message }) {
    if (!message) return null;
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
        >
            ⚠️ {message}
        </motion.div>
    );
}

export function SubmitButton({ loading, children, onClick, type = 'submit' }) {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={loading}
            className="btn-quantum w-full py-3.5 px-6 text-base font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-60"
        >
            {loading ? <Loader2 className="animate-spin" size={20} /> : null}
            {loading ? 'Processing...' : children}
        </button>
    );
}

export function UploadZone({ accept, name, onChange, label, sublabel }) {
    return (
        <label className="block cursor-pointer">
            <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center hover:border-cyan-500/30 hover:bg-cyan-500/3 transition-all">
                <div className="text-3xl mb-3 gradient-text">☁️</div>
                <p className="font-semibold text-sm">{label || 'Click to upload'}</p>
                <p className="text-xs text-slate-500 mt-1">{sublabel || 'Drag and drop supported'}</p>
            </div>
            <input
                type="file"
                accept={accept}
                name={name}
                onChange={onChange}
                className="hidden"
            />
        </label>
    );
}
