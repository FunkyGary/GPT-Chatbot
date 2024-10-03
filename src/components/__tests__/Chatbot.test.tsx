import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import Chatbot from "../Chatbot";
import { handleUserQuery } from "../../utility/apiUtility";

// Mock the apiUtility module
jest.mock("../../utility/apiUtility", () => ({
    handleUserQuery: jest.fn(),
}));

describe("Chatbot", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("renders Chatbot component", () => {
        render(<Chatbot />);
        expect(
            screen.getByPlaceholderText(/Find AI papers/i)
        ).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: /send/i })
        ).toBeInTheDocument();
    });

    test("allows user to type and send a message", async () => {
        (handleUserQuery as jest.Mock).mockResolvedValue({
            summary: "Test summary",
            articles: [],
        });

        render(<Chatbot />);

        const input = screen.getByPlaceholderText(/Find AI papers/i);
        fireEvent.change(input, { target: { value: "AI papers from 2020" } });
        fireEvent.click(screen.getByRole("button", { name: /send/i }));

        await waitFor(() => {
            expect(screen.getByText("You")).toBeInTheDocument();
            expect(screen.getByText("AI papers from 2020")).toBeInTheDocument();
            expect(screen.getByText("Chatbot")).toBeInTheDocument();
            expect(screen.getByText("Test summary")).toBeInTheDocument();
        });
    });

    test("displays loading state while fetching response", async () => {
        (handleUserQuery as jest.Mock).mockImplementation(
            () =>
                new Promise((resolve) =>
                    setTimeout(
                        () =>
                            resolve({ summary: "Test summary", articles: [] }),
                        1000
                    )
                )
        );

        render(<Chatbot />);

        const input = screen.getByPlaceholderText(/Find AI papers/i);
        fireEvent.change(input, { target: { value: "AI papers from 2020" } });
        fireEvent.click(screen.getByRole("button", { name: /send/i }));

        expect(screen.getByText("Processing...")).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText("Test summary")).toBeInTheDocument();
            expect(screen.queryByText("Processing...")).not.toBeInTheDocument();
        });
    });

    test("handles error response", async () => {
        (handleUserQuery as jest.Mock).mockRejectedValue(
            new Error("API Error")
        );

        render(<Chatbot />);

        const input = screen.getByPlaceholderText(/Find AI papers/i);
        fireEvent.change(input, { target: { value: "AI papers from 2020" } });
        fireEvent.click(screen.getByRole("button", { name: /send/i }));

        await waitFor(() => {
            expect(
                screen.getByText("An error occurred. Please try again later.")
            ).toBeInTheDocument();
        });
    });

    test("displays articles when provided in the response", async () => {
        (handleUserQuery as jest.Mock).mockResolvedValue({
            summary: "Test summary",
            articles: [
                {
                    title: "Article 1",
                    publication_year: "2020",
                    cited_by_count: 100,
                    is_oa: true,
                },
                {
                    title: "Article 2",
                    publication_year: "2021",
                    cited_by_count: 50,
                    is_oa: false,
                },
            ],
        });

        render(<Chatbot />);

        const input = screen.getByPlaceholderText(/Find AI papers/i);
        fireEvent.change(input, { target: { value: "AI papers from 2020" } });
        fireEvent.click(screen.getByRole("button", { name: /send/i }));

        await waitFor(() => {
            expect(screen.getByText("Article 1")).toBeInTheDocument();
            expect(screen.getByText("Article 2")).toBeInTheDocument();
            expect(
                screen.getByText(
                    "Published in: 2020 | Citations: 100 | Open Access: Yes"
                )
            ).toBeInTheDocument();
            expect(
                screen.getByText(
                    "Published in: 2021 | Citations: 50 | Open Access: No"
                )
            ).toBeInTheDocument();
        });
    });
});
