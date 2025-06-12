export function LoadingScreen() {
    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 opacity-50"></div>
            <div className="relative z-10 flex flex-col items-center space-y-4">
                <div className="w-12 h-12 border-2 border-t-transparent border-blue-400 rounded-full animate-spin shadow-[0_0_15px_rgba(96,165,250,0.3)]"></div>
                <div className="text-xl font-light tracking-wide bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent animate-pulse">Loading...</div>
            </div>
        </div>
    );
}