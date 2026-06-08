import React from 'react';
import { motion, AnimatePresence, HTMLMotionProps } from 'framer-motion';
import { X } from 'lucide-react';

// --- BUTTON ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
 variant?:'primary'|'secondary'|'outline'|'danger'|'ghost';
 size?:'sm'|'md'|'lg';
 isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
 ({ className ='', variant ='primary', size ='md', isLoading, children, disabled, ...props }, ref) => {
 const baseStyle ='inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:pointer-events-none cursor-pointer active:scale-97 select-none';
 
 const variants = {
 primary:'bg-red-600 hover:bg-red-700 text-white shadow-sm border border-transparent active:bg-red-800',
 secondary:'bg-teal-50 hover:bg-teal-100 text-teal-700 border border-transparent active:bg-teal-200/50',
 outline:'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs active:bg-slate-100',
 danger:'bg-red-600 hover:bg-red-700 text-white shadow-sm border border-transparent active:bg-red-800',
 ghost:'hover:bg-slate-100 text-slate-600 hover:text-slate-800 border border-transparent active:bg-slate-200/40',
 };

 const sizes = {
 sm:'px-3 py-1.5 text-xs',
 md:'px-4 py-2 text-sm',
 lg:'px-5 py-2.5 text-base',
 };

 return (
 <button
 ref={ref}
 disabled={disabled || isLoading}
 className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
 {...props}
 >
 {isLoading && (
 <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"fill="none"viewBox="0 0 24 24">
 <circle className="opacity-25"cx="12"cy="12"r="10"stroke="currentColor"strokeWidth="4"/>
 <path className="opacity-75"fill="currentColor"d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
 </svg>
 )}
 {children}
 </button>
 );
 }
);
Button.displayName ='Button';

// --- BADGE ---
interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
 variant?:'solid'|'outline'|'soft';
 color?:'primary'|'success'|'warning'|'danger'|'slate';
}

export const Badge: React.FC<BadgeProps> = ({
 className ='',
 variant ='soft',
 color ='primary',
 children,
 ...props
}) => {
 const baseStyle ='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide border transition-all duration-200';
 
 const colors = {
 primary: {
 solid:'bg-red-600 text-white border-transparent',
 outline:'text-red-600 border-red-300 bg-transparent',
 soft:'bg-red-50 text-red-700 border-red-100/50',
 },
    success: {
      solid: 'bg-emerald-600 text-white border-transparent',
      outline: 'text-emerald-600 border-emerald-300 bg-transparent',
      soft: 'bg-emerald-50/70 text-emerald-700 border-emerald-100/50',
    },
    warning: {
      solid: 'bg-amber-500 text-white border-transparent',
      outline: 'text-amber-600 border-amber-300 bg-transparent',
      soft: 'bg-amber-50/70 text-amber-700 border-amber-100/50',
    },
    danger: {
      solid: 'bg-red-600 text-white border-transparent',
      outline: 'text-red-600 border-red-300 bg-transparent',
      soft: 'bg-red-50/70 text-red-700 border-red-100/50',
    },
    slate: {
      solid: 'bg-slate-600 text-white border-transparent',
      outline: 'text-slate-600 border-slate-300 bg-transparent',
      soft: 'bg-slate-50 text-slate-605 border-slate-200',
    },
  };

  return (
    <div className={`${baseStyle} ${colors[color][variant]} ${className}`} {...props}>
      {children}
    </div>
  );
};

// --- CARD ---
export const Card: React.FC<HTMLMotionProps<'div'>> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', damping: 25, stiffness: 350 }}
      className={`bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md hover:border-slate-300/60 overflow-hidden ${className}`} 
      {...props}
    >
      {children}
    </motion.div>
  );
};

// --- INPUTS & CONTROLS ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
 error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          ref={ref}
          className={`w-full px-4 py-2.5 text-sm bg-white text-slate-800 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all ${
            error ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : 'border-slate-200 hover:border-slate-400'
          } ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', error, ...props }, ref) => {
    return (
      <div className="w-full">
        <textarea
          ref={ref}
          className={`w-full px-4 py-2.5 text-sm bg-white text-slate-800 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all ${
            error ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : 'border-slate-200 hover:border-slate-400'
          } ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

export const Label: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <label className={`block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider ${className}`} {...props}>
      {children}
    </label>
  );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  options: { label: string; value: string | number }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', error, options, ...props }, ref) => {
    return (
      <div className="w-full">
        <select
          ref={ref}
          className={`w-full px-4 py-2.5 text-sm bg-white text-slate-800 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_0.5rem_center] bg-no-repeat ${
            error ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : 'border-slate-200 hover:border-slate-400'
          } ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';

// --- MODAL ---
interface ModalProps {
 isOpen: boolean;
 onClose: () => void;
 title: string;
 children: React.ReactNode;
 size?:'sm'|'md'|'lg'|'xl';
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size ='md'}) => {
 const sizes = {
 sm:'max-w-md',
 md:'max-w-lg',
 lg:'max-w-2xl',
 xl:'max-w-4xl',
 };

 return (
 <AnimatePresence>
 {isOpen && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
 {/* Backdrop */}
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 onClick={onClose}
 className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs"
 />

 {/* Modal Container */}
 <motion.div
 initial={{ scale: 0.95, opacity: 0, y: 15 }}
 animate={{ scale: 1, opacity: 1, y: 0 }}
 exit={{ scale: 0.95, opacity: 0, y: 15 }}
 transition={{ type:'spring', damping: 25, stiffness: 280 }}
 className={`relative w-full ${sizes[size]} bg-white rounded-2xl shadow-lg border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden z-10`}
 >
 {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <h3 className="text-base font-bold text-slate-900">{title}</h3>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-slate-200/60 text-slate-405 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

 {/* Body */}
 <div className="px-6 py-5 overflow-y-auto flex-1 text-slate-700">{children}</div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>
 );
};

// --- DRAWER (Right Side Drawer) ---
interface DrawerProps {
 isOpen: boolean;
 onClose: () => void;
 title: string;
 children: React.ReactNode;
 size?:'sm'|'md'|'lg';
}

export const Drawer: React.FC<DrawerProps> = ({ isOpen, onClose, title, children, size ='md'}) => {
 const sizes = {
 sm:'max-w-md',
 md:'max-w-lg',
 lg:'max-w-2xl',
 };

 return (
 <AnimatePresence>
 {isOpen && (
 <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity"
          />

 {/* Drawer Container */}
 <div className="absolute inset-y-0 right-0 pl-10 max-w-full flex">
 <motion.div
 initial={{ x:'100%'}}
 animate={{ x: 0 }}
 exit={{ x:'100%'}}
 transition={{ type:'spring', damping: 28, stiffness: 240 }}
 className={`w-screen ${sizes[size]} bg-white border-l border-slate-200 shadow-xl flex flex-col h-full`}
 >
              {/* Header */}
              <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
                <h3 className="text-base font-bold text-slate-900">{title}</h3>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-full hover:bg-slate-200/60 text-slate-405 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

 {/* Body */}
 <div className="flex-1 overflow-y-auto p-6 text-slate-700">{children}</div>
 </motion.div>
 </div>
 </div>
 )}
 </AnimatePresence>
 );
};

// --- TABS ---
interface TabItem {
 id: string;
 label: string;
}

interface TabsProps {
 tabs: TabItem[];
 activeTab: string;
 onChange: (id: string) => void;
 className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, className =''}) => {
 return (
 <div className={`flex border-b border-slate-200 ${className}`}>
 {tabs.map((tab) => {
 const isActive = tab.id === activeTab;
 return (
 <button
 key={tab.id}
 onClick={() => onChange(tab.id)}
 className={`relative py-3 px-4 text-xs font-bold transition-colors cursor-pointer border-b-2 -mb-[2px] ${
 isActive
 ?'border-red-600 text-red-600'
 :'border-transparent text-slate-500 hover:text-slate-800'
 }`}
 >
 {tab.label}
 </button>
 );
 })}
 </div>
 );
};
