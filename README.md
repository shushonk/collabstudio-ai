# CollabStudio AI

CollabStudio AI is an interactive React application built with Vite and Tailwind CSS. It leverages the Gemini API to provide intelligent features and includes a custom Express server for backend support.

## Features

- **Modern Tech Stack**: React 19, Vite, Tailwind CSS v4
- **AI Integration**: Powered by `@google/genai` for intelligent, generative capabilities
- **Robust Backend**: Includes a custom Express server setup for API routes and handling requests
- **Fast Build Times**: Vite and esbuild for rapid development and optimized production builds
- **Smooth Animations**: Uses `motion` for polished UI transitions and animations

## Prerequisites

- Node.js (v18+ recommended)
- npm or yarn
- Gemini API Key

## Setup & Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/shushonk/collabstudio-ai.git
   cd collabstudio-ai
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Rename `.env.example` to `.env.local` or `.env` and insert your Gemini API Key:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

## Development

To start the development server (which runs both the frontend and backend):

```bash
npm run dev
```

Open your browser and navigate to the URL provided in the terminal.

## Build for Production

To create an optimized production build for both the frontend and the server:

```bash
npm run build
```

After building, you can start the production server with:

```bash
npm run start
```

## Technologies Used

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Express](https://expressjs.com/)
- [Google GenAI SDK](https://github.com/google/gemini-sdk)
