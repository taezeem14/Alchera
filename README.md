# 🌌 Somnium — Celestial Subconscious Sanctuary (No Cap FR FR)

A premium, high-key aesthetic PWA for recording and decoding your dreamscapes, rebranded to **Somnium** (latin for *The Dream* — referencing Johannes Kepler’s 1608 cosmic treatise, which is honestly a major flex 🪐). 

If your laptop is giving major potato vibes and lagging, we got you. The **Eco-Astral Mode** shuts down the heavy canvas animations so your fans stop screaming.

---

## ✨ Features That hit Different

*   **🧘 Binaural Space Drones**: Tune into theta waves (6Hz) to get your brain in that sweet lucid state. Instant vibes, high-key therapeutic.
*   **🎨 Subconscious Sketchpad**: Draw your dream symbols or drag-and-drop visuals. The AI interprets your doodles, no cap.
*   **🎙️ Voice Memoirs & STT**: record your rambling right after waking up. It auto-transcribes your voice memo so you don't forget the lore.
*   **🔮 OpenRouter AI Cosmic Logic**: Powered by `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free`. It spits the ultimate truth and displays its whole reasoning trace under a collapsible accordion, showing you exactly what it's thinking.
*   **🗣️ Cosmic Read-Aloud**: A deep, low-pitch cosmic voice reads your dream interpretation back to you. Extremely demure, extremely mindful.
*   **☁️ Firebase Cloud Sanctuary**: Sync your dreams rent-free across all devices using your own Google Firebase / Firestore. Guest mode users get an automatic data migration on login, which is an absolute win.
*   **📱 PWA Ready**: Install it straight onto your home screen. Main character energy.

---

## ⚡ Eco-Astral Mode (Lag Fix)

If your old laptop is fighting for its life, click the leaf icon in the header. It:
1.  **Deletes the Starfield Render Loop**: Stops the Canvas animation in its tracks.
2.  **Cancels Backdrop Filters**: Drops the resource-heavy GPU blur filters.
3.  **Applies Solid Colors**: Switches out glassmorphic cards for solid high-contrast cards.

It's literally a cheat code for performance.

---

## 🚀 Setting Up Your Sanctuary

1.  Clone this repository (or just open `index.html` in your browser).
2.  Go to **Settings** and drop in your OpenRouter API keys (up to 3 for automatic sequential rotation, we rotate them automatically on 429 errors).
3.  Optional: Drop in your Firebase config credentials to enable Google Login and cloud sync.
4.  Vibe check passed. Start dreaming.

---

## 🤖 Sync Automation (`sync-repo.js`)

To keep your GitHub repository updated automatically without manually running git commands every 5 minutes, we added a helper script:
```bash
node sync-repo.js
```
This runs `git add .`, commits your changes, and pushes them to your remote repo. (Make sure you ran `git remote add origin <your-repo-url>` first).

---

*Made with 🌌 and pure Vanilla JS (no frameworks, no bloat, just straight facts).*
