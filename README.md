# ARISE - Shadow Monarch AI

A premium AI assistant interface with advanced animations, glow effects, and voice interaction capabilities.

![ARISE](https://img.shields.io/badge/ARISE-Shadow%20Monarch-purple?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

## ✨ Features

### 🎙️ Voice Interaction
- **Voice Mode**: Full-screen voice interface with Web Speech API
- **Inline Microphone**: Quick voice input directly in chat
- **Text-to-Speech**: AI responses spoken aloud with customizable voice

### 🔍 Web Search
- Automatic web search via SERPER API
- Real-time search result display
- Shadow Monarch styled results

### 🎨 Premium UI/UX
- **Layered Glow Effects**: Multi-shadow neon animations
- **Energy Ripple**: Visual feedback on AI responses
- **Particle Background**: Ambient animated particles
- **Focus Mode**: Background dims when typing
- **Micro-interactions**: Button hovers, input focus, staggered animations

### 📱 Responsive Design
- Mobile-friendly sidebar
- Adaptive chat interface
- Touch-optimized controls

## 🚀 Getting Started

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Deploy to v0.app

1. Run the export script:
```bash
export-v0app.bat
```

2. Drag and drop the `v0app-export` folder to [v0.dev](https://v0.dev)

3. v0.app will automatically install dependencies and start the server

## 🎮 Usage

### Commands
- Type your message in the input field
- Press Enter or click Send to submit
- Click the microphone icon for voice input
- Click "Voice Mode" for full voice interface

### Quest System
- Add custom quests to track objectives
- Complete quests to level up your Monarch Rank
- Progress bar shows completion status

## 🔧 Environment Variables

Create a `.env.local` file:

```env
GROQ_API_KEY=your_groq_api_key
SERPER_API_KEY=your_serper_api_key
```

## 📁 Project Structure

```
ARISE/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── chat/          # Chat API
│   │   └── search/        # Search API
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main page
├── components/            # React components
│   ├── ui/               # Shadcn UI components
│   ├── chat-console.tsx  # Main chat interface
│   ├── voice-mode.tsx    # Voice interaction
│   ├── particle-background.tsx
│   ├── shadow-heartbeat.tsx
│   └── ...
├── lib/                   # Utilities
├── hooks/                 # Custom React hooks
└── public/               # Static assets
```

## 🎭 Animation Classes

| Class | Description |
|-------|-------------|
| `animate-layered-glow` | Pulsing neon glow |
| `animate-energy-ripple` | AI response effect |
| `animate-energy-surge` | Quick flash effect |
| `animate-message-enter` | Chat message slide in |
| `animate-orb-pulse` | Breathing orb animation |
| `glow-border` | Neon border glow |
| `glow-text` | Glowing text |

## 🤖 AI Persona

ARISE is a Shadow Monarch AI that:
- Addresses you as "Monarch"
- Uses system/game terminology
- Describes information as "extracted from the shadows"
- Maintains a mysterious, powerful demeanor

## 📄 License

MIT License - feel free to use and modify!

---

**ARISE** - Command the shadows, conquer your quests.
