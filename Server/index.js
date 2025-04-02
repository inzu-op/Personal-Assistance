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

mongoose.connect("mongodb://127.0.0.1:27017/chat")
    .then(res => console.log("Connected to MongoDB"))
    .catch(err => console.error("MongoDB connection error:", err));

const verifyUser = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(404).json("no token available");
    } else {
        jwt.verify(token, "jwt-secret-key", (err, decoded) => {
            if (err) {
                return res.json("error with Token");
            }
            req.user = decoded;
            next();
        });
    }
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
                            const token = jwt.sign({ email: user.email, role: user.role }, "jwt-secret-key", { expiresIn: "1d" })
                            res.cookie("token", token)
                            res.json({ Status: "success", role: user.role })
                        } else {
                            res.status(401).json("incorrect password")
                        }
                    })
                } else {
                    res.json("no user found")
                }
            })
            .catch(err => res.json(err))
    } catch (err) {
        res.json(err)
    }
})

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
        const decoded = jwt.verify(token, "jwt-secret-key");
        const adminEmail = decoded.email;

        // Fetch the conversation history for the user
        const admin = await AdminModel.findOne({ email: adminEmail }).populate('conversations');
        
        // Define the maximum number of previous conversations to include
        const MAX_HISTORY_SIZE = 10; // Change this value as needed

        // Get the last MAX_HISTORY_SIZE conversations
        const conversationHistory = admin.conversations
            .slice(-MAX_HISTORY_SIZE) // Limit the history size
            .map(conv => ({
                question: conv.question,
                answer: conv.answer
            }));

        // Prepare the AI input with conversation history
        const aiInput = conversationHistory.map(conv => 
            `User: ${conv.question}\nAI: ${conv.answer}`
        ).join('\n') + `\nUser: ${inputText}\nAI:`;

        const apiKey = "AIzaSyBcFRPBAgoWBlQxpb2ygjX7iV_0cPwk8lI";
        const geminiResponse = await axios({
            url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
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

                            // General Response Format
                            " 1. Response Structure:" +
                            "    - Use simple, clear language" +
                            "    - Keep health responses to 3-4 lines" +
                            "    - Use emojis for engagement 😊" +
                            "    - Include follow-up questions" +

                            // Health and Wellness Focus
                            " 2. Health Topics:" +
                            "    - Physical health and fitness" +
                            "    - Mental wellness and stress management" +
                            "    - Nutrition and diet" +
                            "    - Exercise and activity" +
                            "    - Sleep and recovery" +
                            "    - Preventive care" +

                            // Project-Related Responses
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

                            // Response Types
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

                            // Interaction Rules
                            " 5. Interaction Guidelines:" +
                            "    - For single-word responses: Ask clarifying questions" +
                            "    - For health topics: Stay within medical guidelines" +
                            "    - For projects: Focus on practical implementation" +
                            "    - Always maintain professional tone" +

                            // Special Formatting
                            " 6. Special Elements:" +
                            "    - Use bullet points for lists" +
                            "    - Include motivational quotes when relevant" +
                            "    - Add warning boxes for important notes" +
                            "    - Use code formatting for technical content" +

                            // Example Project Response:
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

                            // Restrictions
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
                    maxOutputTokens: 500, // Increased for detailed project responses
                }
            },
        });

        console.log("Gemini API Response:", geminiResponse.data);

        // Extract the response text
        const responseText = geminiResponse.data.candidates[0].content.parts[0].text;

        // Create the conversation
        const conversation = {
            question: inputText,
            answer: responseText,
            timestamp: new Date()
        };

        // Save to ConversationModel
        const savedConversation = await ConversationModel.create(conversation);

        // Add to admin's conversations
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
        const decoded = jwt.verify(token, "jwt-secret-key");
        const admin = await AdminModel.findOne({ email: decoded.email })
            .populate('conversations');
        res.json(admin.conversations);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching conversations' });
    }
});

// Delete conversation endpoint
app.delete('/conversation/:id', verifyUser, async (req, res) => {
    try {
        const { id } = req.params;

        // Verify the conversation exists
        const conversation = await ConversationModel.findById(id);
        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

        // Delete the conversation
        await ConversationModel.findByIdAndDelete(id);

        // Remove the reference from the admin's conversations array
        await AdminModel.updateOne(
            { email: req.user.email }, // Use email from the verified user
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
