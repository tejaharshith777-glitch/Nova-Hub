import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#c4e4e3] flex flex-col items-center justify-center font-mono text-[#1a1a1a] px-8 text-center">
      <div className="text-[10rem] leading-none mb-4">💀</div>
      <h1 className="text-8xl font-black font-display uppercase tracking-tight mb-4">404</h1>
      <p className="text-2xl font-bold mb-2">Page Not Found</p>
      <p className="text-sm opacity-60 mb-12">The page you're looking for doesn't exist or was moved.</p>
      <div className="flex gap-4 flex-wrap justify-center">
        <button
          onClick={() => navigate('/')}
          className="bg-yellow-200 border-[3px] border-[#1a1a1a] px-8 py-4 font-bold uppercase shadow-[6px_6px_0px_rgba(26,26,26,1)] hover:shadow-[2px_2px_0px_rgba(26,26,26,1)] hover:translate-x-1 hover:translate-y-1 transition-all"
        >
          Go Home
        </button>
        <button
          onClick={() => navigate(-1)}
          className="bg-white border-[3px] border-[#1a1a1a] px-8 py-4 font-bold uppercase shadow-[6px_6px_0px_rgba(26,26,26,1)] hover:shadow-[2px_2px_0px_rgba(26,26,26,1)] hover:translate-x-1 hover:translate-y-1 transition-all"
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

export default NotFound;
