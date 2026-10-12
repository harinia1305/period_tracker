# Period Love 🌸
**Empathetic Cycle Tracking & Discreet Period-Care Delivery (Mobile-First MVP)**

Period Love is a privacy-first, wellness-centered mobile web application. It combines interactive 2D gradient calendar finger-painting with transparent rule-based cycle estimates, symptom logging, and a discreet period-care marketplace with verified women delivery partner preferences.

---

## 🌟 Key Features

1. **Finger-Paint Calendar with 2D Gradient Color Picker**:
   - Interactive 2D saturation/depth gradient box with hue slider.
   - Drag across dates with finger or mouse to paint flow without page-scrolling interference (`touch-action: none`).
   - Undo history stack (revert paint strokes) and safe month clearing with confirmation.
   - Suggested empirical shades with non-diagnostic labels (*Light spotting shade*, *Red flow shade*, *Dark flow shade*, *Brown shade*, *Custom shade*).
2. **Daily Symptom Drawer & Bottom Sheet**:
   - Record flow type, cramp intensity (0–10 scale), back pain, headache, bloating, nausea, fatigue, and mood.
   - Check off self-care comfort actions (*Heat bag / patch*, *Rest*, *Hydration*, *Gentle stretch*, *Medication logged*).
   - Private journal notes stored strictly locally on device.
3. **Transparent Rule-Based Cycle Predictions**:
   - Predicts next period window with explicit uncertainty bounds (e.g. "14–18 September (estimate)").
   - Discloses how the calculation works and displays personal pattern observations without clinical diagnostics.
   - Prominent, calm disclaimer: *"Tracking insights are estimates and not medical advice. Contact a qualified healthcare professional for concerns."*
4. **Care Shop & Mock Discreet Delivery**:
   - Curated catalog: organic pads, bamboo liners, medical-grade silicone cups, herbal cramp patches, electrolyte tabs, PMS dark chocolate treats.
   - Mandatory pharmacist safety notice & confirmation checkbox for comfort medication items.
   - Discreet unbranded kraft box packaging enabled by default.
   - Verified women delivery partner preference.
5. **Multi-Role Workflows**:
   - **User**: cycle tracking, predictions, shopping, orders, and privacy exports.
   - **Delivery Partner**: availability toggle, zone overview, request acceptance, step-by-step delivery progress (*Requested* → *Accepted* → *Picked Up* → *Out for Delivery* → *Delivered*), masked proxy calling, earnings summary, and SOS safety center.
   - **Admin / Operator**: operational KPIs, delivery partner verification queue (approve/reject), catalog stock manager, order fulfillment inspector, audit log, and mock CSV exports.

---

## 📱 User Roles & Demo Accounts

The prototype includes a **1-Click Demo Role Switcher Bar** pinned to the top of every screen.

| Role | Demo Name | Email | Focus Area |
| :--- | :--- | :--- | :--- |
| **User** | Maya Patel | `maya@example.com` | Personal calendar painting, symptom logs, predictions, orders |
| **Delivery Partner** | Priya Sharma | `priya@example.com` | Incoming delivery requests, active route steps, safety center |
| **Admin** | Aarohi Sen | `admin@periodlove.internal` | Verification queue, catalog stock, orders, audit log, CSV export |

*Tip: You can also use the "Reset Demo" button in the top bar anytime to reload fresh seed data.*

---

## 🛠️ Technology Stack

- **Frontend**: React 19 + TypeScript 6 + Vite 8
- **Styling**: Tailwind CSS v4 + Custom Calming Wellness Design System
- **Routing**: React Router v7 (`react-router-dom`)
- **Icons**: Lucide React (`lucide-react`)
- **Validation**: Zod
- **Testing**: Vitest + Testing Library React + jsdom (`@testing-library/jest-dom`)
- **Persistence**: Decoupled typed service repository backed by `localStorage`

---

## 🚀 Installation & Development

### 1. Prerequisites
- Node.js (v18+ or v24+)
- npm (v9+)

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```
Open your browser at the local URL printed in terminal (e.g. `http://localhost:5173`).

### 4. Run Test Suite
```bash
npm test
```

### 5. Production Build
```bash
npm run build
```

---

## 🛡️ Privacy & Safety Guardrails

- **Zero Data Brokering**: Cycle logs and notes are stored strictly in client-side storage isolated by `userId`.
- **Sensitive Data Isolation**: Delivery partners **never** see customer cycle days, symptoms, or private notes.
- **Masked Contact**: Delivery partners and customers view only masked phone proxies (`+91 ••••• ••492`).
- **No Diagnostic Claims**: The app never diagnoses conditions from colors or missed cycles.
- **Controlled Medicine Guidance**: Comfort remedies mandate explicit user acknowledgment to verify with a licensed pharmacist or physician.

---

## 🔄 Production Migration Checklist

When transitioning from MVP prototype to a full cloud backend (e.g., FastAPI, Node.js/Nest, or Supabase):

1. **Authentication & Session**:
   - Replace `authService.ts` with Supabase Auth or OAuth 2.0 with Argon2/bcrypt password hashing.
   - Implement short-lived JWT access tokens in memory and HTTP-only secure cookie refresh tokens.
2. **Server-Side Enforcement**:
   - Implement Row Level Security (RLS) or server-side ownership checks (`WHERE user_id = current_user_id()`).
   - Validate that delivery partner roles can only query order item names and delivery addresses, never user cycle tables.
3. **Identity Verification**:
   - Replace the mock partner verification status with DigiLocker / Persona / Stripe Identity integrations.
4. **Telephony & Masking**:
   - Connect Twilio Proxy or Exotel for real two-way phone masking between customers and delivery partners.
5. **Data Encryption**:
   - Implement client-side envelope encryption (e.g., WebCrypto API) so cycle notes are encrypted before transmission to cloud storage.

---

## 📂 Project Architecture

```
src/
├── app/
│   └── routes/           # AppRoutes with role routes (/app, /partner, /admin)
├── components/
│   ├── calendar/         # CalendarGrid, DailyLogDrawer
│   ├── color-picker/     # 2D GradientColorPicker with pointer events
│   └── navigation/       # RoleSwitcherBar, UserBottomNav, PartnerBottomNav, AdminNavbar
├── context/
│   └── AuthContext.tsx   # Session and demo role state
├── data/
│   └── seedData.ts       # 2+ months of daily logs, products, partners, orders
├── features/
│   ├── admin/            # Dashboard, VerificationQueue, OrdersAdmin, ProductCatalog, AuditLogView
│   ├── auth/             # AuthScreens with 1-click demo logins
│   ├── delivery-partner/ # PartnerDashboard, PartnerOrders, PartnerSafetyScreen
│   ├── onboarding/       # WelcomeScreen with value propositions & questionnaire
│   ├── orders/           # OrderFlowScreen (checkout & active delivery tracker)
│   ├── shop/             # CareShopScreen (catalog, discreet cart, pharmacist notice)
│   └── user/             # UserDashboard, CalendarScreen, InsightsScreen, ProfileScreen
├── models/
│   ├── types.ts          # TypeScript domain models (DailyLog, Order, Product, Partner, etc.)
│   └── validation.ts     # Zod validation schemas
├── services/             # Decoupled service layer ready for REST/Supabase swap
│   ├── adminService.ts
│   ├── authService.ts
│   ├── calendarPaintService.ts
│   ├── cartService.ts
│   ├── dailyLogService.ts
│   ├── deliveryPartnerService.ts
│   ├── orderService.ts
│   ├── predictionService.ts
│   ├── privacyService.ts
│   └── productService.ts
├── tests/                # Vitest unit & component test specifications
└── utils/
    ├── colorUtils.ts     # HSV/RGB/HEX conversions and contrast calculation
    └── dateUtils.ts      # Calendar matrix math and date formatting
```
