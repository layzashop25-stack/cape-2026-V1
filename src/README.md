# 🛡️ CAPE — Child Protection App

> A local, offline-first case management system for child protection workers.  
> Built with React + TypeScript + Vite. No cloud. No server. 100% private.

---

## 🧠 Project Summary (for AI context)

CAPE is a **Windows desktop web app** that runs entirely locally via a local Vite dev server launched through `.bat` / `.vbs` scripts. There is no Electron, no backend, no database server — data is stored in a single `data/database.json` file.

### Tech Stack
| Layer | Tech |
|---|---|
| UI Framework | React 18 + TypeScript |
| Styling | Tailwind CSS |
| Bundler | Vite 5 |
| Charts | Recharts |
| Exports | jsPDF, jspdf-autotable, xlsx, docx |
| Date utils | date-fns |
| Icons | lucide-react |
| i18n | Custom context (AR / FR / EN) |
| Storage | JSON file (`data/database.json`) |

### App Structure
```
src/renderer/
├── components/        # Reusable UI (Button, Card, Input, Select, ErrorBoundary)
├── features/
│   ├── cases/         # CaseFormArabic, CaseList, EditCaseModal, RapportModal
│   ├── dashboard/     # Stats dashboard with Recharts
│   ├── calendar/      # Event calendar
│   └── settings/      # App settings
├── i18n/              # LanguageContext + translations (AR/FR/EN)
├── services/          # database.ts, export.ts, rapportExport.ts, stats.ts
├── types/             # Shared TypeScript types (Case, Database, Stats...)
├── App.tsx            # Root layout + sidebar navigation
└── main.tsx           # Entry point
```

### Data Model (key type: `Case`)
Each case tracks: child info, parents info, abuser info, violence types, school status, medical history, substances, and social coverage. Stored as a JSON array in `data/database.json`.

### How the app launches
1. `setup.bat` → runs `npm install`
2. `CAPE.vbs` → silently runs `start-cape.bat` → runs `npm run dev` → opens browser at `localhost:5173`
3. `create-package.bat` → bundles the app into `CAPE-Package/` for distribution (no Node.js needed for end users)

---

## 🚀 Quick Start

### First time
```
Double-click: setup.bat
Double-click: CAPE.vbs
```

### Daily use
```
Double-click: CAPE.vbs
```

### For developers
```bash
npm install
npm run dev
```

---

## 📦 Distribution

```
Double-click: create-package.bat
→ Zip the CAPE-Package/ folder and share
```

End users need: Windows 10/11 + a browser. No Node.js required.

---

## ✨ Features

- 📋 Full child case intake form (Arabic-first)
- 📊 Dashboard with statistics and charts
- 📅 Calendar with events
- 🌍 Multi-language: Arabic, French, English
- 📄 Export cases to PDF / Excel / Word
- 💾 Import / Export database (JSON)
- 🔒 100% local — no internet, no cloud

---

## 📁 Key Files

| File | Purpose |
|---|---|
| `CAPE.vbs` | Silent app launcher |
| `start-cape.bat` | App launcher with console |
| `setup.bat` | First-time install |
| `create-package.bat` | Build distribution package |
| `data/database.json` | Local data storage |
| `src/renderer/services/database.ts` | DB read/write logic |
| `src/renderer/types/index.ts` | All TypeScript types |

---

## 👤 Author

**Mehdi** — [@mehdi2114](https://github.com/mehdi2114)  
License: MIT

---

*Made with ❤️ for Child Protection workers.*
