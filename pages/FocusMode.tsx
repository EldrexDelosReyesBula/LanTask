
import React, { useState, useEffect } from 'react';
import { UserSettings } from '../types';

interface FocusModeProps {
  timeLeft: number;
  isActive: boolean;
  mode: 'focus' | 'break';
  totalTime: number;
  onToggle: () => void;
  onReset: () => void;
  onSetMode: (mode: 'focus' | 'break', time: number) => void;
  settings: UserSettings;
  onUpdateSettings: (s: UserSettings) => void;
  isImmersive: boolean;
  onToggleImmersive: (isImmersive: boolean) => void;
  intent: string;
  onIntentChange: (intent: string) => void;
}

const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
  <button 
    onClick={() => onChange(!checked)}
    className={`w-12 h-7 rounded-full relative transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 ${checked ? 'bg-[var(--primary)]' : 'bg-[var(--outline-variant)]/50'}`}
  >
    <div className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-all duration-300 shadow-sm ${checked ? 'left-6' : 'left-1'}`} />
  </button>
);

export const FocusMode: React.FC<FocusModeProps> = ({ 
  timeLeft, 
  isActive, 
  mode, 
  totalTime,
  onToggle, 
  onReset, 
  onSetMode,
  settings,
  onUpdateSettings,
  isImmersive,
  onToggleImmersive,
  intent,
  onIntentChange
}) => {
  const [showBreathing, setShowBreathing] = useState(false);
  
  // Flip State: true = Show Intent as Main, Time as Label. false = Show Time as Main, Intent as Label
  const [showIntentMain, setShowIntentMain] = useState(false);

  // Duration Input State
  const hours = Math.floor(settings.focusDuration / 3600);
  const minutes = Math.floor((settings.focusDuration % 3600) / 60);
  const seconds = settings.focusDuration % 60;

  const updateDuration = (h: number, m: number, s: number) => {
      const total = (h * 3600) + (m * 60) + s;
      onUpdateSettings({ ...settings, focusDuration: total });
  };
  
  // Quotes for immersive mode
  const quotes = [
    "Focus on being productive instead of busy.",
    "The secret of getting ahead is getting started.",
    "Do one thing at a time.",
    "Your future is created by what you do today.",
    "Deep work is the ability to focus without distraction.",
    "The only way to do great work is to love what you do.",
    "Don't watch the clock; do what it does. Keep going.",
    "The future depends on what you do today.",
    "It always seems impossible until it's done.",
    "Success is not final, failure is not fatal.",
    "What you get by achieving your goals is not as important as what you become.",
    "Believe you can and you're halfway there.",
    "Your time is limited, don't waste it living someone else's life.",
    "The only place where success comes before work is in the dictionary.",
    "Don't be pushed by your problems. Be led by your dreams.",
    "The harder you work for something, the greater you'll feel when you achieve it.",
    "Dream it. Believe it. Build it.",
    "Little by little, one travels far.",
    "Motivation is what gets you started. Habit is what keeps you going.",
    "Make today so amazing that yesterday gets jealous.",
    "The only person you are destined to become is the person you decide to be.",
    "Start where you are. Use what you have. Do what you can.",
    "It's not whether you get knocked down, it's whether you get up.",
    "Everything you've ever wanted is on the other side of fear.",
    "Success is walking from failure to failure with no loss of enthusiasm.",
    "If opportunity doesn't knock, build a door.",
    "You don't have to be great to start, but you have to start to be great.",
    "The best time to plant a tree was 20 years ago. The second best time is now.",
    "Your positive action combined with positive thinking results in success.",
    "What you do today can improve all your tomorrows.",
    "The only limit to our realization of tomorrow is our doubts of today.",
    "If you want to achieve greatness stop asking for permission.",
    "The difference between ordinary and extraordinary is that little extra.",
    "Well done is better than well said.",
    "Hardships often prepare ordinary people for an extraordinary destiny.",
    "I find that the harder I work, the more luck I seem to have.",
    "Don't let yesterday take up too much of today.",
    "You are never too old to set another goal or to dream a new dream.",
    "If you can dream it, you can do it.",
    "Success is not how high you have climbed, but how you make a positive difference to the world.",
    "The only way to achieve the impossible is to believe it is possible.",
    "Quality is not an act, it is a habit.",
    "I never dreamed about success, I worked for it.",
    "Try to be a rainbow in someone else's cloud.",
    "Do what you can, with what you have, where you are.",
    "The secret of getting ahead is getting started.",
    "It does not matter how slowly you go as long as you do not stop.",
    "Act as if what you do makes a difference. It does.",
    "Keep your eyes on the stars, and your feet on the ground.",
    "The only person you should try to be better than is the person you were yesterday.",
    "Never let the fear of striking out keep you from playing the game.",
    "The future belongs to those who believe in the beauty of their dreams.",
    "You miss 100% of the shots you don't take.",
    "What lies behind us and what lies before us are tiny matters compared to what lies within us.",
    "Success usually comes to those who are too busy to be looking for it.",
    "If you're going through hell, keep going.",
    "Don't wait. The time will never be just right.",
    "Whether you think you can or you think you can't, you're right.",
    "The only thing standing between you and your goal is the story you keep telling yourself.",
    "The most effective way to do it, is to do it.",
    "I have not failed. I've just found 10,000 ways that won't work.",
    "The best way to predict the future is to create it.",
    "Our greatest glory is not in never falling, but in rising every time we fall.",
    "You are braver than you believe, stronger than you seem, and smarter than you think.",
    "Do what you have to do until you can do what you want to do.",
    "Success is the sum of small efforts, repeated day in and day out.",
    "Don't count the days, make the days count.",
    "You didn't come this far to only come this far.",
    "Be so good they can't ignore you.",
    "Your passion is waiting for your courage to catch up.",
    "Magic is believing in yourself. If you can do that, you can make anything happen.",
    "If it doesn't challenge you, it doesn't change you.",
    "The only easy day was yesterday.",
    "What you lack in talent can be made up with desire, hustle, and giving 110% all the time.",
    "The most important thing is to enjoy your life - to be happy - it's all that matters.",
    "Work hard in silence, let your success be your noise.",
    "Don't be afraid to give up the good to go for the great.",
    "Some people want it to happen, some wish it would happen, others make it happen.",
    "Great things never come from comfort zones.",
    "A little progress each day adds up to big results.",
    "You don't need to see the whole staircase, just take the first step.",
    "The expert in anything was once a beginner.",
    "Success isn't just about what you accomplish in your life, it's about what you inspire others to do.",
    "The way to get started is to quit talking and begin doing.",
    "Don't wish it were easier. Wish you were better.",
    "The pain you feel today will be the strength you feel tomorrow.",
    "Fall seven times, stand up eight.",
    "Your only limit is your mind.",
    "Dream big and dare to fail.",
    "It's going to be hard, but hard does not mean impossible.",
    "Stay focused and never give up.",
    "Push yourself, because no one else is going to do it for you.",
    "Great things never come from comfort zones.",
    "You have to expect things of yourself before you can do them.",
    "The only way to do great work is to love what you do.",
    "Don't be the same, be better.",
    "The difference between try and triumph is a little umph.",
    "All progress takes place outside the comfort zone.",
    "Success is not in what you have, but who you are.",
    "Make each day your masterpiece.",
    "You are stronger than you think.",
];
  const [quote] = useState(quotes[Math.floor(Math.random() * quotes.length)]);

  // Format MM:SS or HH:MM:SS
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    
    if (h > 0) {
        return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleFullscreenToggle = () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch((e) => console.log(e));
        onToggleImmersive(true);
    } else {
        document.exitFullscreen();
        onToggleImmersive(false);
    }
  };
  
  const handleExitImmersive = () => {
      if (document.fullscreenElement) {
          document.exitFullscreen();
      }
      onToggleImmersive(false);
  };

  // Sync Timer with Settings if not active
  useEffect(() => {
    if (!isActive && mode === 'focus' && timeLeft !== settings.focusDuration) {
        onSetMode('focus', settings.focusDuration);
    }
  }, [settings.focusDuration]);

  // Flip Logic Loop
  useEffect(() => {
      let interval: any;
      if (isActive && settings.focusFlipMode && intent.trim().length > 0) {
          interval = setInterval(() => {
              setShowIntentMain(prev => !prev);
          }, settings.focusFlipInterval * 1000);
      } else {
          setShowIntentMain(false);
      }
      return () => clearInterval(interval);
  }, [isActive, settings.focusFlipMode, settings.focusFlipInterval, intent]);

  const hasIntent = intent.trim().length > 0;
  const mainContent = hasIntent && showIntentMain ? intent : formatTime(timeLeft);
  const labelContent = hasIntent 
      ? (showIntentMain ? formatTime(timeLeft) : intent) 
      : (mode === 'focus' ? 'Deep Work' : 'Rest & Recover'); 

  const isShowingTimeMain = !hasIntent || !showIntentMain;

  // --- IMMERSIVE VIEW (Theme Colored) ---
  if (isImmersive) {
     if (showBreathing) {
        return (
        <div className="flex flex-col items-center justify-center h-full min-h-screen bg-[var(--primary)] text-[var(--on-primary)] animate-slide-up relative z-50 transition-colors duration-500">
            <button onClick={() => setShowBreathing(false)} className="absolute top-8 right-8 p-4 text-[var(--on-primary)]/70 hover:text-[var(--on-primary)]">
                <span className="material-symbols-outlined text-3xl">close</span>
            </button>
            <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--on-primary)]/70 mb-12">Breathing Exercise</h2>
            <div className="relative w-64 h-64 flex items-center justify-center">
                <div className="absolute inset-0 bg-white/20 rounded-full animate-[ping_4s_ease-in-out_infinite]"></div>
                <div className="absolute inset-4 bg-white/10 rounded-full animate-[pulse_4s_ease-in-out_infinite]"></div>
                <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center text-[var(--primary)] shadow-xl z-10">
                    <span className="material-symbols-outlined text-5xl">air</span>
                </div>
            </div>
            <div className="mt-12 text-center">
                <p className="text-2xl font-display font-medium text-[var(--on-primary)] mb-2">Inhale... Exhale</p>
            </div>
        </div>
        );
     }

     return (
        <div className="flex flex-col items-center justify-center min-h-screen w-full bg-[var(--primary)] text-[var(--on-primary)] animate-slide-up relative z-50 transition-colors duration-500 overflow-hidden">
          
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
              <div className="absolute -top-20 -right-20 w-[50vh] h-[50vh] bg-white rounded-full blur-[100px] animate-[pulse_8s_ease-in-out_infinite]"></div>
              <div className="absolute bottom-0 left-0 w-[40vh] h-[40vh] bg-black rounded-full blur-[80px]"></div>
          </div>

          {!isActive && (
              <button 
                onClick={handleExitImmersive}
                className="absolute top-8 right-8 p-3 bg-white/20 rounded-full text-[var(--on-primary)] hover:bg-white/30 hover:scale-110 transition-all flex items-center gap-2 backdrop-blur-sm z-50"
                title="Exit Fullscreen"
              >
                  <span className="material-symbols-outlined text-3xl">close_fullscreen</span>
              </button>
          )}

           {isActive && hasIntent && (
               <button 
                onClick={() => setShowIntentMain(prev => !prev)}
                className="absolute top-8 left-8 p-3 bg-white/10 rounded-full text-[var(--on-primary)] hover:bg-white/20 transition-all z-50"
                title="Flip Display"
               >
                   <span className="material-symbols-outlined">swap_vert</span>
               </button>
           )}
    
          <div className="text-center mb-8 opacity-80 px-4 h-8 z-10 relative">
             <div key={labelContent} className="animate-enter">
                 <span className="text-xs md:text-sm font-bold tracking-[0.2em] uppercase">
                    {labelContent}
                 </span>
             </div>
          </div>
    
          <div className="relative flex items-center justify-center w-full px-4 z-10 min-h-[30vh]">
            <div key={showIntentMain ? 'intent' : 'time'} className="animate-flip-in text-center">
                {isShowingTimeMain ? (
                    <h1 className="text-[18vw] md:text-[14rem] leading-none font-display font-bold text-[var(--on-primary)] tabular-nums tracking-tighter drop-shadow-lg select-none">
                        {mainContent}
                    </h1>
                ) : (
                    <h1 className="text-4xl md:text-7xl lg:text-8xl leading-tight font-display font-bold text-[var(--on-primary)] max-w-5xl drop-shadow-lg break-words">
                        {mainContent}
                    </h1>
                )}
            </div>
          </div>
    
          {isShowingTimeMain && settings.focusQuotes && (
            <div className="min-h-[60px] flex items-center justify-center z-10 mt-8 mb-4">
                <p className="text-[var(--on-primary)]/80 italic text-base md:text-xl text-center max-w-2xl px-4 animate-enter font-medium">
                    "{quote}"
                </p>
            </div>
          )}
    
          <div className="flex items-center gap-6 md:gap-10 mt-12 z-10">
             <button 
                onClick={() => onSetMode(mode, timeLeft + 300)}
                className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-white/10 text-[var(--on-primary)] hover:bg-white/20 hover:scale-110 transition-all flex items-center justify-center font-bold backdrop-blur-md shadow-sm active:scale-95"
                title="Add 5 Minutes"
             >
                +5
            </button>

            <button 
              onClick={onToggle}
              className={`h-24 w-24 md:h-28 md:w-28 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ease-spring hover:scale-105 active:scale-95 ${
                isActive 
                    ? 'bg-white text-[var(--primary)]' 
                    : 'bg-[var(--on-primary)] text-[var(--primary)]'
              }`}
            >
              <span className="material-symbols-outlined text-5xl md:text-6xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                {isActive ? 'pause' : 'play_arrow'}
              </span>
            </button>
    
            <button 
              onClick={onReset}
              className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center bg-transparent border-2 border-[var(--on-primary)]/30 text-[var(--on-primary)] hover:border-[var(--on-primary)] hover:scale-110 transition-all active:scale-95 hover:bg-white/5"
              title="Stop"
            >
              <span className="material-symbols-outlined text-2xl md:text-3xl">stop</span>
            </button>
          </div>

          {!isActive && (
            <div className={`mt-12 transition-all duration-500 z-10`}>
                <button onClick={() => setShowBreathing(true)} className="text-sm font-bold text-[var(--on-primary)] hover:bg-white/10 px-6 py-3 rounded-full uppercase tracking-wider transition-colors border border-white/20">
                    Breathing Exercise
                </button>
            </div>
          )}

          {isActive && (
              <div className="fixed bottom-8 flex flex-col items-center gap-2 animate-pulse text-[var(--on-primary)]/60 z-10">
                 <span className="material-symbols-outlined text-[20px]">lock</span>
                 <p className="text-[10px] uppercase tracking-[0.2em]">Focus Mode Locked</p>
              </div>
          )}
        </div>
      );
  }

  // --- DASHBOARD VIEW (Normal) ---
  return (
    <div className="w-full max-w-4xl mx-auto animate-slide-up space-y-6">
       
       {/* Timer Card */}
       <div className="w-full bg-[var(--primary)] rounded-[32px] p-6 md:p-12 text-[var(--on-primary)] relative overflow-hidden shadow-lg transition-colors duration-500 min-h-[40vh] md:min-h-[450px] flex flex-col items-center justify-center group">
           
           <div className="relative z-10 flex flex-col items-center justify-center text-center w-full">
                
                {/* Header Label Flip */}
                <div key={labelContent} className="mb-4 opacity-80 animate-enter h-6">
                     <span className="text-xs md:text-sm font-bold tracking-[0.2em] uppercase">
                        {labelContent}
                     </span>
                </div>

                {/* Main Display Flip */}
                <div key={showIntentMain ? 'intent-dash' : 'time-dash'} className="animate-flip-in mb-8 md:mb-10 min-h-[100px] flex items-center justify-center">
                    {isShowingTimeMain ? (
                        <h1 className="text-6xl md:text-[10rem] font-display font-bold tabular-nums tracking-tighter leading-none drop-shadow-sm select-none">
                            {mainContent}
                        </h1>
                    ) : (
                        <h1 className="text-3xl md:text-6xl font-display font-bold leading-tight drop-shadow-sm max-w-2xl break-words px-2">
                            {mainContent}
                        </h1>
                    )}
                </div>

                {/* Controls */}
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-2 rounded-full flex items-center gap-2 shadow-inner transition-transform hover:scale-[1.01] max-w-full overflow-x-auto no-scrollbar">
                    <button 
                        onClick={() => onSetMode(mode, timeLeft + 300)}
                        className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white font-bold text-sm transition-all active:scale-95 shrink-0"
                        title="Add 5 Minutes"
                    >
                        +5
                    </button>
                    
                    <div className="h-8 w-px bg-white/20 mx-1 shrink-0"></div>

                    <button 
                        onClick={onToggle}
                        className="h-12 px-6 md:px-8 bg-white text-[var(--primary)] rounded-full font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors active:scale-95 shadow-sm min-w-[120px] md:min-w-[140px] shrink-0"
                    >
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                            {isActive ? 'pause' : 'play_arrow'}
                        </span>
                        <span>{isActive ? 'Pause' : 'Start'}</span>
                    </button>
                    
                    <button 
                        onClick={handleFullscreenToggle}
                        className="h-12 w-12 hover:bg-white/10 text-white rounded-full font-bold flex items-center justify-center transition-colors active:scale-95 shrink-0"
                        title="Fullscreen"
                    >
                        <span className="material-symbols-outlined">fullscreen</span>
                    </button>

                    {isActive && (
                        <>
                         <div className="h-8 w-px bg-white/20 mx-1 shrink-0"></div>
                         <button 
                            onClick={onReset}
                            className="w-12 h-12 rounded-full hover:bg-red-500/20 text-white flex items-center justify-center transition-colors active:scale-95 shrink-0"
                            title="Stop Timer"
                         >
                             <span className="material-symbols-outlined">stop</span>
                         </button>
                        </>
                    )}
                </div>
                
                {/* Manual Flip (Dashboard) */}
                {isActive && hasIntent && (
                    <button 
                        onClick={() => setShowIntentMain(prev => !prev)}
                        className="mt-6 text-xs font-bold uppercase tracking-wider opacity-60 hover:opacity-100 transition-opacity flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full"
                    >
                        <span className="material-symbols-outlined text-sm">swap_vert</span>
                        Skip Flip
                    </button>
                )}
           </div>

           {/* Decorative Blur */}
           <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none transition-transform duration-[10s] group-hover:scale-110" />
           <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-black/10 rounded-full blur-3xl pointer-events-none transition-transform duration-[10s] group-hover:scale-110" />
       </div>

       {/* Configuration Section */}
       <div className="bg-[var(--surface-container)] rounded-[32px] p-5 md:p-8 border border-[var(--outline-variant)]/20 shadow-sm">
           <div className="space-y-6">
               
               {/* Custom Duration Input - Refined */}
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[var(--outline-variant)]/10">
                   <div>
                       <h3 className="font-bold text-on-surface text-sm">Focus Duration</h3>
                       <p className="text-xs text-on-surface-variant mt-1">Set your target deep work time</p>
                   </div>
                   <div className="flex items-center gap-2 bg-[var(--surface)] p-2 rounded-2xl border border-[var(--outline-variant)]/20 w-full md:w-auto justify-center">
                        {/* Hours */}
                        <div className="relative group">
                            <input 
                                type="number" min="0" max="23" placeholder="00"
                                value={hours.toString().padStart(2, '0')}
                                onChange={(e) => updateDuration(parseInt(e.target.value) || 0, minutes, seconds)}
                                disabled={isActive}
                                className="w-12 md:w-14 bg-transparent text-on-surface font-display font-bold text-xl md:text-2xl py-2 text-center focus:outline-none focus:text-[var(--primary)] disabled:opacity-50 transition-colors"
                            />
                            <span className="text-[9px] font-bold text-on-surface-variant uppercase absolute -bottom-1 left-0 right-0 text-center group-focus-within:text-[var(--primary)]">Hrs</span>
                        </div>
                        <span className="text-xl font-bold text-on-surface-variant/50 pb-2">:</span>
                        {/* Minutes */}
                        <div className="relative group">
                            <input 
                                type="number" min="0" max="59" placeholder="00"
                                value={minutes.toString().padStart(2, '0')}
                                onChange={(e) => updateDuration(hours, parseInt(e.target.value) || 0, seconds)}
                                disabled={isActive}
                                className="w-12 md:w-14 bg-transparent text-on-surface font-display font-bold text-xl md:text-2xl py-2 text-center focus:outline-none focus:text-[var(--primary)] disabled:opacity-50 transition-colors"
                            />
                             <span className="text-[9px] font-bold text-on-surface-variant uppercase absolute -bottom-1 left-0 right-0 text-center group-focus-within:text-[var(--primary)]">Min</span>
                        </div>
                        <span className="text-xl font-bold text-on-surface-variant/50 pb-2">:</span>
                        {/* Seconds */}
                        <div className="relative group">
                             <input 
                                type="number" min="0" max="59" placeholder="00"
                                value={seconds.toString().padStart(2, '0')}
                                onChange={(e) => updateDuration(hours, minutes, parseInt(e.target.value) || 0)}
                                disabled={isActive}
                                className="w-12 md:w-14 bg-transparent text-on-surface font-display font-bold text-xl md:text-2xl py-2 text-center focus:outline-none focus:text-[var(--primary)] disabled:opacity-50 transition-colors"
                            />
                             <span className="text-[9px] font-bold text-on-surface-variant uppercase absolute -bottom-1 left-0 right-0 text-center group-focus-within:text-[var(--primary)]">Sec</span>
                        </div>
                   </div>
               </div>

               {/* Session Intent Input */}
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[var(--outline-variant)]/10">
                   <div>
                       <h3 className="font-bold text-on-surface text-sm">Session Intent</h3>
                       <p className="text-xs text-on-surface-variant mt-1">What task are you tackling?</p>
                   </div>
                   <input 
                      type="text" 
                      placeholder="e.g. Write project proposal"
                      value={intent}
                      onChange={(e) => onIntentChange(e.target.value)}
                      className="bg-[var(--surface)] text-on-surface text-sm font-medium py-3 px-5 rounded-xl border border-[var(--outline-variant)]/30 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] w-full md:w-72 transition-all placeholder:text-on-surface-variant/50"
                   />
               </div>

                {/* Alternating Intent Display Config */}
                <div className="flex items-center justify-between pb-6 border-b border-[var(--outline-variant)]/10">
                   <div>
                       <h3 className="font-bold text-on-surface text-sm">Flip Display</h3>
                       <p className="text-xs text-on-surface-variant mt-1">Rotate Timer & Intent visibility</p>
                   </div>
                   <div className="flex items-center gap-4">
                       {settings.focusFlipMode && (
                           <div className="flex items-center gap-2 bg-[var(--surface)] rounded-lg p-1 border border-[var(--outline-variant)]/20">
                               <input 
                                    type="number" min="5" max="300" 
                                    value={settings.focusFlipInterval}
                                    onChange={(e) => onUpdateSettings({ ...settings, focusFlipInterval: parseInt(e.target.value) || 10 })}
                                    className="w-12 bg-transparent text-on-surface font-bold text-center text-sm focus:outline-none"
                                />
                                <span className="text-[10px] font-bold text-on-surface-variant pr-2">sec</span>
                           </div>
                       )}
                       <Toggle 
                            checked={settings.focusFlipMode} 
                            onChange={(v) => onUpdateSettings({...settings, focusFlipMode: v})} 
                       />
                   </div>
               </div>

               {/* Motivational Quotes Toggle */}
               <div className="flex items-center justify-between">
                   <div>
                       <h3 className="font-bold text-on-surface text-sm">Motivational Quotes</h3>
                       <p className="text-xs text-on-surface-variant mt-1">Inspire me during deep work</p>
                   </div>
                   <Toggle 
                        checked={settings.focusQuotes} 
                        onChange={(v) => onUpdateSettings({...settings, focusQuotes: v})} 
                   />
               </div>

           </div>
       </div>
    </div>
  );
};
