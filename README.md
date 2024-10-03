# GPT-Chatbot: AI-Powered Research Assistant

This project is an AI-powered chatbot that helps users find and summarize research articles using natural language queries. It integrates with the OpenAlex API for academic search and OpenAI's GPT model for intelligent summarization.

## Features

-   Natural language processing for user queries
-   Advanced filtering options (keywords, publication year, citation count, open access)
-   Integration with OpenAlex API for comprehensive academic search
-   AI-powered summarization of search results using OpenAI's GPT model
-   User-friendly chat interface

## Getting Started

### Prerequisites

-   Node.js (version 14 or later)
-   npm (comes with Node.js)
-   OpenAI API key
-   React (version 17 or later)

### Installation

1. Clone the repository:

    ```
    git clone https://github.com/FunkyGary/GPT-Chatbot.git
    cd GPT-Chatbot
    ```

2. Install dependencies:

    ```
    npm install
    ```

3. Create a `.env` file in the root directory and add your OpenAI API key:
    ```
    REACT_APP_OPENAI_API_KEY=your_openai_api_key_here
    ```

### Running the Application

To start the development server:
docker build --build-arg REACT_APP_OPENAI_API_KEY=your-api-key-here -t your-image-name .
docker build --build-arg REACT_APP_OPENAI_API_KEY=$(cat .env | grep REACT_APP_OPENAI_API_KEY | cut -d '=' -f2) -t your-image-name .
