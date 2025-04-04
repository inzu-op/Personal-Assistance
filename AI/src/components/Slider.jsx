import React, { useState, useEffect, useContext } from 'react';
import { ThemeContext } from '../context/context.jsx';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Slider = ({ isActive, setIsActive, setAnswerHistory }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [selectedConv, setSelectedConv] = useState(null);
    const { theme } = useContext(ThemeContext);
    const [conversations, setConversations] = useState([]);
    const navigate = useNavigate();

    const handleToggle = () => {
        setIsActive(prev => !prev);
    };
    const handleDeleteClick = (conv, e) => {
        e.stopPropagation();
        setSelectedConv(conv);
        setShowDeletePopup(true);
    };

    const handleDelete = async () => {
        try {
            if (!selectedConv || !selectedConv._id) {
                console.error('No conversation selected for deletion');
                return;
            }

           
            const response = await axios.delete(`http://localhost:3000/conversation/${selectedConv._id}`, {
                withCredentials: true
            });

            if (response.status === 200) {
                
                setConversations(prevConversations =>
                    prevConversations.filter(conv => conv._id !== selectedConv._id)
                );
                console.log('Conversation deleted successfully');
            }

     
            setShowDeletePopup(false);
            setSelectedConv(null);

        } catch (error) {
            console.error('Error deleting conversation:', error);
           
            alert('Failed to delete conversation. Please try again.');
        }
    };

    const handleNewChat = () => {
   
        localStorage.removeItem("chatHistory");
     
        setAnswerHistory([]);
     
        setIsActive(false);
    };

    const handleConversationClick = (conv) => {
        
        setAnswerHistory(prevHistory => [...prevHistory, {
            question: conv.question,
            answer: conv.answer
        }]);

       
        setIsActive(false);

      
        setTimeout(() => {
            const chatHistoryElement = document.querySelector('.para');
            if (chatHistoryElement) {
                chatHistoryElement.scrollTop = chatHistoryElement.scrollHeight;
            }
        }, 100);
    };

    useEffect(() => {
        let timer;
        if (isActive) {
            timer = setTimeout(() => {
                setIsVisible(true);
            }, 200);
        } else {
            setIsVisible(false);
        }
        return () => clearTimeout(timer);
    }, [isActive]);

    const fetchConversations = async () => {
        try {
            const response = await axios.get('http://localhost:3000/conversations', {
                withCredentials: true
            });
            setConversations(response.data);
        } catch (error) {
            console.error('Error fetching conversations:', error);
            
            if (error.response && error.response.status === 401) {
              
                console.log("Unauthorized access, please log in again.");
            }
        }
    };

   
    useEffect(() => {
        fetchConversations();
    }, [conversations]);

    const sliderStyle = {
        backgroundColor: theme === "light" ? "#fff" : "#1D121A",
        color: theme === "light" ? "#AD196A" : "#fff",
        width: '15vw',
        overflow: 'hidden',
        transform: isActive ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s ease-in-out'
    };

    return (
        <>
            <div
                className="slider-container fixed h-[100vh] shadow-lg left-0 top-0 z-10 rounded-lg"
                style={sliderStyle}
            >
                <div className="w-full h-full flex flex-col">
                    <div
                        className="menu-icon flex items-center py-4 pl-3 cursor-pointer"
                        onClick={handleToggle}
                    >
                        <i className={`fa-solid fa-right-from-bracket text-lg p-2 rounded-md transition duration-100 ${theme === "light" ? "hover:bg-[#F4DBEF]" : "hover:bg-gray-700"
                            }`}></i>
                        {isActive && (
                            <h3 className={`ml-2 text-base animated-h3 ${isVisible ? 'visible' : ''}`}>
                                Close
                            </h3>
                        )}
                    </div>

                    {isActive && (
                        <div className="flex-1 flex flex-col pl-3">
                            <div
                                className="flex items-center py-2 cursor-pointer"
                                onClick={handleNewChat}
                            >
                                <i className={`fa-solid fa-plus text-lg p-2 rounded-md transition duration-100 ${theme === "light" ? "hover:bg-[#F4DBEF]" : "hover:bg-gray-700"
                                    }`}></i>
                                <h3 className={`ml-2 text-base animated-h3 ${isVisible ? 'visible' : ''}`}>
                                    New Chat
                                </h3>
                            </div>

                            <div className="history mt-20 flex-1">
                                <h1 className='font-medium'>Recent Search </h1>
                                <div className='mt-3 overflow-y-auto max-h-[40vh] custom-scrollbar overflow-x-hidden'>
                                    <ul className='list-none'>
                                        {conversations.map((conv, index) => (
                                            <li
                                                key={index}
                                                className={`text-sm rounded-lg p-3 flex items-center justify-between transition-all duration-200 group relative hover:pr-8 ${theme === "light" ? "hover:bg-[#F4DBEF]" : "hover:bg-[#2C2431]"
                                                    } ${isVisible ? 'visible' : ''}`}
                                                onClick={() => handleConversationClick(conv)}
                                            >
                                                <span className='font-medium truncate pr-2 cursor-pointer'>
                                                    {conv.question}
                                                </span>
                                                <i
                                                    className={`fa-solid fa-xmark absolute right-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-3 group-hover:translate-x-0 cursor-pointer p-2 rounded-md ${theme === "light" ? "hover:bg-[#F4DBEF]" : "hover:bg-gray-700"
                                                        }`}
                                                    onClick={(e) => handleDeleteClick(conv, e)}
                                                ></i>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="setting flex items-center py-4 mt-auto mb-20">
                                <i className={`fa-solid fa-gear text-lg p-2 rounded-md transition duration-100 ${theme === "light" ? "hover:bg-[#F4DBEF]" : "hover:bg-gray-700"
                                    }`}></i>
                                <h3 className={`ml-2 text-base animated-h3 ${isVisible ? 'visible' : ''}`}>
                                    Setting
                                </h3>
                            </div>
                        </div>
                    )}
                </div>
            </div>

           
            {showDeletePopup && (
                <div className="fixed inset-0 flex items-center justify-center z-50 animate-fadeIn">
                   
                    <div className="absolute inset-0 bg-black/10 backdrop-brightness-50"
                        onClick={() => setShowDeletePopup(false)}
                    ></div>
                    <div
                        className={`${theme === 'light' ? 'bg-white text-[#501854]' : 'bg-[#1D121A] text-white'
                            } rounded-lg p-6 w-[400px] shadow-xl relative animate-scaleIn`}
                    >
                        <h3 className="text-lg font-semibold mb-4">Delete Conversation</h3>
                        <p className="mb-6">Are you sure you want to delete this conversation?</p>
                        <div className="flex justify-end gap-3">
                            <button
                                className={`px-4 py-2 rounded-md transition-colors duration-200 ${theme === 'light'
                                        ? 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                                        : 'bg-gray-700 hover:bg-gray-600 text-white'
                                    }`}
                                onClick={() => setShowDeletePopup(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200"
                                onClick={handleDelete}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Slider;
