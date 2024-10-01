import React, { useState } from "react";
import {
    Box,
    Button,
    TextField,
    Paper,
    Typography,
    List,
    ListItem,
    ListItemText,
} from "@mui/material";
import { handleUserQuery } from "../utility/apiUtility.ts"; // Import the function for handling the user query

const Chatbot = () => {
    // State to hold chat messages
    const [messages, setMessages] = useState<
        { sender: string; text: string }[]
    >([]);
    const [input, setInput] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false); // State to manage loading state
    // Function to handle sending the user's query
    const handleSend = async () => {
        if (input.trim()) {
            setMessages((prevMessages) => [
                ...prevMessages,
                { sender: "User", text: input },
            ]);
            setInput("");

            setLoading(true);

            try {
                // Call the function to handle input, ensuring it stays within limits
                const botResponse = await handleUserQuery(input);

                setMessages((prevMessages) => [
                    ...prevMessages,
                    {
                        sender: "Bot",
                        text:
                            botResponse ||
                            "I couldn’t process your request. Please try again.",
                    },
                ]);
            } catch (error) {
                setMessages((prevMessages) => [
                    ...prevMessages,
                    {
                        sender: "Bot",
                        text: "An error occurred. Please try again later.",
                    },
                ]);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <Box
            sx={{ width: "100%", maxWidth: 600, margin: "0 auto", padding: 2 }}
        >
            {/* Chat window */}
            <Paper
                elevation={3}
                sx={{
                    padding: 2,
                    height: 400,
                    overflowY: "auto",
                    marginBottom: 2,
                }}
            >
                <List>
                    {messages.map((msg, index) => (
                        <ListItem key={index} alignItems="flex-start">
                            <ListItemText
                                primary={
                                    msg.sender === "User" ? "You" : "Chatbot"
                                }
                                secondary={
                                    <Typography
                                        component="span"
                                        variant="body2"
                                    >
                                        {msg.text}
                                    </Typography>
                                }
                            />
                        </ListItem>
                    ))}
                </List>
            </Paper>

            {/* Input field for user query */}
            <TextField
                label="Ask something..."
                fullWidth
                variant="outlined"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()} // Send query when Enter key is pressed
                disabled={loading} // Disable input while loading
            />

            {/* Send button */}
            <Button
                variant="contained"
                fullWidth
                sx={{ marginTop: 1 }}
                onClick={handleSend}
                disabled={loading} // Disable button while loading
            >
                {loading ? "Processing..." : "Send"}
            </Button>
        </Box>
    );
};

export default Chatbot;
