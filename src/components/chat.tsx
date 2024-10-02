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
    Card,
    CardContent,
} from "@mui/material";
import { handleUserQuery } from "../utility/apiUtility.ts"; // Import the function for handling the user query

const Chatbot = () => {
    // State to hold chat messages
    const [messages, setMessages] = useState<
        { sender: string; text: string }[]
    >([]);
    const [input, setInput] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false); // State to manage loading state
    const [articles, setArticles] = useState<any[]>([]); // State to store the fetched articles

    // Function to handle sending the user's query
    const handleSend = async () => {
        if (input.trim()) {
            // Add the user's message to the conversation
            setMessages((prevMessages) => [
                ...prevMessages,
                { sender: "User", text: input },
            ]);

            // Clear the input field
            setInput("");

            // Set loading state to true while the API is processing
            setLoading(true);

            try {
                // Call the handleUserQuery function to process the input and get articles and bot response
                const botResponse = await handleUserQuery(input);

                // Set articles if available
                setArticles(botResponse.articles || []);

                // Add the bot's response to the conversation
                setMessages((prevMessages) => [
                    ...prevMessages,
                    {
                        sender: "Bot",
                        text:
                            botResponse.summary ||
                            "I couldn't find any relevant information. Can you please rephrase your question?",
                    },
                ]);

                // Provide feedback if no articles were found
                if (
                    !botResponse.articles ||
                    botResponse.articles.length === 0
                ) {
                    setMessages((prevMessages) => [
                        ...prevMessages,
                        {
                            sender: "Bot",
                            text: "I couldn't find any articles related to your query. Try asking about a different topic or rephrasing your question.",
                        },
                    ]);
                }
            } catch (error) {
                setMessages((prevMessages) => [
                    ...prevMessages,
                    {
                        sender: "Bot",
                        text: "An error occurred. Please try again later.",
                    },
                ]);
            } finally {
                // Set loading state to false once the API request is complete
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

            {/* Article Cards */}
            {articles.length > 0 && (
                <Box sx={{ marginTop: 2 }}>
                    {articles.map((article, index) => (
                        <Card key={index} sx={{ marginBottom: 2 }}>
                            <CardContent>
                                <Typography variant="h6">
                                    {article.title}
                                </Typography>
                                <Typography variant="body2">
                                    Published in: {article.publication_year}
                                </Typography>
                                <Typography variant="body2">
                                    Citations: {article.cited_by_count}
                                </Typography>
                                <Typography variant="body2">
                                    Open Access: {article.is_oa ? "Yes" : "No"}
                                </Typography>
                            </CardContent>
                        </Card>
                    ))}
                </Box>
            )}
        </Box>
    );
};

export default Chatbot;
