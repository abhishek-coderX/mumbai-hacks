<<<<<<< HEAD
# webSearch
=======
# WebSearch Chatbot

This project is a simple web-based chatbot application that leverages Google's Generative AI to provide responses to user queries. It features a Node.js Express backend that handles AI interactions and serves a basic HTML/JavaScript frontend for user interaction.

## Features

*   **Interactive Chat Interface:** A user-friendly web interface for sending messages and receiving AI responses.
*   **Google Generative AI Integration:** Utilizes Google's powerful Generative AI model for intelligent and contextual conversations.
*   **Backend API:** A robust Express.js backend to manage AI requests and serve the frontend.

## Technologies Used

### Backend

*   **Node.js:** JavaScript runtime environment.
*   **Express.js:** Web application framework for Node.js.
*   **Groq SDK:** For interacting with Groq's language models.
*   **`@tavily/core`:** Likely for web search capabilities.
*   **`node-cache`:** For caching data.
*   **`dotenv`:** For loading environment variables (e.g., API keys).
*   **`cors`:** Middleware to enable Cross-Origin Resource Sharing.
*   **`nodemon`:** (Development) A tool that helps develop Node.js based applications by automatically restarting the node application when file changes in the directory are detected.

### Frontend

*   **HTML:** Structure of the web pages.
*   **CSS:** Styling of the web pages (potentially basic or using a framework like Tailwind CSS, indicated by `tailwind.config.js`).
*   **JavaScript:** Client-side logic for interacting with the backend and updating the UI.

## Getting Started

### Prerequisites

*   Node.js (LTS version recommended)
*   npm (comes with Node.js)
*   A Google Generative AI API Key

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd WebSearch
    ```

2.  **Install backend dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root directory of the project and add your Google Generative AI API key:
    ```
    API_KEY=YOUR_GOOGLE_GENERATIVE_AI_API_KEY
    ```

### Running the Application

1.  **Start the backend server:**
    ```bash
    npm start
    ```
    The server will typically run on `http://localhost:3000`.

2.  **Open the frontend:**
    Navigate to `http://localhost:3000` in your web browser.

## Project Structure

```
.
├── .gitignore
├── app.js              # Backend application logic (AI integration)
├── chatbot.js          # (Potentially a utility or older chatbot logic)
├── package-lock.json
├── package.json        # Project dependencies and scripts
├── server.js           # Express server setup and static file serving
├── frontend/
│   ├── index.html      # Main frontend HTML file
│   ├── script.js       # Frontend JavaScript logic
│   └── tailwind.config.js # Tailwind CSS configuration (if used)
└── node_modules/       # Installed Node.js modules
```

## Usage

Type your message into the input field on the web interface and press Enter or click the send button to get a response from the AI chatbot.

## Example Output

Here is an example of the chatbot's output for a fact-checking query:

### Fact-Check Result

*   **Verdict:** False
*   **Summary:** Abhishek is not the Prime Minister of India. The current Prime Minister of India is Narendra Modi.
*   **Confidence:** 100%
*   **Sources:**
    *   [Who Is The Prime Minister Of India?](https://www.indiatimes.com/news/india/who-is-the-prime-minister-of-india-559165.html)
    *   [Narendra Modi | Biography, Facts, & Yoga](https://www.britannica.com/biography/Narendra-Modi)
    *   [PMINDIA](https://www.pmindia.gov.in/en/)

# FactChecher
>>>>>>> 2bf28cf (Initial commit)
# mumbai-hacks
# mumbai-hacks
# mumbai-hacks
