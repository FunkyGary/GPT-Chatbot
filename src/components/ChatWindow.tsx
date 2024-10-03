import React from "react";
import { Paper, List } from "@mui/material";
import ChatMessage from "./ChatMessage.tsx";

interface Message {
    sender: string;
    text: string;
    articles: any[];
    isLoading?: boolean;
}

interface ChatWindowProps {
    messages: Message[];
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages }) => {
    return (
        <Paper
            elevation={3}
            sx={{
                padding: 2,
                flexGrow: 1,
                overflowY: "auto",
                marginBottom: 2,
            }}
        >
            <List>
                {messages.map((msg, index) => (
                    <ChatMessage key={index} {...msg} />
                ))}
            </List>
        </Paper>
    );
};

export default ChatWindow;
