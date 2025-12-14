import React, { useRef, useState, useEffect } from 'react';
import { Camera, ScanLine } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CameraCapture = ({ onCapture }) => {
    const videoRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [flash, setFlash] = useState(false); // Flash state

    useEffect(() => {
        startCamera();
        return () => stopCamera();
    }, []);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            setStream(mediaStream);
            if (videoRef.current) videoRef.current.srcObject = mediaStream;
        } catch (err) {
            console.error("Error accessing camera:", err);
            alert("Camera access denied or not available.");
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const handleCapture = () => {
        if (videoRef.current) {
            // 1. Trigger Flash Effect
            setFlash(true);
            setTimeout(() => setFlash(false), 150);

            // 2. Capture Frame
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(videoRef.current, 0, 0);
            
            // 3. Send to Parent (Start Analysis)
            canvas.toBlob((blob) => {
                // Short delay to let the flash animation finish before UI changes
                setTimeout(() => onCapture(blob), 200);
            }, 'image/jpeg', 0.95);
        }
    };

    return (
        <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative w-full h-full min-h-[480px] bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-800"
        >
            {/* Flash Effect Overlay */}
            <AnimatePresence>
                {flash && (
                    <motion.div 
                        initial={{ opacity: 0.8 }} 
                        animate={{ opacity: 0 }} 
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 bg-white z-50 pointer-events-none"
                    />
                )}
            </AnimatePresence>

            {/* Video Feed */}
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
            />

            {/* Scanning Overlay (Only visible when not flashing) */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-6 left-6 w-12 h-12 border-t-4 border-l-4 border-teal-500/80 rounded-tl-2xl" />
                <div className="absolute top-6 right-6 w-12 h-12 border-t-4 border-r-4 border-teal-500/80 rounded-tr-2xl" />
                <div className="absolute bottom-6 left-6 w-12 h-12 border-b-4 border-l-4 border-teal-500/80 rounded-bl-2xl" />
                <div className="absolute bottom-6 right-6 w-12 h-12 border-b-4 border-r-4 border-teal-500/80 rounded-br-2xl" />
                
                <div className="absolute left-0 w-full h-1 bg-gradient-to-r from-transparent via-teal-400 to-transparent shadow-[0_0_20px_rgba(45,212,191,0.6)] animate-scan z-10" />
            </div>

            {/* Capture Button */}
            <div className="absolute bottom-8 w-full flex justify-center items-center z-20">
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleCapture}
                    className="bg-white/90 backdrop-blur-md p-1 rounded-full shadow-lg shadow-teal-500/30 group"
                >
                    <div className="bg-teal-600 group-hover:bg-teal-500 transition-colors rounded-full p-5 border-4 border-white">
                        <Camera size={32} className="text-white" />
                    </div>
                </motion.button>
            </div>
        </motion.div>
    );
};

export default CameraCapture;