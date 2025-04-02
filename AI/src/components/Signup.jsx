
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

function SignUp() {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState({ text: '', type: '' });

    axios.defaults.withCredentials = true;
    const handleSubmit = (event) => {
        event.preventDefault();
        if (!name || !email || !password) {
            setMessage({ text: "Please fill in all fields!", type: "error" });
            setTimeout(() => setMessage({ text: "", type: "" }), 2000);
            return;
        }
        axios.post("http://localhost:3000/signup", { name, email, password })
            .then(result => {
                if (result.data === "success") {
                    setMessage({ text: "Signup successful! Redirecting...", type: "success" });
                    setTimeout(() => navigate("/Login"), 2000);
                }
            })
            .catch(err => {
                setMessage({ text: err.message, type: "error" });
            });
    };

    return (
        <div className="h-screen w-full flex justify-center items-center font-poppins">
            <AnimatePresence>
                {message.text && (
                    <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className={`fixed top-10 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-md text-white shadow-lg z-50 ${
                            message.type === "success" ? "bg-green-500" : "bg-red-500"
                        }`}
                    >
                        {message.text}
                    </motion.div>
                )}
            </AnimatePresence>
            <div className="w-full max-w-md p-8 text-black rounded-xl shadow-2xl bg-white">
                <div className="text-center">
                    <h1 className="text-3xl font-poppins text-[#2c3e50] font-bold mb-2">Create Your Account</h1>
                    <p className="text-sm text-[#7f8c8d]">Join us to get started with your journey.</p>
                </div>
                <form className="mt-6 space-y-5">
                    <div className="relative">
                        <input
                            id="name"
                            type="text"
                            className="peer mt-1 block w-full px-4 py-3 border border-gray-300 font-poppins rounded-lg shadow-sm text-black outline-none focus:outline-[#551230] focus:border-[#551230] transition-all"
                            placeholder="Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                        <label htmlFor="name" className={`absolute left-5 text-sm transition-all bg-white px-1 ${name ? "top-[-10px] text-[12px] text-[#551230]" : "top-4 text-base text-[#551230]"}`}>Full Name</label>
                    </div>
                    <div className="relative">
                        <input
                            id="email"
                            type="email"
                            className="peer mt-1 block w-full px-4 py-3 border border-gray-300 font-poppins rounded-lg shadow-sm text-black outline-none focus:outline-[#551230] focus:border-[#551230] transition-all"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <label htmlFor="email" className={`absolute left-5 text-sm transition-all bg-white px-1 ${email ? "top-[-10px] text-[12px] text-[#551230]" : "top-4 text-base text-[#551230]"}`}>Email Address</label>
                    </div>
                    <div className="relative">
                        <input
                            id="password"
                            type="password"
                            className="peer mt-1 block w-full px-4 py-3 border border-gray-300 font-poppins rounded-lg shadow-sm text-black outline-none focus:outline-[#551230] focus:border-[#551230] transition-all"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <label htmlFor="password" className={`absolute left-5 text-sm transition-all bg-white px-1 ${password ? "top-[-10px] text-[12px] text-[]" : "top-4 text-base text-[#551230]"}`}>Password</label>
                    </div>
                    <button
                        type="submit"
                        onClick={handleSubmit}
                        className="w-full flex justify-center py-3 px-4 border-2  font-poppins rounded-xl shadow-md text-sm font-medium text-[#771940]  hover:bg-[#551230] hover:text-white focus:ring-2 focus:ring-[#771940] focus:ring-opacity-50 transition-all transform hover:scale-105"
                    >
                        Sign Up
                    </button>
                </form>
                <div className="mt-6 text-center">
                    <p className="text-sm text-[#7f8c8d] font-poppins">
                        Already Have an Account?{' '}
                        <Link to="/Login" className="text-[#551230] hover:text-[#551230] font-semibold underline">Login Here</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default SignUp;
