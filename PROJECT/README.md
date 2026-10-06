# ⚡ EYE OF ODIN — Lost & Found Item Tracker for Campus

An advanced, futuristic 3D WebGL web application and REST API for university campus lost-and-found recovery, inspired by syllabus row #16.

---

## 📁 Project Architecture: Two Dedicated Folders

The codebase is cleanly separated into two distinct folders for simplicity and modularity:

```
campus-lost-and-found-3d/
├── frontend/                     # 🌐 Client-Side Web Application
│   ├── index.html                # Scrollytelling layout & HUD dock
│   ├── css/
│   │   └── style.css             # Cyberpunk glassmorphic HUD styling
│   ├── js/
│   │   ├── threeScene.js         # Three.js 3D Eye of Odin & orbiting models
│   │   ├── data.js               # State store, priorities, campus buildings
│   │   ├── aiEngine.js           # Multi-modal AI similarity matcher
│   │   ├── feedController.js     # Live feed stream & filters
│   │   ├── reportModal.js        # Multi-step lost/found report wizard
│   │   ├── claimModal.js         # Anti-scam ownership challenge
│   │   ├── chatController.js     # Direct P2P chat & safe exchange spot coordinator
│   │   ├── campusMap.js          # Interactive 3D campus radar & telemetry
│   │   ├── adminPortal.js        # Security desk custody locker manager
│   │   ├── posterGenerator.js    # Printable flyers with QR codes
│   │   ├── aiModal.js            # Neural match breakdown visualizer
│   │   ├── audioEngine.js        # Procedural Web Audio synthesizer
│   │   └── app.js                # Master orchestrator
│   ├── package.json              # Frontend manifest & scripts
│   └── README.md                 # Frontend instructions
│
├── backend/                      # ⚙️ Node.js REST API Server
│   ├── server.js                 # Zero-dependency HTTP/REST server & static host
│   ├── data/
│   │   ├── items.json            # Campus registry persistent database
│   │   └── claims.json           # Ownership verification claims database
│   ├── package.json              # Backend scripts
│   └── README.md                 # Backend documentation & endpoints
│
└── README.md                     # Main setup and running guide
```

---

## 💻 Running Directly in VS Code

You can run this project in VS Code in **two super simple ways**:

### Option A: The All-In-One Node Server (Recommended)
The backend server is zero-dependency and automatically serves the frontend at the same time:

1. Open the project root folder in **VS Code** (`File -> Open Folder...`).
2. Open the integrated terminal (`Ctrl + ~` or `Cmd + ~`).
3. Navigate into `backend` and start the server:
   ```bash
   cd backend
   node server.js
   ```
4. Open your browser and navigate to:
   👉 **`http://localhost:5050`**

Both the frontend 3D interface and all REST API endpoints (`/api/items`, `/api/stats`, `/api/claims`) are instantly active!

---

### Option B: VS Code Live Server (Frontend Only or Independent)
If you prefer using VS Code's popular **Live Server** extension:

1. In VS Code, install the extension **"Live Server"** (by *Ritwick Dey*) from the Extensions marketplace (`Ctrl + Shift + X` or `Cmd + Shift + X`).
2. Right-click on `frontend/index.html` in the VS Code file explorer.
3. Click **"Open with Live Server"**.
4. Your browser will automatically open to `http://127.0.0.1:5500/frontend/index.html`.

*(Optional: If you also run `cd backend && node server.js`, the frontend will seamlessly communicate with the backend on port 5050 via built-in CORS!)*

---

## 🌟 Key Features

1. **3D Eye of Odin Scrollytelling Engine**:
   - Cybernetic mechanical aperture iris, central glowing pupil, concentric holographic rune rings, and 5 orbiting campus items (MacBook, AirPods, Brass Keychain, Student ID, Stainless Hydro Flask).
   - Positioned cleanly on the right half (`xOffset: 2.8`), leaving full room for the tactical HUD dock on the left.
2. **Unobstructed Layout**:
   - All text overlays, filters, and cards are contained in an ultra-clean left dock.
   - Central & right 3D viewport remains 100% visible and interactive at all times.
3. **Cinema View (`👁️ Cinema View`)**:
   - Single-click toggle to hide all text panels for an unobstructed, free-orbiting 3D exploration mode.
4. **Priority Urgency Levels**:
   - 🔴 **Critical Priority**: Immediate alerts for academic thesis laptops, passport wallets, prescription glasses.
   - 🟡 **High Urgency**: Electronics, house/car key sets, student transit cards.
   - 🔵 **Standard Urgency**: Umbrellas, jackets, water bottles, notebooks.
5. **"Others / Unlisted" Category**:
   - Dedicated filter tab and reporting wizard category with dynamic custom category write-in.
6. **Odin AI Vision Engine**:
   - 5-vector similarity algorithm scoring color, category, timestamp decay, location proximity, and semantic keywords.
7. **Security Custody Locker Manager**:
   - Dedicated admin portal tracking items safely locked in campus security lockers (`Locker A-04`, `Locker B-12`, `Locker C-09`).
8. **Anti-Scam Claim Verification**:
   - Secret question ownership challenges to prevent false claims before item handover.
9. **Printable QR Posters & Procedural Web Audio**:
   - Instant printable PDF/paper flyer with QR code and retro-futuristic sound effects.
