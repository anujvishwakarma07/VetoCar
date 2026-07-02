# VetoCar 🚗
> **AI-Powered Auto Contract Auditor & Negotiation Assistant**

VetoCar is an advanced, production-ready full-stack web application engineered to protect car buyers and lessees from predatory dealership markups, hidden fees, and manipulated leasing worksheets. By combining modern AI document auditing with official government vehicle database checks and real-time negotiation coaching, VetoCar levels the playing field between consumers and dealerships.

---

## 🚀 Key Features

### 1. Secure Access Gateway (User Authentication)
*   **JWT Security:** Fully-gated backend routes (chat, uploads, VIN decoding) requiring valid JSON Web Tokens.
*   **Persistent Sessions:** Automated client-side token restoration, secure cookie-less JWT parsing, and localized state clearing upon logging out.
*   **Credit System:** Integrated credit-based access middleware requiring set credits for resource-heavy operations (e.g., contract analysis requires 15 credits, VIN decode 5 credits).

### 2. PDF Contract Auditing Engine
*   **Automated PDF Parser:** Direct stream parsing of uploaded dealership quote worksheets.
*   **Gemini AI Analyzer:** Extraction of complex lease/loan parameters, including:
    *   Monthly Payments, Down Payments, and Drive-offs.
    *   Money Factor / Lease APR validation.
    *   Residual Values, mileage caps, and disposition/early-termination fee structures.
*   **Fairness Deal Score:** A dynamic `0-100` fairness rating with customized assessment.
*   **Red Flags Detector:** Scans and flags hidden dealer add-ons (nitrogen, paint sealants, documentation fee markups).

### 3. Multiple Offer Comparison Dashboard
*   **Side-by-Side Matrix:** Select and stack two previously audited quotes.
*   **Cost Delta Analysis:** Computes and displays the exact total term cost differences.
*   **Winner Recommendation Engine:** Automatically recommends the optimal deal with clear, data-driven rationales.

### 4. Public NHTSA VIN Specification & Recall Lookup
*   **VPIC API Integration:** Decodes any vehicle's 17-digit VIN to extract exact engine, trim, transmission, and drivetrain specs.
*   **Recall Checker:** Live checks for active NHTSA safety recalls.

### 5. Interactive AI Negotiation Coach
*   **Personal Coach Chatbot:** Real-time conversational interface designed for auto negotiations.
*   **Dealership Scripts:** Instantly drafts emails, text messages, or phone scripts targeting isolated markup terms.
*   **Fail-Safe Mode:** Seamless fallback rules in case of Gemini API rate limits (`HTTP 429`).

### 6. Admin Control Panel
*   **Traffic Logs:** Live analytics with charts detailing active requests, page hits, unique visitors, response times, browser and OS breakdowns.
*   **Feedback/Bug Tracker:** Central ticketing panel for managing user feedback items.
*   **Traffic Log Reset:** Clean dashboard function to clear audit logs without touching user profiles.

---

## 🛠️ System Architecture & Tech Stack

```
   ┌──────────────────────────────────────────────────────────┐
   │                  VetoCar Client (React)                  │
   └──────────────────────────┬───────────────────────────────┘
                              │ HTTPS / JWT
   ┌──────────────────────────▼───────────────────────────────┐
   │               VetoCar REST Server (Express)              │
   └──────┬───────────────────┬──────────────────────┬────────┘
          │                   │                      │
   ┌──────▼──────┐     ┌──────▼──────┐        ┌──────▼──────┐
   │   MongoDB   │     │  Gemini AI  │        │  NHTSA API  │
   │  (Database) │     │ (Analysis)  │        │ (VIN Specs) │
   └─────────────┘     └─────────────┘        └─────────────┘
```

*   **Frontend:** React (Vite), Lucide Icons, HSL Monospace CSS, Responsive Viewports.
*   **Backend:** Node.js, Express, Multer (in-memory file buffers), JWT, BcryptJS.
*   **Database:** MongoDB (via Mongoose schemas).
*   **Core Services:** Gemini 2.5 Flash (Google Generative AI SDK), NHTSA vPIC REST Services.

---

## 🗄️ Database Schemas (Mongoose)

### 1. User Schema (`User.js`)
Stores user profiles, credentials, and credit counts.
```javascript
{
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  credits: { type: Number, default: 1 },
  lookupsCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
}
```

### 2. Contract Schema (`Contract.js`)
Saves audited files, raw parsed text, and structured analysis results.
```javascript
{
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  fileName: { type: String, required: true },
  fileSize: { type: Number, required: true },
  rawText: { type: String, required: true },
  analysis: { type: Object, required: true },
  uploadedAt: { type: Date, default: Date.now }
}
```

### 3. Traffic Schema (`Traffic.js`)
Tracks requests for live admin analytics logs.
```javascript
{
  ip: { type: String, default: 'unknown' },
  method: { type: String, default: 'GET' },
  route: { type: String, default: '/' },
  statusCode: { type: Number, default: 200 },
  responseTime: { type: Number, default: 0 },
  userAgent: { type: String, default: '' },
  device: { type: String, default: 'desktop', enum: ['mobile', 'tablet', 'desktop'] },
  browser: { type: String, default: 'unknown' },
  os: { type: String, default: 'unknown' },
  country: { type: String, default: 'Unknown' },
  city: { type: String, default: 'Unknown' },
  region: { type: String, default: '' },
  userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  timestamp: { type: Date, default: Date.now }
}
```

---

## 📡 API Endpoints

### 🔐 Authentication (`/api/auth`)
*   `POST /register` - Register a new user account.
*   `POST /login` - Login to an account and receive a JWT.
*   `GET /profile` - Retrieve the current authenticated user's details. [Protected]
*   `PUT /update-profile` - Update profile information. [Protected]
*   `POST /change-password` - Modify the user's password securely. [Protected]

### 📄 Contracts (`/api/contracts`)
*   `POST /upload` - Upload a lease contract PDF and initiate Gemini analysis. [Protected + Credit Checked]
*   `GET /` - Retrieve the upload history for the authenticated user. [Protected]
*   `DELETE /:id` - Remove an audited contract record. [Protected]

### 🚗 VIN & Vehicle Specs (`/api/vin`)
*   `GET /decode/:vin` - Decode specs from NHTSA API using a 17-digit VIN. [Protected + Credit Checked]
*   `GET /plate` - Check US vehicle registration plate details. [Protected + Credit Checked]
*   `GET /indian-plate` - Check Indian registration plate details via VAHAN API. [Protected + Credit Checked]

### 💬 AI Negotiation Coach (`/api/chat`)
*   `POST /` - Send user messages to the coach chatbot and receive tailored suggestions. [Protected + Credit Checked]

### 💳 Payments & Credits (`/api/payment`)
*   `POST /order` - Initiate a Razorpay payment order for purchasing credits. [Protected]
*   `POST /verify` - Verify transaction signature and award audit credits. [Protected]

### 📊 Admin Decks (`/api/admin`)
*   `POST /login` - Admin login credentials validation.
*   `GET /stats` - Access complete traffic stats, visitor demographics, browser, and OS lists. [Admin Only]
*   `DELETE /clear-traffic` - Clear request logs to refresh active graphs. [Admin Only]
*   `GET /feedback` - Read all bug and feature ticket submissions. [Admin Only]
*   `PATCH /feedback/:id/status` - Update ticket resolution status (`new`, `read`, `resolved`). [Admin Only]

---

## ⚙️ Setup & Installation

### Prerequisites
*   Node.js (v18+)
*   MongoDB Instance (Local or MongoDB Atlas URI)
*   Gemini API Key

### Backend Setup
1. Navigate to the `/backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in `/backend` containing:
   ```env
   PORT=8080
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_secure_jwt_signing_key
   ADMIN_JWT_SECRET=your_secure_admin_jwt_signing_key
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=admin_password
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
4. Start the backend server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the `/frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite React developer server:
   ```bash
   npm run dev -- --host
   ```
4. Open your browser and navigate to `http://localhost:5173/`.

---

## 🔒 Security & Best Practices
*   **Bcrypt Hashing:** Password databases are secured using BcryptJS salted hashes.
*   **Route Guards:** Custom Express middlewares validate auth tokens (`authMiddleware`) and credit requirements (`creditMiddleware`).
*   **In-Memory Stream Processing:** PDFs are parsed using memory buffers (via Multer), preventing server disk footprint overhead.
*   **Sanitization:** Strict database query typing prevents Mongoose injection vectors.
