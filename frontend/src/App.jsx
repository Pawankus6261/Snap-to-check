import React, { useState } from 'react';
import { Pill, Loader2, ArrowLeft } from 'lucide-react';
import InputSection from './components/InputSection';
import ResultCard from './components/ResultCard';
import ChatBot from './components/Chatbot';

function App() {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    // FIX 1: Accept 'contactNumber' as the second argument
    const handleImageSelected = async (fileOrBlob, contactNumber) => {
        setLoading(true);
        setResult(null);

        const formData = new FormData();
        formData.append('file', fileOrBlob, 'capture.jpg');
        formData.append('current_meds', 'Warfarin'); 
        
        // FIX 2: Check for contactNumber and append it. 
        // If missing, the Backend will throw 422 error.
        if (contactNumber) {
            formData.append('emergency_contact', contactNumber);
        } else {
            alert("Emergency Contact is missing! Cannot scan.");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('http://localhost:8000/analyze', { 
                method: 'POST', 
                body: formData 
            });
            
            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`API Error: ${response.status} ${errText}`);
            }
            
            const data = await response.json();
            setResult(data);
        } catch (error) {
            console.error(error);
            alert("Analysis failed. See console for details.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative font-sans text-slate-900 pb-12 overflow-hidden bg-slate-50">
            <div className="absolute inset-0 -z-10"><div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-200/40 blur-[100px]" /><div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-200/40 blur-[100px]" /></div>
            
            <nav className="bg-white/70 backdrop-blur-md border-b border-white/40 py-4 px-6 mb-8 sticky top-0 z-50 shadow-sm">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2"><Pill className="text-red-500 fill-red-100" size={24} /><h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">Snap-and-Check</h1></div>
                    {result && (<button onClick={() => {setResult(null); setLoading(false);}} className="text-sm font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1"><ArrowLeft size={16} /> Scan New</button>)}
                </div>
            </nav>

            <main className="max-w-xl mx-auto px-4 md:px-0 space-y-8">
                {!loading && !result && (<section className="animate-in fade-in zoom-in duration-300"><InputSection onImageSelected={handleImageSelected} /></section>)}
                {loading && (
                    <div className="bg-white/80 backdrop-blur-xl border border-blue-100 rounded-3xl p-12 text-center shadow-2xl animate-in fade-in zoom-in">
                        <div className="relative w-20 h-20 mx-auto mb-6"><div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div><div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div><Loader2 className="absolute inset-0 m-auto text-blue-600 animate-pulse" size={32} /></div>
                        <h3 className="text-2xl font-black text-slate-800 mb-2">Analyzing Label...</h3><p className="text-slate-500 font-medium">Extracting dosage & checking safety</p>
                    </div>
                )}
                {result && !loading && (<ResultCard result={result} />)}
            </main>
            {result && <ChatBot contextData={result} />}
        </div>
    );
}
export default App;