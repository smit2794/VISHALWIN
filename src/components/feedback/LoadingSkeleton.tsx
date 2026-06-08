import React from'react';

export const LoadingSkeleton: React.FC<{ variant?:'card'|'table'|'profile'}> = ({ variant ='card'}) => {
 if (variant ==='table') {
 return (
 <div className="w-full bg-white border border-slate-100 rounded-xl p-6 space-y-4 animate-pulse">
 <div className="h-6 bg-slate-200 rounded w-1/4 mb-4"></div>
 <div className="space-y-3">
 <div className="grid grid-cols-5 gap-4">
 <div className="h-4 bg-slate-200 rounded"></div>
 <div className="h-4 bg-slate-200 rounded col-span-2"></div>
 <div className="h-4 bg-slate-200 rounded"></div>
 <div className="h-4 bg-slate-200 rounded"></div>
 </div>
 <div className="h-px bg-slate-100"></div>
 {Array.from({ length: 5 }).map((_, idx) => (
 <div key={idx} className="grid grid-cols-5 gap-4 py-2">
 <div className="h-4 bg-slate-100 rounded"></div>
 <div className="h-4 bg-slate-100 rounded col-span-2"></div>
 <div className="h-4 bg-slate-100 rounded"></div>
 <div className="h-4 bg-slate-100 rounded"></div>
 </div>
 ))}
 </div>
 </div>
 );
 }

 if (variant ==='profile') {
 return (
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
 <div className="md:col-span-1 bg-white border border-slate-100 rounded-xl p-6 flex flex-col items-center">
 <div className="w-24 h-24 bg-slate-200 rounded-full mb-4"></div>
 <div className="h-5 bg-slate-200 rounded w-1/2 mb-2"></div>
 <div className="h-4 bg-slate-200 rounded w-1/3"></div>
 </div>
 <div className="md:col-span-2 bg-white border border-slate-100 rounded-xl p-6 space-y-4">
 <div className="h-5 bg-slate-200 rounded w-1/4"></div>
 <div className="h-px bg-slate-100"></div>
 <div className="space-y-2">
 <div className="h-4 bg-slate-100 rounded w-full"></div>
 <div className="h-4 bg-slate-100 rounded w-5/6"></div>
 <div className="h-4 bg-slate-100 rounded w-3/4"></div>
 </div>
 </div>
 </div>
 );
 }

 return (
 <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
 {Array.from({ length: 4 }).map((_, idx) => (
 <div key={idx} className="bg-white border border-slate-100 rounded-xl p-6 space-y-4">
 <div className="h-4 bg-slate-200 rounded w-1/3"></div>
 <div className="h-6 bg-slate-200 rounded w-2/3"></div>
 <div className="h-4 bg-slate-100 rounded w-full"></div>
 </div>
 ))}
 </div>
 );
};
export default LoadingSkeleton;
