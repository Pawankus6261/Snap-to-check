import React from 'react';
import { CheckCircle, AlertTriangle, Sun, CloudSun, Moon, BellRing, Info } from 'lucide-react';

const ResultCard = ({ result }) => {
    const { medications, safety_audit, raw_text } = result;
    const isSafe = safety_audit?.ui_status === 'SAFE';
    const caregiverAlert = safety_audit?.caregiver_alert;

    const getDrugsForSlot = (slot) => {
        return medications.filter(med => med.dosage_schedule?.[slot]).map(med => ({
            name: med.drug_name,
            generic: med.generic_name,
            note: med.dosage_schedule.note
        }));
    };

    const morningList = getDrugsForSlot('morning');
    const afternoonList = getDrugsForSlot('afternoon');
    const nightList = [...getDrugsForSlot('evening'), ...getDrugsForSlot('night')];

    const ScheduleColumn = ({ title, icon: Icon, items, colorClass }) => (
        <div className={`border rounded-xl p-4 flex-1 flex flex-col ${items.length > 0 ? 'bg-white border-slate-200' : 'bg-slate-50 border-transparent opacity-60'}`}>
            <div className="flex items-center gap-2 mb-3 border-b border-slate-100 pb-2">
                <Icon size={18} className={items.length > 0 ? colorClass : "text-slate-300"} />
                <h4 className={`text-sm font-bold ${items.length > 0 ? "text-slate-800" : "text-slate-400"}`}>{title}</h4>
            </div>
            {items.length > 0 ? (
                <ul className="space-y-3">
                    {items.map((item, idx) => (
                        <li key={idx} className="flex flex-col">
                            <span className="text-sm font-bold text-slate-800">• {item.name}</span>
                            {item.generic && item.generic !== item.name && (<span className="text-[10px] text-slate-400 font-medium pl-3">({item.generic})</span>)}
                            {item.note && (<span className="text-[11px] text-slate-500 font-medium pl-3 mt-0.5">{item.note}</span>)}
                        </li>
                    ))}
                </ul>
            ) : (<div className="flex-1 flex items-center justify-center"><span className="text-xs text-slate-300 italic">--</span></div>)}
        </div>
    );

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 fade-in pb-24">
            {caregiverAlert?.required && (
                <div className="bg-red-600 text-white p-4 rounded-2xl shadow-xl shadow-red-200 flex items-center gap-4 animate-bounce">
                    <div className="bg-white/20 p-2 rounded-full"><BellRing size={24} className="text-white" /></div>
                    <div>
                        <h3 className="font-black text-sm uppercase tracking-wide">Emergency Alert Sent</h3>
                        <p className="text-xs text-red-100 font-medium mt-0.5">Caregiver notified: "{caregiverAlert.sms_message}"</p>
                    </div>
                </div>
            )}

            <div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Safety Report</h3>
                <div className={`p-5 rounded-2xl border flex items-start gap-4 shadow-sm ${isSafe ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                    <div className={`mt-0.5 p-1.5 rounded-full flex-shrink-0 ${isSafe ? 'bg-emerald-200 text-emerald-700' : 'bg-red-200 text-red-700'}`}>{isSafe ? <CheckCircle size={22} /> : <AlertTriangle size={22} />}</div>
                    <div>
                        <h4 className={`text-base font-bold ${isSafe ? 'text-emerald-900' : 'text-red-900'}`}>{safety_audit?.alert_title}</h4>
                        <p className={`text-sm mt-1 leading-relaxed ${isSafe ? 'text-emerald-800' : 'text-red-800'}`}>{safety_audit?.alert_body}</p>
                    </div>
                </div>
            </div>

            <div>
                <h3 className="text-sm font-bold text-slate-700 mb-2">Detected Drugs</h3>
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm divide-y divide-slate-50">
                    {medications.map((med, idx) => (
                        <div key={idx} className="flex justify-between items-center py-3 first:pt-0 last:pb-0">
                            <div><span className="text-slate-800 font-semibold block">{med.drug_name}</span>{med.generic_name && (<span className="text-xs text-slate-400 font-medium block">({med.generic_name})</span>)}</div>
                            <span className="text-slate-500 text-xs font-medium bg-slate-100 px-2 py-1 rounded-md">{med.form}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2"><span className="bg-blue-100 text-blue-600 p-1 rounded-md text-xs">📅</span> Medication Schedule</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <ScheduleColumn title="Morning" icon={Sun} items={morningList} colorClass="text-orange-500" />
                    <ScheduleColumn title="Afternoon" icon={CloudSun} items={afternoonList} colorClass="text-yellow-500" />
                    <ScheduleColumn title="Night" icon={Moon} items={nightList} colorClass="text-indigo-500" />
                </div>
            </div>

            <div>
                <h3 className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2"><span className="bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded text-[10px]">OCR</span> Digitized Label Text</h3>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-mono text-slate-500 leading-relaxed max-h-32 overflow-y-auto shadow-inner">{raw_text}</div>
            </div>
        </div>
    );
};
export default ResultCard;