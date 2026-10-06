# ⚡ EYE OF ODIN — Backend API Server

A lightweight, zero-dependency REST API server designed for the **EYE OF ODIN** Campus Lost & Found tracking system.

---

## 🚀 Quick Start in VS Code

### Step 1: Open Terminal in VS Code
Open the `backend/` folder in VS Code, or open your integrated terminal (`Ctrl + \`` or ``Cmd + \``).

### Step 2: Run the Server
Ensure Node.js is installed on your computer, then run:

```bash
node server.js
```

Or, using npm:
```bash
npm start
```

For live development with auto-reload (Node 18+):
```bash
npm run dev
```

### Step 3: Verify It's Running
The server will boot on `http://localhost:5050` (or `process.env.PORT`):
```text
================================================================
⚡ EYE OF ODIN - Campus Lost & Found REST API Server
================================================================
🟢 Status:    ONLINE
🌐 URL:       http://localhost:5050
📡 Endpoints:
   - GET   http://localhost:5050/api/items
   - POST  http://localhost:5050/api/items
   - GET   http://localhost:5050/api/stats
   - POST  http://localhost:5050/api/claims
   - GET   http://localhost:5050/api/health
----------------------------------------------------------------
📁 Static Frontend: Automatically served at http://localhost:5050
================================================================
```

---

## 📡 REST API Documentation

### 1. Items Registry
- **`GET /api/items`**
  - **Query Parameters**:
    - `type` (`all`, `lost`, `found`)
    - `priority` (`critical`, `high`, `standard`)
    - `category` (`electronics`, `wearables`, `keys`, `cards`, `others`, etc.)
    - `buildingId` (`bldg-lib`, `bldg-tech`, `bldg-union`, `bldg-sci`, etc.)
    - `status` (`active`, `claimed`, `reunited`, `in_vault`)
    - `q` (Search query across title, description, tags, custom category, location)
  - **Returns**: `{ count: number, total: number, items: [...] }`

- **`GET /api/items/:id`**
  - Retrieve details for a specific item by ID.

- **`POST /api/items`**
  - Register a new lost or found report.
  - **Body (JSON)**:
    ```json
    {
      "type": "lost",
      "priority": "critical",
      "title": "MacBook Pro 14",
      "category": "electronics",
      "customCategory": null,
      "description": "Left in robotics lab",
      "buildingId": "bldg-tech",
      "specificLocation": "Room 302",
      "secretQuestion": "What sticker is on it?",
      "secretAnswerHint": "A tech logo",
      "tags": ["laptop", "apple"]
    }
    ```

- **`PATCH /api/items/:id/status`**
  - Update item state (`active`, `claimed`, `reunited`, `archived`) or custody location.

### 2. Claims & Security Verification
- **`POST /api/claims`**
  - Submit ownership verification challenge response.
  - **Body (JSON)**:
    ```json
    {
      "itemId": "item-lost-1",
      "claimantName": "John Doe",
      "claimantEmail": "john@campus.edu",
      "answerProvided": "Space Gray with NASA sticker"
    }
    ```

- **`GET /api/claims`**
  - List all pending ownership verification requests for campus security desk review.

### 3. Telemetry & Health
- **`GET /api/stats`**
  - Campus lost & found metrics: recovery rate, critical alerts, active count, vault inventory.
- **`GET /api/health`**
  - Service liveness probe.

---

## 📂 Architecture & Data Store
- All data is persisted inside `data/items.json` and `data/claims.json`.
- Built purely on Node.js standard library (`http`, `fs`, `path`, `url`) — **no `npm install` needed!**
