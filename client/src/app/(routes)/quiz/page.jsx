'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Loader2, Clock, Eye, Lock } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useUserContext } from '@/app/context/Userinfo';

const HeroBackground = () => (
  <div className="absolute inset-0 -z-10 overflow-hidden">
    <div className="absolute inset-0 bg-neutral-950" />
    <div className="absolute inset-0 bg-grid-small-white/[0.03] -z-10" />
    <div className="absolute inset-0 bg-dot-white/[0.03] [mask-image:radial-gradient(ellipse_at_center,white,transparent)]" />
    <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-transparent" />
    {/* Enhanced background elements */}
    <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-600/5 rounded-full blur-[100px]" />
    <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-purple-600/5 rounded-full blur-[100px]" />
  </div>
);

function QuizPage() {
  const { contextinput } = useUserContext();
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const [showWarning, setShowWarning] = useState(false);
  const [tabWarnings, setTabWarnings] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60); // 60 seconds timer
  const timerRef = useRef(null);

  // Timer effect
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timerRef.current);
          router.push('/');
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [router]);

  // Format time with enhanced visual indicators
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Get timer color based on time left
  const getTimerColor = () => {
    if (timeLeft > 30) return 'text-green-400';
    if (timeLeft > 10) return 'text-yellow-400';
    return 'text-red-400 animate-pulse';
  };

  // Get progress color based on time left
  const getProgressColor = () => {
    if (timeLeft > 30) return 'bg-green-400';
    if (timeLeft > 10) return 'bg-yellow-400';
    return 'bg-red-400';
  };

  // Tab visibility detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabWarnings(prev => {
          const newWarnings = prev + 1;
          setShowWarning(true);
          
          if (newWarnings >= 3) {
            clearInterval(timerRef.current);
            router.push('/');
          }
          
          setTimeout(() => {
            setShowWarning(false);
          }, 3000);
          
          return newWarnings;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [router]);

  // Prevent copy paste
  useEffect(() => {
    const handleCopyPaste = (e) => {
      e.preventDefault();
      setShowWarning(true);
      setTabWarnings(prev => {
        const newWarnings = prev + 1;
        if (newWarnings >= 3) {
          router.push('/');
        }
        return newWarnings;
      });
      
      setTimeout(() => {
        setShowWarning(false);
      }, 3000);
    };

    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'v' || e.key === 'c')) {
        handleCopyPaste(e);
      }
    };

    document.addEventListener('paste', handleCopyPaste);
    document.addEventListener('copy', handleCopyPaste);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('paste', handleCopyPaste);
      document.removeEventListener('copy', handleCopyPaste);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [router]);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:8001/testseries`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            input_value: `${contextinput}`
          })
        });

        if (!response.ok) {
          throw new Error('Failed to fetch questions');
        }

        const data = await response.json();
        if (!data.questions || data.questions.length === 0) {
          throw new Error('No questions available');
        }
        setQuestions(data.questions);
      } catch (err) {
        console.error('Error fetching questions:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  const handleAnswer = (answer) => {
    if (isAnswered) return;
    
    setSelectedAnswer(answer);
    setIsAnswered(true);
    
    if (answer === questions[currentQuestionIndex].answer) {
      setScore(score + 1);
    }

    // Wait for 1.5 seconds before moving to the next question
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
        setIsAnswered(false);
      } else {
        // Quiz completed, navigate to results page
        router.push(`/quiz/congratulations?score=${score + (answer === questions[currentQuestionIndex].answer ? 1 : 0)}&total=${questions.length}&topic=Java`);
      }
    }, 1500);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-neutral-950 to-neutral-900 p-4 pt-20">
        <HeroBackground />
        <Navbar />
        <div className="container mx-auto max-w-4xl">
          {/* Quiz header skeleton */}
          <div className="mb-8 animate-pulse">
            <div className="h-10 w-3/4 bg-neutral-800/70 rounded-lg mb-3"></div>
            <div className="h-5 w-1/2 bg-neutral-800/50 rounded-lg"></div>
          </div>
          
          {/* Quiz progress skeleton */}
          <div className="w-full bg-neutral-800/50 h-2 rounded-full overflow-hidden mb-10 animate-pulse">
            <div className="bg-gradient-to-r from-blue-600/40 to-blue-500/40 h-full rounded-full w-1/4"></div>
          </div>
          
          {/* Question skeleton */}
          <div className="bg-neutral-900/50 border border-neutral-800/50 rounded-xl p-6 mb-6 animate-pulse">
            <div className="h-7 w-full bg-neutral-800/70 rounded-lg mb-6"></div>
            
            {/* Options skeleton */}
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="p-4 border border-neutral-800/30 rounded-lg bg-neutral-800/20 flex items-center">
                  <div className="w-5 h-5 rounded-full border-2 border-neutral-700 mr-3"></div>
                  <div className="h-5 w-full bg-neutral-800/50 rounded-lg"></div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Navigation buttons skeleton */}
          <div className="flex justify-between animate-pulse">
            <div className="h-12 w-28 bg-neutral-800/60 rounded-lg"></div>
            <div className="h-12 w-28 bg-gradient-to-r from-blue-600/30 to-blue-500/30 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center px-4">
        <HeroBackground />
        <motion.div 
          className="text-center p-6 rounded-2xl bg-neutral-900/50 backdrop-blur-md border border-red-900/50 max-w-md w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-red-400 mb-2">Error Loading Quiz</h3>
          <p className="text-neutral-300 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-neutral-800 text-neutral-200 rounded-lg hover:bg-neutral-700 transition-colors w-full sm:w-auto flex items-center justify-center gap-2 mx-auto"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col w-full pb-16">
      {/* Quiz Header - Mobile Optimized */}
      <div className="border-b border-white/10 bg-black relative">
        {/* Compact mobile header */}
        <div className="block md:hidden w-full">
          <div className="p-3 flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-white/60">Quiz Progress</span>
              <span className="text-lg font-bold">Q{currentQuestionIndex + 1}/{questions.length}</span>
            </div>
            
            <div className="flex flex-col items-end">
              <span className="text-sm font-medium text-white/60">Time Left</span>
              <span className={`text-lg font-bold ${timeLeft < 10 ? "text-red-500 animate-pulse" : ""}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>
          
          {showWarning && (
            <div className="w-full bg-gradient-to-r from-red-900/60 to-red-600/60 p-2 text-center">
              <span className="text-white font-medium text-sm flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Security Alert!
              </span>
            </div>
          )}
        </div>
        
        {/* Desktop header */}
        <div className="hidden md:block">
          <div className="container mx-auto px-4 md:px-6 py-4 md:py-6 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="text-xl md:text-2xl font-bold">
                Q{currentQuestionIndex + 1}/{questions.length}
              </div>
              
              {showWarning && (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }} 
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-red-500/20 text-red-400 py-1 px-3 rounded-full flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Warn: {tabWarnings}/3
                </motion.div>
              )}
            </div>
            
            <div className="bg-white/5 rounded-full py-2 px-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className={`font-mono font-bold text-lg ${timeLeft < 10 ? "text-red-500 animate-pulse" : ""}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quiz Content */}
      <div className="flex-1 flex flex-col w-full max-w-4xl mx-auto px-4 py-6 md:py-10">
        <motion.div
          key={`question-${currentQuestionIndex}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
          className="mb-6 md:mb-10"
        >
          <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-2 md:mb-4 leading-tight">
            {currentQuestion.question}
          </h2>
          <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-400"
              initial={{ width: 0 }}
              animate={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 gap-3 sm:gap-4 md:gap-5"
        >
          {currentQuestion.options.map((option, idx) => (
            <motion.button
              key={idx}
              variants={itemVariants}
              onClick={() => handleAnswer(option)}
              className={`relative p-4 sm:p-5 md:p-6 rounded-xl text-left transition-all 
                ${
                  selectedAnswer === option
                    ? "bg-blue-500/20 border-2 border-blue-400"
                    : "bg-white/5 border-2 border-transparent hover:border-white/20"
                }
                group flex items-start`}
            >
              <div className="flex justify-between items-center w-full">
                <div className="flex items-start">
                  <div className={`w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full mr-3 sm:mr-4 flex-shrink-0 ${
                    selectedAnswer === option ? "bg-blue-500 text-white" : "bg-white/10 text-white/60 group-hover:bg-white/20"
                  }`}>
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span className="text-base sm:text-lg md:text-xl">{option}</span>
                </div>
                {selectedAnswer === option && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-2 text-blue-400"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                )}
              </div>
            </motion.button>
          ))}
        </motion.div>

        <div className="mt-8 sm:mt-10 flex justify-between">
          <button
            onClick={() => {
              if (currentQuestionIndex > 0) {
                setCurrentQuestionIndex(currentQuestionIndex - 1);
                setSelectedAnswer(null);
              }
            }}
            disabled={currentQuestionIndex === 0}
            className={`px-4 py-2 sm:px-6 sm:py-3 rounded-lg ${
              currentQuestionIndex === 0
                ? "bg-white/5 text-white/40 cursor-not-allowed"
                : "bg-white/10 text-white hover:bg-white/20"
            } transition-colors flex items-center`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>
          
          <button
            onClick={() => {
              if (selectedAnswer === null) {
                if (currentQuestionIndex < questions.length - 1) {
                  setCurrentQuestionIndex(currentQuestionIndex + 1);
                  setSelectedAnswer(null);
                } else {
                  router.push(`/quiz/congratulations?score=${score}&total=${questions.length}&topic=Java`);
                }
              }
            }}
            disabled={selectedAnswer === null}
            className={`px-4 py-2 sm:px-6 sm:py-3 rounded-lg ${
              selectedAnswer === null
                ? "bg-blue-500/30 text-blue-300/50 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-500"
            } transition-colors flex items-center`}
          >
            {currentQuestionIndex === questions.length - 1 ? "Submit" : "Next"}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile timer warning */}
      <AnimatePresence>
        {timeLeft < 30 && timeLeft > 0 && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-4 left-4 right-4 bg-red-900/90 rounded-lg p-3 z-50 backdrop-blur-sm md:hidden"
          >
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-300 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="text-red-100 font-medium">Time is running out!</p>
                <p className="text-red-300 text-sm">Only {timeLeft} seconds remaining</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default QuizPage; 