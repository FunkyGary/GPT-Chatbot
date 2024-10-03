import React from "react";
import {
    ListItem,
    ListItemText,
    Typography,
    Box,
    Card,
    CardContent,
    CircularProgress,
} from "@mui/material";

interface Article {
    title: string;
    publication_year: string;
    cited_by_count: number;
    is_oa: boolean;
}

interface ChatMessageProps {
    sender: string;
    text: string;
    articles: Article[];
    isLoading?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
    sender,
    text,
    articles,
    isLoading = false,
}) => {
    return (
        <ListItem alignItems="flex-start">
            <ListItemText
                primary={sender === "User" ? "You" : "Chatbot"}
                secondary={
                    <>
                        {isLoading ? (
                            <Box display="flex" alignItems="center">
                                <CircularProgress size={20} sx={{ mr: 1 }} />
                                <Typography component="span" variant="body2">
                                    Thinking...
                                </Typography>
                            </Box>
                        ) : (
                            <>
                                <Typography component="span" variant="body2">
                                    {text}
                                </Typography>
                                {articles && articles.length > 0 && (
                                    <Box sx={{ marginTop: 1 }}>
                                        {articles.map(
                                            (article, articleIndex) => (
                                                <Card
                                                    key={articleIndex}
                                                    sx={{ marginBottom: 1 }}
                                                >
                                                    <CardContent>
                                                        <Typography variant="subtitle2">
                                                            {article.title}
                                                        </Typography>
                                                        <Typography variant="caption">
                                                            Published in:{" "}
                                                            {
                                                                article.publication_year
                                                            }{" "}
                                                            | Citations:{" "}
                                                            {
                                                                article.cited_by_count
                                                            }{" "}
                                                            | Open Access:{" "}
                                                            {article.is_oa
                                                                ? "Yes"
                                                                : "No"}
                                                        </Typography>
                                                    </CardContent>
                                                </Card>
                                            )
                                        )}
                                    </Box>
                                )}
                            </>
                        )}
                    </>
                }
            />
        </ListItem>
    );
};

export default ChatMessage;
