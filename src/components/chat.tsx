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

const Chatbot: React.FC = () => {
    // State to hold chat messages
    const [messages, setMessages] = useState<
        Array<{ sender: string; text: string }>
    >([]);
    const [input, setInput] = useState<string>("");

    // Function to handle sending the user's query
    const handleSend = () => {
        if (input.trim()) {
            // Add the user's message to the conversation
            setMessages((prevMessages) => [
                ...prevMessages,
                { sender: "User", text: input },
            ]);

            // Here you would call the API to get a response (e.g., OpenAlex API)
            // For demonstration purposes, we're using a static response
            const botResponse = `Searching for articles related to "${input}"...`;

            // Add the bot's response to the conversation
            setTimeout(() => {
                setMessages((prevMessages) => [
                    ...prevMessages,
                    { sender: "Bot", text: botResponse },
                ]);
            }, 1000);

            // Clear the input field
            setInput("");
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
                    display: "flex",
                    flexDirection: "column-reverse", // Reverse the order of messages
                }}
            >
                <List>
                    {messages.map((msg, index) => (
                        <ListItem
                            key={index}
                            alignItems="flex-start"
                            sx={{
                                flexDirection:
                                    msg.sender === "User"
                                        ? "row-reverse"
                                        : "row",
                                justifyContent: "flex-start",
                            }}
                        >
                            <ListItemText
                                primary={
                                    msg.sender === "User" ? "You" : "Chatbot"
                                }
                                secondary={
                                    <Typography
                                        component="span"
                                        variant="body2"
                                        sx={{
                                            backgroundColor:
                                                msg.sender === "User"
                                                    ? "#e3f2fd"
                                                    : "#f5f5f5",
                                            padding: 1,
                                            borderRadius: 1,
                                            display: "inline-block",
                                        }}
                                    >
                                        {msg.text}
                                    </Typography>
                                }
                                primaryTypographyProps={{
                                    align:
                                        msg.sender === "User"
                                            ? "right"
                                            : "left",
                                }}
                                secondaryTypographyProps={{
                                    align:
                                        msg.sender === "User"
                                            ? "right"
                                            : "left",
                                }}
                            />
                        </ListItem>
                    ))}
                </List>
            </Paper>

            {/* Input field and Send button wrapper */}
            <Box sx={{ display: "flex", gap: 1 }}>
                <TextField
                    label="Ask something..."
                    fullWidth
                    variant="outlined"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSend()}
                />
                <Button
                    variant="contained"
                    onClick={handleSend}
                    sx={{ minWidth: "80px" }}
                >
                    Send
                </Button>
            </Box>
        </Box>
    );
};

export default Chatbot;
