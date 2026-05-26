import React from 'react';
import { motion } from 'motion/react';

interface CharacterProps {
  type: 'PLAYER' | 'AO_ONI';
  isHiding?: boolean;
  isActive?: boolean;
  oniType?: 'NORMAL' | 'FUWATTY' | 'BLOCK' | 'GIANT';
  speech?: string;
}

export const Character: React.FC<CharacterProps> = ({ type, isHiding, isActive, oniType = 'NORMAL', speech }) => {
  if (isHiding && type === 'PLAYER') return null;

  const isPlayer = type === 'PLAYER';

  if (!isPlayer) {
    // Eerily shake or bounce more depending on the variant type
    const bounceY = oniType === 'FUWATTY' ? [0, -1, 0, 1, 0] : [0, -2, 0];
    const bounceScale = oniType === 'BLOCK' ? [1, 1.08, 0.95, 1.02, 1] : [1, 1.02, 1];
    const animDuration = oniType === 'FUWATTY' ? 0.2 : (oniType === 'GIANT' ? 0.6 : 0.4);

    return (
      <motion.div
        layoutId={type}
        className={`relative flex flex-col items-center justify-center ${isActive ? 'animate-jitter' : ''}`}
        style={{ width: 44, height: 50 }}
        animate={{
          y: bounceY,
          scale: bounceScale,
        }}
        transition={{
          duration: animDuration,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {/* Creepy Periodical Speech Bubble */}
        {speech && (
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-950 text-red-500 border border-red-900/80 px-2 py-0.5 rounded text-[9px] font-extrabold font-mono tracking-wider shadow-[0_0_12px_rgba(239,68,68,0.5)] whitespace-nowrap z-[120] animate-bounce">
            {speech}
            <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-slate-950 border-r border-b border-red-900/80 rotate-45" />
          </div>
        )}

        {/* VARIANT 1: NORMAL BLUEBERRY ONI */}
        {oniType === 'NORMAL' && (
          <>
            {/* Huge Head (Blueberry color) */}
            <div className="w-11 h-12 bg-indigo-700 rounded-[45%_45%_35%_35%] border-2 border-indigo-900 relative z-20 overflow-hidden shadow-2xl">
              {/* Asymmetrical Creepy Eyes */}
              <div className="absolute top-3 left-0 w-full flex justify-around items-center px-1">
                {/* Left Eye: Bulging */}
                <div className="w-3.5 h-3.5 bg-black rounded-full border border-slate-500 relative flex items-center justify-center">
                   <div className="w-1.5 h-1.5 bg-white/60 rounded-full blur-[1px]" />
                   <div className="absolute top-0.5 right-0.5 w-1 h-1 bg-white rounded-full scale-110" />
                </div>
                {/* Right Eye: Smaller, different shape */}
                <div className="w-2.5 h-3 bg-black rounded-[40%_60%_50%_50%] border border-slate-600 relative mt-1">
                   <div className="absolute top-1 right-0.5 w-0.5 h-0.5 bg-white/30 rounded-full" />
                </div>
              </div>

              {/* Nose - slightly hooked */}
              <div className="absolute top-6 left-1/2 -translate-x-1/2 w-2 h-3.5 bg-indigo-900/40 rounded-[30%_30%_50%_50%] border-b border-indigo-950/20" />
              
              {/* Mouth with Fangs detail */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-6 h-2 bg-black/60 rounded-full flex justify-around items-start pt-0.5 px-1 overflow-hidden">
                 <div className="w-1 h-2 bg-white/80 clip-path-triangle rotate-12" />
                 <div className="w-1 h-1.5 bg-white/80 clip-path-triangle -rotate-12 mt-0.5" />
                 <div className="w-1 h-2 bg-white/80 clip-path-triangle" />
              </div>
              
              {/* Skin texture/shading */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
            </div>
            
            {/* Tiny Purple Body - emphasizing the giant head ratio */}
            <div className="w-5 h-5 bg-indigo-800 rounded-b-lg border-x-2 border-b-2 border-indigo-950 -mt-2.5 z-10 relative">
               {/* Tiny Arms */}
               <div className="absolute top-1 -left-2 w-2 h-3 bg-indigo-800 rounded-full -rotate-45 border border-indigo-950" />
               <div className="absolute top-1 -right-2 w-2 h-3 bg-indigo-800 rounded-full rotate-45 border border-indigo-950" />
            </div>
          </>
        )}

        {/* VARIANT 2: FUWATTY (フワッティー) - Flat blocky sliding horror */}
        {oniType === 'FUWATTY' && (
          <div className="w-12 h-12 bg-indigo-600 rounded-xl border-[3px] border-indigo-900 relative z-20 overflow-hidden shadow-2xl flex flex-col justify-between p-1">
            {/* Staring red/yellow maddening eyes */}
            <div className="flex justify-between items-center px-1 mt-1.5">
              <div className="w-3.5 h-3.5 bg-red-650 rounded-full border border-black flex items-center justify-center animate-ping duration-1000">
                <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full flex items-center justify-center">
                  <div className="w-1 h-1 bg-black rounded-full" />
                </div>
              </div>
              <div className="w-3.5 h-3.5 bg-red-650 rounded-full border border-black flex items-center justify-center">
                <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full flex items-center justify-center">
                  <div className="w-1 h-1 bg-black rounded-full" />
                </div>
              </div>
            </div>

            {/* Jagged creepy teeth mouth */}
            <div className="w-10 h-4 bg-black/90 rounded-md border border-neutral-900/60 flex items-center justify-around overflow-hidden mb-1">
              <div className="w-1.5 h-2.5 bg-white rounded-b-sm" />
              <div className="w-1.5 h-1.5 bg-white rounded-b-sm" />
              <div className="w-1.5 h-2 bg-white rounded-b-sm" />
              <div className="w-1.5 h-1.5 bg-white rounded-b-sm" />
              <div className="w-1.5 h-2.5 bg-white rounded-b-sm" />
            </div>
          </div>
        )}

        {/* VARIANT 3: BLOCK (スクワット鬼) - Muscular Oni executing high-intensity squats */}
        {oniType === 'BLOCK' && (
          <>
            {/* Head with thick flexing eyebrows */}
            <div className="w-10 h-10 bg-indigo-800 rounded-lg border-2 border-indigo-950 relative z-20 flex flex-col items-center">
              {/* Thick Unibrow Eyebrow */}
              <div className="w-8 h-1.5 bg-neutral-950 rounded mt-1.5" />
              {/* Angry slanted eyes */}
              <div className="flex justify-around w-full px-1.5 mt-0.5">
                <div className="w-2.5 h-2.5 bg-white rounded-full flex items-center justify-center">
                  <div className="w-1 h-1 bg-red-600 rounded-full" />
                </div>
                <div className="w-2.5 h-2.5 bg-white rounded-full flex items-center justify-center">
                  <div className="w-1 h-1 bg-red-600 rounded-full" />
                </div>
              </div>
              {/* Open roaring mouth */}
              <div className="w-4 h-2 bg-red-950 border border-neutral-900 rounded-b mt-1 flex items-center justify-center">
                <div className="w-1.5 h-1 bg-white" />
              </div>
            </div>

            {/* Buff Flexing Arms & Muscular broad body */}
            <div className="w-9 h-4 bg-indigo-900 border-x-2 border-b-2 border-indigo-950 rounded-b-md relative -mt-1.5 z-10 flex justify-between px-0.5">
              {/* Flexing massive biceps */}
              <div className="w-2.5 h-4 bg-indigo-750 border border-indigo-950 rounded-l animate-pulse flex-none -rotate-12 -ml-2" />
              <div className="w-2.5 h-4 bg-indigo-750 border border-indigo-950 rounded-r animate-pulse flex-none rotate-12 -mr-2" />
            </div>
          </>
        )}

        {/* VARIANT 4: GIANT (巨頭鬼) - Extremely oversized head, wobbling slowly */}
        {oniType === 'GIANT' && (
          <>
            {/* Hyper-Oversized Giant head */}
            <div className="w-13 h-13 bg-indigo-800 rounded-[50%_50%_40%_40%] border-[2.5px] border-indigo-950 relative z-20 overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.8)]">
              {/* Eyes looking extremely low-spirited or sleepy */}
              <div className="absolute top-4 left-0 w-full flex justify-around px-2">
                <div className="w-4 h-2 bg-black rounded-t-full relative">
                  <div className="absolute bottom-0 left-1 w-1.5 h-1 bg-white rounded-full" />
                </div>
                <div className="w-4 h-2 bg-black rounded-t-full relative">
                  <div className="absolute bottom-0 right-1 w-1.5 h-1 bg-white rounded-full" />
                </div>
              </div>

              {/* Nose */}
              <div className="absolute top-6 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-neutral-900/50 rounded-full" />

              {/* Sad, closed flat mouth */}
              <div className="w-6 h-0.5 bg-neutral-950 absolute bottom-3.5 left-1/2 -translate-x-1/2" />
            </div>

            {/* Completely microscopic dwarf body */}
            <div className="w-3 h-3 bg-indigo-900 border border-indigo-950 rounded-b -mt-1 z-10" />
          </>
        )}
        
        {/* Shadow */}
        <div className="absolute -bottom-1 w-8 h-2 bg-black/40 rounded-full blur-sm -z-10" />
      </motion.div>
    );
  }

  return (
    <motion.div
      layoutId={type}
      className={`relative flex items-center justify-center`}
      style={{ width: 40, height: 40 }}
      initial={false}
      animate={{
        scale: type === 'AO_ONI' ? [1, 1.05, 1] : 1,
      }}
      transition={{
        duration: 0.5,
        repeat: type === 'AO_ONI' ? Infinity : 0,
      }}
    >
      {/* Body */}
      <div 
        className={`w-full h-full rounded-md shadow-lg border-2 ${
          isPlayer ? 'bg-blue-600 border-blue-400' : 'bg-indigo-900 border-indigo-700'
        }`}
        id={isPlayer ? "hiroshi-body" : "ao-oni-body"}
      >
        {/* Face */}
        <div className="flex flex-col items-center justify-center mt-1 space-y-2">
          {/* Eyes */}
          <div className="flex space-x-3">
             <div className={`w-2 h-2 rounded-full ${isPlayer ? 'bg-white' : 'bg-white animate-pulse shadow-[0_0_8px_white]'}`} />
             <div className={`w-2 h-2 rounded-full ${isPlayer ? 'bg-white' : 'bg-white animate-pulse shadow-[0_0_8px_white]'}`} />
          </div>
          {/* Mouth/Detail */}
          {!isPlayer && (
             <div className="w-4 h-1 bg-black rounded-full opacity-50" />
          )}
        </div>
      </div>
      
      {/* Shadow */}
      <div className="absolute -bottom-1 w-full h-2 bg-black/30 rounded-full blur-sm -z-10" />
    </motion.div>
  );
};
