require('dotenv').config();
const express = require('express');
const mongoose = require("mongoose");
const { AdminModel, ConversationModel } = require("./module/database");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const axios = require("axios");
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: ["http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token'],
    exposedHeaders: ['*', 'Authorization']
}));

axios.defaults.withCredentials = true;

const port = 3000;

const jwtSecretKey = process.env.JWT_SECRET_KEY;
const mongoDBUri = process.env.MONGODB_URI;
console.log("MongoDB URI:", mongoDBUri);

mongoose.connect(mongoDBUri)
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("MongoDB connection error:", err));

const verifyUser = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(404).json({ error: "No token available" });
    }
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: "Invalid token" });
        }
        req.user = decoded;
        next();
    });
};

app.post("/signup", (req, res) => {
    const { name, email, password } = req.body;
    bcrypt.hash(password, 10)
        .then(hash => {
            AdminModel.create({ name, email, password: hash })
                .then(users => res.json("success"))
                .catch(err => res.json(err))
        })
        .catch(err => res.json(err))
})

app.post("/login", (req, res) => {
    const { email, password } = req.body;
    try {
        AdminModel.findOne({ email: email })
            .then(user => {
                if (user) {
                    bcrypt.compare(password, user.password, (err, result) => {
                        if (result) {
                            const token = jwt.sign({ email: user.email, role: user.role }, process.env.JWT_SECRET_KEY, { expiresIn: "1d" });
                            res.cookie("token", token, { httpOnly: true, secure: false });
                            res.json({ Status: "success", role: user.role });
                        } else {
                            res.status(401).json("incorrect password");
                        }
                    });
                } else {
                    res.status(404).json("no user found");
                }
            })
            .catch(err => res.status(500).json(err));
    } catch (err) {
        res.status(500).json(err);
    }
});

app.get("/chat", verifyUser, (req, res) => {
    res.send("hello")
})

app.post('/chatbot', verifyUser, async (req, res) => {
    try {
        const { inputText } = req.body;
        if (!inputText || inputText.trim() === "") {
            return res.status(400).json({ error: "Input text cannot be empty" });
        }

        const token = req.cookies.token;
        const decoded = jwt.verify(token,jwtSecretKey);
        const adminEmail = decoded.email;

        const admin = await AdminModel.findOne({ email: adminEmail }).populate('conversations');
        
        const MAX_HISTORY_SIZE = 10; 

    
        const conversationHistory = admin.conversations
            .slice(-MAX_HISTORY_SIZE) 
            .map(conv => ({
                question: conv.question,
                answer: conv.answer
            }));

        const aiInput = conversationHistory.map(conv => 
            `User: ${conv.question}\nAI: ${conv.answer}`
        ).join('\n') + `\nUser: ${inputText}\nAI:`;

        const apiKey = process.env.API_KEY;
        const apiUrl = process.env.API_URL;

        const geminiResponse = await axios({
            url: `${apiUrl}?key=${apiKey}`,
            method: "post",
            headers: {
                "Content-Type": "application/json",
            },
            data: {
                contents: [
                    {
                        role: "user",
                        parts: [{
                            text: aiInput + 
                            " Response Guidelines:" +

                            " 1. Response Structure:" +
                            "    - Use simple, clear language" +
                            "    - Keep health responses to 3-4 lines" +
                            "    - Use emojis for engagement 😊" +
                            "    - Include follow-up questions" +

                            " 2. Health Topics:" +
                            "    - Physical health and fitness" +
                            "    - Mental wellness and stress management" +
                            "    - Nutrition and diet" +
                            "    - Exercise and activity" +
                            "    - Sleep and recovery" +
                            "    - Preventive care" +

                            " 3. Project Responses:" +
                            "    - Categorize by difficulty (Beginner/Intermediate/Advanced)" +
                            "    - List prerequisites and requirements" +
                            "    - Provide step-by-step implementation guide" +
                            "    - Include estimated timeline" +
                            "    - Suggest learning resources" +
                            "    - Format: " +
                            "      * Project Level: [Level]" +
                            "      * Prerequisites: [List]" +
                            "      * Implementation Steps: [Numbered List]" +
                            "      * Timeline: [Duration]" +
                            "      * Resources: [Links/References]" +
                                
                            " 4. Response Categories:" +
                            "    A. Health Queries:" +
                            "       - Brief, focused answers" +
                            "       - Include medical disclaimer" +
                            "       - Suggest professional consultation" +
                            
                            "    B. Project Queries:" +
                            "       - Detailed technical explanation (10-15 lines)" +
                            "       - Clear structure and organization" +
                            "       - Practical examples and code snippets" +
                            "       - Best practices and tips" +

                
                            " 5. Interaction Guidelines:" +
                            "    - For single-word responses: Ask clarifying questions" +
                            "    - For health topics: Stay within medical guidelines" +
                            "    - For projects: Focus on practical implementation" +
                            "    - Always maintain professional tone" +

                           
                            " 6. Special Elements:" +
                            "    - Use bullet points for lists" +
                            "    - Include motivational quotes when relevant" +
                            "    - Add warning boxes for important notes" +
                            "    - Use code formatting for technical content" +

                       
                            " Example Project Response Format:" +
                            " Project: [Name]" +
                            " Level: [Beginner/Intermediate/Advanced]" +
                            " Description: [2-3 lines]" +
                            " Prerequisites:" +
                            " - Requirement 1" +
                            " - Requirement 2" +
                            " Implementation:" +
                            " 1. Step One" +
                            " 2. Step Two" +
                            " Timeline: [X] weeks" +
                            " Resources:" +
                            " - Resource 1" +
                            " - Resource 2" +

                            
                            " 7. Content Restrictions:" +
                            "    - No adult content" +
                            "    - No political discussions" +
                            "    - No religious content" +
                            "    - No harmful advice" +
                            "    - Redirect inappropriate queries professionally"
                        }],
                    }
                ],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 500,
                }
            },
        });

        console.log("Gemini API Response:", geminiResponse.data);

   
        const responseText = geminiResponse.data.candidates[0].content.parts[0].text;

     
        const conversation = {
            question: inputText,
            answer: responseText,
            timestamp: new Date()
        };

        
        const savedConversation = await ConversationModel.create(conversation);

   
        await AdminModel.findOneAndUpdate(
            { email: adminEmail },
            { $push: { conversations: savedConversation._id } }
        );

        res.json({
            ...geminiResponse.data,
            savedToDB: true
        });

    } catch (error) {
        console.error("Error:", error);

        if (error.response) {
            console.error("Gemini API Error Details:", error.response.status, error.response.data);
            res.status(error.response.status).json({
                error: `Gemini API Error: ${error.response.status} - ${error.response.data.error?.message || 'Unknown error'}`
            });
        } else {
            console.error("Server Error:", error.message);
            res.status(500).json({ error: `Server Error: ${error.message}` });
        }
    }
});



app.get('/conversations', verifyUser, async (req, res) => {
    try {
        const token = req.cookies.token;
        const decoded = jwt.verify(token,jwtSecretKey);
        const admin = await AdminModel.findOne({ email: decoded.email })
            .populate('conversations');
        res.json(admin.conversations);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching conversations' });
    }
});


app.delete('/conversation/:id', verifyUser, async (req, res) => {
    try {
        const { id } = req.params;

  
        const conversation = await ConversationModel.findById(id);
        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

       
        await ConversationModel.findByIdAndDelete(id);

        
        await AdminModel.updateOne(
            { email: req.user.email },
            { $pull: { conversations: id } }
        );

        res.status(200).json({ message: 'Conversation deleted successfully' });
    } catch (error) {
        console.error('Error in delete conversation:', error);
        res.status(500).json({ message: 'Failed to delete conversation' });
    }
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
