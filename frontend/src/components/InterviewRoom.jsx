import { JitsiMeeting } from '@jitsi/react-sdk';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Clock, Layout } from 'lucide-react';

const InterviewRoom = ({ roomName, displayName, onEndCall }) => {
    const [timer, setTimer] = useState(0);
    const [isMuted, setIsMuted] = useState(true);
    const [isVideoOff, setIsVideoOff] = useState(true);
    const [api, setApi] = useState(null);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimer(prev => prev + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleApiReady = (jitsiApi) => {
        setApi(jitsiApi);
        jitsiApi.addEventListener('videoConferenceLeft', onEndCall);
    };

    return (
        <div className="flex flex-col h-screen bg-[#05070a] text-white">
            {/* Header */}
            <header className="h-16 border-b border-white/5 bg-white/5 backdrop-blur-md flex items-center justify-between px-8 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-black">TS</div>
                    <div>
                        <h2 className="text-sm font-black tracking-widest uppercase">Live Interview</h2>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">{roomName}</p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10">
                        <Clock size={14} className="text-indigo-400" />
                        <span className="text-sm font-black font-mono">{formatTime(timer)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-500 text-[10px] font-black uppercase tracking-widest">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        Live
                    </div>
                </div>
            </header>

            {/* Video Area */}
            <main className="flex-1 relative bg-black overflow-hidden">
                <JitsiMeeting
                    domain="meet.jit.si"
                    roomName={roomName}
                    configOverwrite={{
                        startWithAudioMuted: true,
                        startWithVideoMuted: true,
                        disableModeratorIndicator: true,
                        startScreenSharing: false,
                        enableEmailInStats: false,
                        prejoinPageEnabled: false,
                        toolbarButtons: []
                    }}
                    interfaceConfigOverwrite={{
                        DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
                        TOOLBAR_BUTTONS: []
                    }}
                    userInfo={{
                        displayName: displayName
                    }}
                    onApiReady={handleApiReady}
                    getIFrameRef={(iframeRef) => { iframeRef.style.height = '100%'; iframeRef.style.width = '100%'; }}
                />

                {/* Status Overlays could go here */}
            </main>

            {/* Controls */}
            <footer className="h-24 bg-white/5 backdrop-blur-xl border-t border-white/5 flex items-center justify-center gap-4 px-8 shrink-0">
                <button
                    onClick={() => {
                        api?.executeCommand('toggleAudio');
                        setIsMuted(!isMuted);
                    }}
                    className={`p-4 rounded-2xl transition-all ${isMuted ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-white/5 text-white border-white/10'} border hover:scale-105`}
                >
                    {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                </button>

                <button
                    onClick={() => {
                        api?.executeCommand('toggleVideo');
                        setIsVideoOff(!isVideoOff);
                    }}
                    className={`p-4 rounded-2xl transition-all ${isVideoOff ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-white/5 text-white border-white/10'} border hover:scale-105`}
                >
                    {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
                </button>

                <div className="w-px h-8 bg-white/10 mx-2"></div>

                <button
                    onClick={() => api?.executeCommand('toggleShareScreen')}
                    className="p-4 rounded-2xl bg-white/5 text-white border border-white/10 hover:bg-white/10 transition-all"
                >
                    <Layout size={24} />
                </button>

                <button
                    onClick={() => {
                        api?.executeCommand('hangup');
                        onEndCall();
                    }}
                    className="p-4 rounded-2xl bg-red-600 text-white border border-red-500/20 hover:bg-red-700 hover:scale-110 transition-all ml-4 shadow-lg shadow-red-600/20"
                >
                    <PhoneOff size={24} />
                </button>
            </footer>
        </div>
    );
};

export default InterviewRoom;
