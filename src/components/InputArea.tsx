import React from "react";
import { TextField, Button, Box } from "@mui/material";

interface InputAreaProps {
    input: string;
    setInput: (input: string) => void;
    handleSend: () => void;
    loading: boolean;
}

const InputArea: React.FC<InputAreaProps> = ({
    input,
    setInput,
    handleSend,
    loading,
}) => {
    return (
        <Box>
            <TextField
                label="Ask something..."
                fullWidth
                variant="outlined"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                disabled={loading}
                placeholder="E.g., Find AI papers published after 2020 with more than 100 citations"
                helperText="Try asking about specific topics, years, citation counts, or open access articles"
            />
            <Button
                variant="contained"
                fullWidth
                sx={{ marginTop: 1 }}
                onClick={handleSend}
                disabled={loading}
            >
                {loading ? "Processing..." : "Send"}
            </Button>
        </Box>
    );
};

export default InputArea;
