import React, { useState } from "react";
import { Box } from "@mui/material";
import { handleUserQuery, BotResponse } from "../utility/apiUtility.ts";
import ChatWindow from "./ChatWindow.tsx";
import InputArea from "./InputArea.tsx";

interface Message {
    sender: string;
    text: string;
    articles: any[];
    isLoading?: boolean;
}

const Chatbot: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    const handleSend = async () => {
        if (input.trim()) {
            setMessages((prevMessages) => [
                ...prevMessages,
                { sender: "User", text: input, articles: [] },
                { sender: "Bot", text: "", articles: [], isLoading: true },
            ]);
            setInput("");
            setLoading(true);

            try {
                const botResponse: BotResponse = await handleUserQuery(input);

                setMessages((prevMessages) => {
                    const updatedMessages = [...prevMessages];
                    const lastMessage = updatedMessages.pop();
                    if (lastMessage && lastMessage.isLoading) {
                        if (typeof botResponse === "string") {
                            updatedMessages.push({
                                sender: "Bot",
                                text: botResponse,
                                articles: [],
                                isLoading: false,
                            });
                        } else {
                            updatedMessages.push({
                                sender: "Bot",
                                text:
                                    botResponse.summary ||
                                    "I couldn't find any relevant information. Can you please rephrase your question?",
                                articles: botResponse.articles || [],
                                isLoading: false,
                            });

                            if (
                                !botResponse.articles ||
                                botResponse.articles.length === 0
                            ) {
                                updatedMessages.push({
                                    sender: "Bot",
                                    text: "I couldn't find any articles related to your query. Try asking about a different topic or rephrasing your question.",
                                    articles: [],
                                    isLoading: false,
                                });
                            }
                        }
                    }
                    return updatedMessages;
                });
            } catch (error) {
                setMessages((prevMessages) => {
                    const updatedMessages = [...prevMessages];
                    const lastMessage = updatedMessages.pop();
                    if (lastMessage && lastMessage.isLoading) {
                        updatedMessages.push({
                            sender: "Bot",
                            text: "An error occurred. Please try again later.",
                            articles: [],
                            isLoading: false,
                        });
                    }
                    return updatedMessages;
                });
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <Box
            sx={{
                width: "100%",
                maxWidth: 1000,
                margin: "0 auto",
                padding: 2,
                height: "95vh",
                display: "flex",
                flexDirection: "column",
            }}
        >
            <ChatWindow messages={messages} />
            <InputArea
                input={input}
                setInput={setInput}
                handleSend={handleSend}
                loading={loading}
            />
        </Box>
    );
};

export default Chatbot;
