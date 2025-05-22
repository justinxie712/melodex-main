# Melodex

Melodex is a modern web application built with React, TypeScript, and Vite that interacts with Spotify's API to analyze and display music data. The application provides an intuitive interface for exploring audio features of your favorite tracks.

## Features

- Integration with Spotify's API
- Audio feature analysis and visualization
- Responsive design for desktop and mobile
- Mock data implementation with singleton cache for development

## Tech Stack

- React 18
- TypeScript
- Vite
- Spotify Web API

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- A Spotify Developer account (for API access)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/justinxie712/melodex-main.git
```

2. Navigate to the project directory:

```bash
cd melodex-main
```

3. Install dependencies:

```bash
npm install
```

or if you use yarn:

```bash
yarn
```

4. Create a `.env` file in the root directory with your Spotify API credentials:

```
VITE_SPOTIFY_CLIENT_ID=your_client_id
VITE_SPOTIFY_CLIENT_SECRET=your_client_secret
VITE_REDIRECT_URI=http://127.0.0.1:5173/callback
```

### Running the Application

Start the development server:

```bash
npm run dev
```

or with yarn:

```bash
yarn dev
```

The application will be available at `http://127.0.0.1:5173`.

## API Implementation

Melodex uses Spotify's Web API to fetch music data. For development purposes, the application implements a mock version of the audio-features endpoint using a singleton cache pattern. This allows for development without constantly hitting the Spotify API rate limits.

The mock implementation provides realistic data responses while developing and testing the application.

## Building for Production

To create a production build:

```bash
npm run build
```

or with yarn:

```bash
yarn build
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Spotify for providing their Web API
- The React and Vite communities for their excellent tools and documentation
