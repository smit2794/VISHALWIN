import React from'react';
import { Search } from'lucide-react';
import { Button } from'../ui';

interface EmptyStateProps {
 title: string;
 description: string;
 actionText?: string;
 onAction?: () => void;
 icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
 title,
 description,
 actionText,
 onAction,
 icon = <Search className="h-10 w-10 text-slate-400"/>
}) => {
 return (
 <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-white border border-slate-100 rounded-xl">
 <div className="p-3 bg-slate-50 rounded-full mb-4">
 {icon}
 </div>
 <h3 className="text-base font-semibold text-slate-900 mb-1">{title}</h3>
 <p className="text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">{description}</p>
 {actionText && onAction && (
 <Button onClick={onAction} size="sm">
 {actionText}
 </Button>
 )}
 </div>
 );
};
export default EmptyState;
