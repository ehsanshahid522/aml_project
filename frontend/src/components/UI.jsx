import { motion } from 'framer-motion';
import { Loader2, AlertTriangle, CloudUpload, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

export function PageHeader({ title, subtitle, icon: Icon }) {
    return (
        <div className="mb-8">
            <motion.div
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
            >
                {Icon && (
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/10 border border-white/[0.06] grid place-items-center mb-4">
                        <Icon size={22} className="text-cyan-400" />
                    </div>
                )}
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{title}</h1>
                {subtitle && <p className="text-slate-400 mt-2 text-sm sm:text-base leading-relaxed max-w-xl">{subtitle}</p>}
            </motion.div>
        </div>
    );
}

export function ResultBox({ children, className = '' }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className={`mt-6 p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-cyan-500/[0.06] to-purple-500/[0.04] border border-cyan-500/10 backdrop-blur-sm ${className}`}
        >
            {children}
        </motion.div>
    );
}

export function ErrorBox({ message }) {
    if (!message) return null;
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 rounded-2xl bg-red-500/[0.08] border border-red-500/20 text-red-400 text-sm flex items-start gap-3"
        >
            <AlertTriangle size={18} className="mt-0.5 flex-shrink-0" />
            <span>{message}</span>
        </motion.div>
    );
}

export function SubmitButton({ loading, children, onClick, type = 'submit' }) {
    return (
        <motion.button
            type={type}
            onClick={onClick}
            disabled={loading}
            whileTap={{ scale: 0.97 }}
            className="btn-quantum w-full py-4 px-6 text-base font-bold rounded-2xl flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {loading ? (
                <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>Processing...</span>
                </>
            ) : children}
        </motion.button>
    );
}

export function UploadZone({ accept, name, onChange, label, sublabel }) {
    const [fileName, setFileName] = useState('');
    const [isDragging, setIsDragging] = useState(false);

    const handleChange = (e) => {
        if (e.target.files[0]) {
            setFileName(e.target.files[0].name);
        }
        onChange?.(e);
    };

    return (
        <label
            className="block cursor-pointer"
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={() => setIsDragging(false)}
        >
            <motion.div
                whileHover={{ scale: 1.01 }}
                className={`
          border-2 border-dashed rounded-2xl p-10 text-center
          transition-all duration-300
          ${isDragging
                        ? 'border-cyan-400/50 bg-cyan-500/[0.06] shadow-lg shadow-cyan-500/5'
                        : fileName
                            ? 'border-emerald-500/30 bg-emerald-500/[0.04]'
                            : 'border-white/[0.08] hover:border-cyan-500/20 hover:bg-white/[0.02]'
                    }
        `}
            >
                {fileName ? (
                    <div className="flex flex-col items-center gap-2">
                        <CheckCircle2 size={32} className="text-emerald-400" />
                        <p className="text-sm font-semibold text-emerald-400">{fileName}</p>
                        <p className="text-xs text-slate-500">Click to change file</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-purple-500/5 border border-white/[0.06] grid place-items-center">
                            <CloudUpload size={24} className="text-cyan-400" />
                        </div>
                        <div>
                            <p className="font-semibold text-sm text-slate-200">{label || 'Click to upload'}</p>
                            <p className="text-xs text-slate-500 mt-1">{sublabel || 'Drag and drop supported'}</p>
                        </div>
                    </div>
                )}
            </motion.div>
            <input
                type="file"
                accept={accept}
                name={name}
                onChange={handleChange}
                className="hidden"
            />
        </label>
    );
}

export function SectionLabel({ children }) {
    return (
        <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-purple-400 mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            {children}
        </p>
    );
}
