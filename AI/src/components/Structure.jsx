import React, { useState, useContext, useEffect, useRef } from 'react';
import { ThemeContext } from '../context/context.jsx';
import Content from './Content';
import Slider from './Slider';

const Structure = ({ isActive, setIsActive }) => {
  const { theme, setTheme } = useContext(ThemeContext);
  const [isLight, setIsLight] = useState(theme === 'light');
  const [answerHistory, setAnswerHistory] = useState([]);

  useEffect(() => {
    setIsLight(theme === 'light');
  }, [theme]);

  useEffect(() => {
    const savedHistory = localStorage.getItem("chatHistory");
    if (savedHistory) {
      setAnswerHistory(JSON.parse(savedHistory));
    }
  }, []);

  const handleToggle = () => {
    setIsActive(prev => !prev);
  };

  const contentStyle = {
    backgroundColor: theme === 'light' ? '#fff' : '#201B25',
    color: theme === 'light' ? '#501854' : '#fff',
    position: 'absolute',
    left: isActive ? '15vw' : '0',
    right: '0',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.3s ease-in-out'
  };

  const liColorStyle = {
    color: theme === 'light' ? '#501854' : '#fff',
  };

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const isProcessingRef = useRef(false);

  const handleListItemClick = async (text) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    try {
      if (contentRef.current) {
        await contentRef.current.triggerAnswer(text);
      }
    } finally {
      isProcessingRef.current = false;
    }
  };
  const contentRef = useRef();

  return (
    <>
      <Slider 
        isActive={isActive} 
        setIsActive={setIsActive} 
        setAnswerHistory={setAnswerHistory}
      />
      <div className="main rounded-lg transition-all duration-200 ease-in-out p-2 custom-scrollbar" style={contentStyle}>
      
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div
              className="menu-icon cursor-pointer"
              onClick={handleToggle}
            >
              <button 
                className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors fixed top-5 ${
                  theme === "light" ? "hover:bg-[#F4DBEF]" : "hover:bg-gray-700"
                } focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:text-foreground z-10 h-8 w-8 text-muted-foreground`} 
                data-sidebar="trigger"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="lucide lucide-panel-left"
                >
                  <rect width="18" height="18" x="3" y="3" rx="2"></rect>
                  <path d="M9 3v18"></path>
                </svg>
                <span className="sr-only">Toggle Sidebar</span>
              </button>
            </div>
          </div>
          <div className="fixed right-10 top-5 z-50">
            <button 
              onClick={toggleTheme}
              className={`p-2 rounded-full transition-all duration-200 ${
                theme === "light" ? "hover:bg-[#F4DBEF]" : "hover:bg-gray-700"
              }`}
            >
              {isLight ? (
                <i className="fa-solid fa-moon text-xl"></i>
              ) : (
                <i className="fa-solid fa-sun text-xl"></i>
              )}
            </button>
          </div>
        </div>
        <h1 className="font-bold text-4xl mt-5 ml-10">Chat AI</h1>

       
        <div className="ai-message text-center mt-20">
          <h2 className="text-3xl font-semibold mb-4 mr-40">How can I help you?</h2>
        </div>

        <div className="placeholder-content flex-grow custom-scrollbar">
          <div className="flex justify-center items-center">
            <div className="p-6 rounded-lg">
              <ul className="li-color list-none font-medium w-[450px]">
                {["What are some tips for staying healthy?", "What are some effective ways to reduce stress?", "What are some simple mindfulness exercises ?", "How can I set and achieve my health goals"].map((text, index) => (
                  <li 
                    key={index}
                    className={`text-lg mt-2 p-2 rounded-md group relative ${
                      theme === "light" ? "hover:bg-[#F4DBEF]" : "hover:bg-[#2C2431]"
                    }`} 
                    style={liColorStyle}
                    onClick={() => handleListItemClick(text)}
                  >
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <Content 
          ref={contentRef}
          answerHistory={answerHistory} 
          setAnswerHistory={setAnswerHistory} 
        />
      </div>
    </>
  );
};

export default Structure;
