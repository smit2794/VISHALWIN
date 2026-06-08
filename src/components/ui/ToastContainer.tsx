import React from'react';
import { useToast } from'../../hooks/useToast';
import { CheckCircle, AlertTriangle, AlertCircle, Info, X } from'lucide-react';
import { motion, AnimatePresence } from'framer-motion';

export const ToastContainer: React.FC = () => {
 const { toastMessages, removeToast } = useToast();

 const icons = {
 success: <CheckCircle className="h-5 w-5 text-emerald-600"/>,
 warning: <AlertTriangle className="h-5 w-5 text-amber-500"/>,
 danger: <AlertCircle className="h-5 w-5 text-red-600"/>,
 info: <Info className="h-5 w-5 text-cyan-600"/>,
 };

 const borders = {
 success:'border-green-200 bg-green-50/95',
 warning:'border-amber-200 bg-amber-50/95',
 danger:'border-red-200 bg-red-50/95',
 info:'border-brand-cyan-200 bg-brand-cyan-50/95',
 };

 return (
 <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
 <AnimatePresence>
 {toastMessages.map((toast) => (
 <motion.div
 key={toast.id}
 initial={{ opacity: 0, y: 50, scale: 0.9 }}
 animate={{ opacity: 1, y: 0, scale: 1 }}
 exit={{ opacity: 0, y: -20, scale: 0.9, transition: { duration: 0.2 } }}
 className={`pointer-events-auto border rounded-xl p-4 shadow-lg flex gap-3 items-start backdrop-blur-xs ${borders[toast.type]}`}
 >
 <div className="flex-shrink-0 mt-0.5">{icons[toast.type]}</div>
 <div className="flex-1">
 <h4 className="text-sm font-semibold text-slate-900">{toast.title}</h4>
 {toast.description && (
 <p className="text-xs text-slate-600 mt-1 leading-relaxed">{toast.description}</p>
 )}
 </div>
 <button
 onClick={() => removeToast(toast.id)}
 className="flex-shrink-0 p-0.5 rounded-full hover:bg-black/5 text-slate-400 hover:text-slate-600 cursor-pointer"
 >
 <X className="h-4 w-4"/>
 </button>
 </motion.div>
 ))}
 </AnimatePresence>
 </div>
 );
};
export default ToastContainer;
