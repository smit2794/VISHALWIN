import React from'react';
import { ChildJourneyStatus } from'../../types';
import { Check, ShieldAlert, Award } from'lucide-react';

interface TrackerProps {
 currentStatus: ChildJourneyStatus;
 classification?:'Normal'|'Special';
 onStatusChange?: (status: ChildJourneyStatus) => void;
 readOnly?: boolean;
}

export const JOURNEY_STEPS: ChildJourneyStatus[] = [
'Medical Camp',
'Screening',
'Child Classification',
'Follow-Up',
'Diagnosis',
'Therapy Centre Enrollment',
'Sponsorship Support',
'Active Therapy',
'Progress Tracking',
'School Ready',
'School Admission'
];

// Special-Needs-only steps
const CLINICAL_STEPS = new Set<ChildJourneyStatus>([
'Diagnosis',
'Therapy Centre Enrollment',
'Sponsorship Support',
'Active Therapy',
'Progress Tracking'
]);

export const RenuJourneyTracker: React.FC<TrackerProps> = ({
 currentStatus,
 classification ='Special',
 onStatusChange,
 readOnly = false
}) => {
 const currentIndex = JOURNEY_STEPS.indexOf(currentStatus);
 const isNormal = classification ==='Normal';

 // Calculate progress percentage
 // If Normal, clinical steps are ignored. Count of valid steps: standard 11 - 5 clinical = 6 steps
 const totalSteps = JOURNEY_STEPS.length;
 let activeValidIndex = currentIndex;
 let completionPercentage = Math.round((currentIndex / (totalSteps - 1)) * 100);

 if (isNormal) {
 // Normal child: valid steps: Medical Camp(0), Screening(1), Child Classification(2), School Ready(9), School Admission(10)
 // Map current index to virtual index
 let virtualTotal = 5;
 let virtualIndex = 0;
 if (currentStatus ==='Medical Camp') virtualIndex = 0;
 else if (currentStatus ==='Screening') virtualIndex = 1;
 else if (currentStatus ==='Child Classification') virtualIndex = 2;
 else if (currentStatus ==='School Ready') virtualIndex = 3;
 else if (currentStatus ==='School Admission') virtualIndex = 4;
 else virtualIndex = 2; // Default fallback if in clinical state
 completionPercentage = Math.round((virtualIndex / (virtualTotal - 1)) * 100);
 }

 const handleStepClick = (step: ChildJourneyStatus) => {
 if (readOnly || !onStatusChange) return;

 // Normal child cannot be assigned clinical steps
 if (isNormal && CLINICAL_STEPS.has(step)) {
 return;
 }

 onStatusChange(step);
 };

 return (
 <div className="space-y-4 w-full">
 {/* Progress metrics and Header */}
 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-slate-50 border border-slate-100 p-3.5 rounded-xl text-xs">
 <div>
 <span className="text-slate-400 font-semibold uppercase block">Journey Progress</span>
 <p className="text-slate-800 font-extrabold text-sm mt-0.5">
 Stage: <span className="text-brand-cyan-700 font-display">{currentStatus}</span>
 </p>
 </div>
 <div className="flex items-center gap-4 w-full sm:w-auto mt-2 sm:mt-0">
 <div className="flex-1 sm:flex-initial">
 <div className="w-full sm:w-44 bg-slate-200 h-2 rounded-full overflow-hidden mb-1">
 <div 
 className="bg-brand-cyan-700 h-full rounded-full transition-all duration-500"
 style={{ width:`${completionPercentage}%`}} 
 />
 </div>
 <div className="text-[10px] text-slate-400 text-right font-medium">
 {completionPercentage}% Journey Complete
 </div>
 </div>
 <Badge className="font-extrabold scale-95 flex-shrink-0">
 {isNormal ?'Normal Roadmap':'Special Roadmap'}
 </Badge>
 </div>
 </div>

 {/* Horizontal / scrollable timeline for Desktop */}
 <div className="hidden md:block overflow-x-auto pb-4 pr-2 select-none scrollbar-thin">
 <div className="flex items-center min-w-[1000px] py-3 pl-3">
 {JOURNEY_STEPS.map((step, idx) => {
 const isClinical = CLINICAL_STEPS.has(step);
 const isBypassed = isNormal && isClinical;
 
 let status:'completed'|'active'|'upcoming'|'bypassed'='upcoming';
 if (isBypassed) {
 status ='bypassed';
 } else if (idx < currentIndex) {
 status ='completed';
 } else if (idx === currentIndex) {
 status ='active';
 }

 return (
 <React.Fragment key={step}>
 {/* Connector Line */}
 {idx > 0 && (
 <div 
 className={`h-0.5 flex-1 mx-2 transition-colors duration-300 ${
 status ==='completed'|| (idx <= currentIndex && !isBypassed)
 ?'bg-brand-success'
 : isBypassed 
 ?'bg-slate-200 border-dashed border-t'
 :'bg-slate-200'
 }`} 
 />
 )}

 {/* Step Node */}
 <div 
 onClick={() => handleStepClick(step)}
 className={`flex flex-col items-center text-center cursor-pointer transition-all relative ${
 readOnly ?'pointer-events-none':'hover:scale-105'
 }`}
 style={{ width:'90px'}}
 >
 <div className={`h-8 w-8 rounded-full border-2 flex items-center justify-center transition-all ${
 status ==='completed'
 ?'bg-brand-success border-brand-success text-white'
 : status ==='active'
 ?'bg-white border-brand-cyan-700 text-brand-cyan-700 ring-4 ring-brand-cyan-50'
 : status ==='bypassed'
 ?'bg-slate-50 border-slate-200 text-slate-300'
 :'bg-white border-slate-300 text-slate-400'
 }`}>
 {status ==='completed'? (
 <Check className="h-4 w-4 stroke-[3]"/>
 ) : status ==='bypassed'? (
 <span className="text-[8px] font-bold">N/A</span>
 ) : (
 <span className="text-[10px] font-bold">{idx + 1}</span>
 )}
 </div>
 <span className={`text-[9px] font-bold tracking-tight leading-tight mt-2 block ${
 status ==='active'
 ?'text-brand-cyan-700 font-extrabold'
 : status ==='bypassed'
 ?'text-slate-400 line-through'
 :'text-slate-600'
 }`}>
 {step}
 </span>
 </div>
 </React.Fragment>
 );
 })}
 </div>
 </div>

 {/* Vertical timeline stepper for Mobile */}
 <div className="block md:hidden border-l border-slate-200 ml-4 pl-5 space-y-4 pt-2 text-xs">
 {JOURNEY_STEPS.map((step, idx) => {
 const isClinical = CLINICAL_STEPS.has(step);
 const isBypassed = isNormal && isClinical;
 
 let status:'completed'|'active'|'upcoming'|'bypassed'='upcoming';
 if (isBypassed) {
 status ='bypassed';
 } else if (idx < currentIndex) {
 status ='completed';
 } else if (idx === currentIndex) {
 status ='active';
 }

 return (
 <div 
 key={step} 
 onClick={() => handleStepClick(step)}
 className={`relative cursor-pointer transition-all ${
 readOnly ?'pointer-events-none':''
 }`}
 >
 <div className={`absolute -left-[27px] top-0 h-4.5 w-4.5 rounded-full border flex items-center justify-center ${
 status ==='completed'
 ?'bg-brand-success border-brand-success text-white'
 : status ==='active'
 ?'bg-white border-brand-cyan-700 text-brand-cyan-700 ring-4 ring-brand-cyan-50'
 : status ==='bypassed'
 ?'bg-slate-100 border-slate-200 text-slate-300'
 :'bg-white border-slate-300 text-slate-400'
 }`}>
 {status ==='completed'? (
 <Check className="h-2.5 w-2.5 stroke-[3]"/>
 ) : (
 <span className="text-[8px] font-extrabold">{idx + 1}</span>
 )}
 </div>
 <div className="pl-1">
 <span className={`font-bold text-xs block ${
 status ==='active'
 ?'text-brand-cyan-750 font-extrabold'
 : status ==='bypassed'
 ?'text-slate-400 line-through'
 :'text-slate-800'
 }`}>
 {step} {isBypassed && <span className="text-[8px] text-slate-400 font-semibold bg-slate-50 px-1 py-0 rounded inline-block ml-1">Bypassed</span>}
 </span>
 </div>
 </div>
 );
 })}
 </div>
 </div>
 );
};

// Internal Badge helper
const Badge: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className ='', children, ...props }) => (
 <div 
 className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold bg-brand-cyan-50 border border-brand-cyan-100 text-brand-cyan-750 uppercase tracking-wider ${className}`} 
 {...props}
 >
 {children}
 </div>
);
export default RenuJourneyTracker;
