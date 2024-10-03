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
-   npm (comes with Node.js) or yarn
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

    or

    ```
    yarn
    ```

3. Create a `.env` file in the root directory and add your OpenAI API key:
    ```
    REACT_APP_OPENAI_API_KEY=your_openai_api_key_here
    ```

### Running the Application

To start the development server:

```
npm start
```

or

```
yarn start
```

Open [http://localhost:3000](http://localhost:3000) to view it in your browser. The page will reload when you make changes.

### Docker Deployment

To build and run the application using Docker:

1. Build the Docker image:

    ```
    docker build -t chatbot-app .
    ```

2. Run the Docker container:
    ```
    docker run -p 3000:80 chatbot-app
    ```

To include environment variables during the build process:

```
docker build --build-arg REACT_APP_OPENAI_API_KEY=your-api-key-here -t chatbot-app .
```

## Available Scripts

-   `npm test`: Launches the test runner in interactive watch mode.
-   `npm run build`: Builds the app for production to the `build` folder.
-   `npm run eject`: Removes the single build dependency from your project (one-way operation).
