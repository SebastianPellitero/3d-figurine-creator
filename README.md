# 3D Figurine Creator 🧩

![Status](https://img.shields.io/badge/status-WIP-yellow)
![Nuxt](https://img.shields.io/badge/Nuxt-3-00DC82?logo=nuxt.js)
![Three.js](https://img.shields.io/badge/Three.js-0.175-black?logo=three.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)

A browser-based 3D figurine builder where you can customize and visualize your own figures in real time.

## Features

- 🎨 **Real-time 3D preview** — See your figurine update live as you make changes
- 🧱 **Modular customization** — Swap and configure parts to build your unique figure
- 🗂️ **State management** — Figurine state handled with Pinia for a reactive experience
- 🖥️ **Web-first** — Runs entirely in the browser, no install needed

## Tech Stack

- **Framework** — Nuxt 3
- **3D Rendering** — Three.js
- **State** — Pinia
- **Styling** — Tailwind CSS
- **Language** — TypeScript

## Project Structure

```
3d-figurine-creator/
├── assets/css/       # Global styles
├── components/       # Vue components
├── composables/      # Reusable logic
├── pages/            # App routes
├── public/           # Static assets
├── server/           # Server-side logic
└── stores/           # Pinia stores
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
# Clone the repo
git clone https://github.com/SebastianPellitero/3d-figurine-creator.git
cd 3d-figurine-creator

# Install dependencies
npm install

# Start the dev server
npm run dev
```

App will be running at `http://localhost:3000`.

### Build for Production

```bash
npm run build
npm run preview
```

## License

MIT — see [LICENSE](./LICENSE)
