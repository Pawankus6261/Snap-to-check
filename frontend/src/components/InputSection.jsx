import React, { useState } from 'react';
import { Upload, Camera, Image as ImageIcon, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CameraCapture from './CameraCapture';

const InputSection = ({ onImageSelected }) => {
    const [activeTab, setActiveTab] = useState('upload'); 
    const [dragActive, setDragActive] = useState(false);
    const [emergencyPhone, setEmergencyPhone] = useState('');

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
        else if (e.type === "dragleave") setDragActive(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]);
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) processFile(e.target.files[0]);
    };

    const processFile = (file) => {
        // FIX: Ensure phone is entered before proceeding
        if (!emergencyPhone || emergencyPhone.trim().length < 5) {
            alert("⚠️ Emergency Contact is REQUIRED.\nPlease enter a valid number (e.g. +1 555 0199) before scanning.");
            return;
        }

        if (file.type.startsWith('image/')) {
            // FIX: Pass BOTH file AND phone to the parent
            onImageSelected(file, emergencyPhone);
        } else {
            alert("Please upload an image file.");
        }
    };

    return (
        <div className="w-full max-w-lg mx-auto space-y-4">
            
            {/* EMERGENCY CONTACT INPUT */}
            <div className={`bg-white/60 backdrop-blur-xl rounded-2xl shadow-sm border p-4 flex items-center gap-3 ring-1 transition-all ${!emergencyPhone ? 'border-red-300 ring-red-200 bg-red-50/50' : 'border-emerald-300 ring-emerald-200 bg-emerald-50/30'}`}>
                <div className={`p-2 rounded-full ${!emergencyPhone ? 'bg-red-100 text-red-500' : 'bg-emerald-100 text-emerald-600'}`}><Phone size={20} /></div>
                <div className="flex-1">
                    <label className={`text-xs font-bold uppercase tracking-wider block mb-1 ${!emergencyPhone ? 'text-red-600' : 'text-emerald-700'}`}>
                        Emergency Contact (Required) *
                    </label>
                    <input 
                        type="tel" 
                        placeholder="e.g. +1 555 0199"
                        value={emergencyPhone}
                        onChange={(e) => setEmergencyPhone(e.target.value)}
                        className="w-full bg-transparent border-none p-0 text-slate-800 font-semibold placeholder:text-slate-400 focus:ring-0 text-lg outline-none"
                    />
                </div>
            </div>

            {/* MAIN CAPTURE CARD */}
            <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-2xl shadow-blue-900/10 border border-white/50 overflow-hidden ring-1 ring-white/50">
                <div className="flex border-b border-slate-200/50 p-1 bg-slate-50/50">
                    <button className={`relative flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 rounded-xl transition-all duration-300 ${activeTab === 'upload' ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5' : 'text-slate-400 hover:text-slate-600'}`} onClick={() => setActiveTab('upload')}><Upload size={18} /> Upload Label</button>
                    <button className={`relative flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 rounded-xl transition-all duration-300 ${activeTab === 'camera' ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5' : 'text-slate-400 hover:text-slate-600'}`} onClick={() => setActiveTab('camera')}><Camera size={18} /> Use Camera</button>
                </div>

                <div className="p-6 min-h-[300px] flex flex-col justify-center relative">
                    <AnimatePresence mode="wait">
                        {activeTab === 'upload' && (
                            <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col">
                                <div className={`flex-1 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center p-8 transition-all duration-300 ${dragActive ? 'border-blue-500 bg-blue-50/50' : 'border-slate-300/60 hover:border-blue-400 hover:bg-white/50'}`} onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}>
                                    <div className="p-5 bg-slate-100 rounded-full mb-4 text-slate-400"><ImageIcon size={40} /></div>
                                    <p className="text-slate-800 font-bold text-lg mb-1">Drop label image here</p>
                                    <label className="cursor-pointer group relative overflow-hidden rounded-xl mt-4"><div className="absolute inset-0 bg-blue-600 opacity-90 group-hover:opacity-100 transition-opacity" /><span className="relative px-6 py-3 block text-sm font-bold text-white shadow-lg">Choose File</span><input type="file" className="hidden" accept="image/*" onChange={handleChange} /></label>
                                </div>
                            </motion.div>
                        )}
                        {activeTab === 'camera' && (
                            <motion.div key="camera" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-[400px] rounded-2xl overflow-hidden relative shadow-inner ring-1 ring-black/5">
                                <CameraCapture onCapture={(blob) => processFile(blob)} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};
export default InputSection;