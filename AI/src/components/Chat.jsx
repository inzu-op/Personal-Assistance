import React, { useState, useContext,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios"
import Slider from './Slider';
import Structure from './Structure';
import { ThemeContext } from '../context/context.jsx';

const Chat = () => {
  const navigate = useNavigate()
  axios.defaults.withCredentials =true
  useEffect(() => {
    axios.get("http://localhost:3000/chat",)
    .then((res) => {
     console.log(res.data)
    })
    .catch((err) =>{ console.log(" Error fetching dashboard:", err.response?.data || err.message)
      navigate("/Login")
    });
  }, []);
  const [isActive, setIsActive] = useState(false); 
  const { theme } = useContext(ThemeContext);

  const bgStyle = {
    backgroundColor: theme === "light" ? "#fff" : "#333",
    color: theme === "light" ? "#000" : "#fff"
  };

  return (
    <div className='main relative min-h-screen w-full overflow-x-hidden custom-scrollbar' style={bgStyle}>
      <Slider isActive={isActive} setIsActive={setIsActive} />
      <Structure isActive={isActive} setIsActive={setIsActive} />
    </div>
  );
};

export default Chat;