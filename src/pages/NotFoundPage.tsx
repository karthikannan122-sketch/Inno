import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Home, ArrowLeft } from 'lucide-react';
import { SlideUp } from '../components/common/MotionWrapper';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <SlideUp>
        <div className="bg-white rounded-3xl border border-[#E5E0D6] p-8 sm:p-12 max-w-lg w-full text-center space-y-6 shadow-card">
          <div className="w-16 h-16 rounded-2xl bg-[#5577E6]/10 text-[#5577E6] flex items-center justify-center mx-auto">
            <Compass className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <div className="text-[11px] font-mono tracking-widest text-[#E96B7A] uppercase font-bold">
              404 / UNCHARTED COORDINATES
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#181924]">
              Page Not Found
            </h1>
            <p className="text-xs sm:text-sm text-[#555768] leading-relaxed">
              The innovation specimen or route you are attempting to locate does not exist or has moved.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 bg-[#F7F4EE] hover:bg-white text-[#181924] border border-[#E5E0D6] px-5 py-2.5 rounded-xl text-xs font-mono font-bold tracking-wider transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>GO BACK</span>
            </button>
            <button
              onClick={() => navigate('/home')}
              className="flex items-center gap-2 bg-[#E96B7A] hover:bg-[#DE5565] text-white px-6 py-2.5 rounded-xl text-xs font-mono font-bold tracking-wider transition-all shadow-sm"
            >
              <Home className="w-3.5 h-3.5" />
              <span>RETURN HOME</span>
            </button>
          </div>
        </div>
      </SlideUp>
    </div>
  );
};
export default NotFoundPage;
