import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaRobot, FaTimes, FaPaperPlane } from 'react-icons/fa';
import api from '../api/axios';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState([
    { role: 'assistant', content: 'Hi there! I am your AI travel guide. Ask me anything about your destination!' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history, isLoading, isOpen]);

  const toggleChat = () => setIsOpen(!isOpen);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage = message.trim();
    setMessage('');
    
    // Add user message to history optimistically
    const updatedHistory = [...history, { role: 'user', content: userMessage }];
    setHistory(updatedHistory);
    setIsLoading(true);

    try {
      const { data } = await api.post('/trips/chat', { 
        message: userMessage, 
        history: updatedHistory.slice(0, -1) // send previous history
      });
      
      setHistory([...updatedHistory, { role: 'assistant', content: data.reply }]);
    } catch (error) {
      console.error('Chat error:', error);
      setHistory([...updatedHistory, { role: 'assistant', content: "I'm having trouble connecting to the network right now. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleChat}
        aria-label="Toggle Travel Assistant AI"
        className="fixed bottom-6 right-6 h-14 w-14 bg-primary-600 text-white rounded-full flex items-center justify-center shadow-2xl z-50 hover:bg-primary-700 transition-colors focus:outline-none focus:ring-4 focus:ring-primary-500/50"
      >
        <FaRobot className="h-6 w-6" />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col z-50 overflow-hidden"
            style={{ height: '500px', maxHeight: 'calc(100vh - 120px)' }}
          >
            {/* Header */}
            <div className="bg-primary-600 text-white px-4 py-3 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <FaRobot className="h-5 w-5" />
                <h3 className="font-semibold">Travel Assistant AI</h3>
              </div>
              <button 
                onClick={toggleChat}
                aria-label="Close chat"
                className="text-white/80 hover:text-white transition-colors focus:outline-none"
              >
                <FaTimes />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-4 overflow-y-auto bg-slate-50 flex flex-col gap-3">
              {history.map((msg, index) => (
                <div 
                  key={index} 
                  className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                    msg.role === 'user' 
                      ? 'bg-primary-600 text-white self-end rounded-tr-sm' 
                      : 'bg-white border border-slate-200 text-slate-700 self-start rounded-tl-sm shadow-sm'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
              ))}
              
              {isLoading && (
                <div className="bg-white border border-slate-200 text-slate-500 self-start rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex gap-1 items-center">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white border-t border-slate-100">
              <form onSubmit={handleSubmit} className="relative">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask for travel tips..."
                  className="w-full bg-slate-100 border-transparent focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-200 rounded-full py-2.5 pl-4 pr-12 text-sm transition-all"
                />
                <button 
                  type="submit"
                  disabled={!message.trim() || isLoading}
                  aria-label="Send message"
                  className="absolute right-1 top-1 h-8 w-8 flex items-center justify-center bg-primary-600 hover:bg-primary-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-full transition-colors focus:outline-none"
                >
                  <FaPaperPlane className="h-3 w-3 -ml-0.5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBot;
