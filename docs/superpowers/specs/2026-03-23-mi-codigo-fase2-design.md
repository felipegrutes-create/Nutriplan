# Mi Código App — Fase 2 Design Spec

**Date:** 2026-03-23
**Product:** Mi Código (app PWA upsell — separate from "El Código Hormonal" ebooks)
**Target:** Women 40+ LATAM, hormonal balance focus
**Approach:** Incremental evolution of existing vanilla JS app
**Language:** Latin American Spanish (all UI)

---

## 1. Product Context

Mi Código is the **upsell app** sold separately after the main product "El Código Hormonal" (22 ebooks + portal). The app provides daily engagement (check-ins, trackers, shopping list) that the static ebooks cannot offer, justifying an additional purchase.

**Current state:** Working PWA with 5 tabs (Home, Check-in, Progress, Content, Recipes), localStorage persistence, Service Worker for offline, basic check-in (energy/mood/symptoms/weight).

**Phase 2 goal:** Transform into a comprehensive daily companion with expanded trackers, shopping list, motivational messages, and redesigned navigation.

---

## 2. Navigation — 5 Tabs + FAB Central

Redesign from current 5-tab layout to new structure with floating action button:

| Tab | Icon | Content |
|-----|------|---------|
| Home | 🏠 | Dashboard: greeting, quick stats (water/weight/mood), Mi Día progress card, daily tip, shortcuts |
| Progreso | 📊 | Charts (weight, water, mood, energy, sleep), streak stats, hormonal symptom frequency, export/import |
| **Mi Día (FAB)** | ☀️ | **Central floating button** — opens full daily check-in screen |
| Compras | 🛒 | Shopping list: recipe-generated + manual items, grouped by category |
| Más | 📖 | Recipes, Library (ebooks), Mini-course, Supplements, Plan 31 días, Tabla IG, Exercises, Settings, About |

The FAB (Floating Action Button) is a 52px circle that protrudes above the bottom nav bar with a gradient background and shadow, visually emphasizing the daily check-in as the primary action.

---

## 3. Mi Día — Daily Check-in

The core feature. Organized in sections with a save button at the bottom.

### 3.1 Daily Motivational Message (top)

Green gradient card at the top of Mi Día screen showing one message per day.

**Message types (4 categories):**
- 🌟 **Motivacional** — encouragement and empowerment
- 💡 **Educativa** — hormonal health facts and tips
- 🎯 **Acción** — specific daily challenge/action
- 🏆 **Celebración** — milestone celebrations (triggered at 3, 7, 14, 21, 30, 60, 90, 180, 365 days)

**Data:** `data/mensajes.json` — 365 messages, one per day, rotating by day-of-year. Celebration messages override the regular message when a milestone is reached.

**Message format:**
```json
{
  "messages": [
    {"day": 1, "type": "motivacional", "emoji": "💪", "text": "..."},
    ...
  ],
  "celebrations": [
    {"streak": 7, "emoji": "🎉", "title": "¡Racha de 7 días!", "text": "..."},
    ...
  ]
}
```

### 3.2 Cuerpo Section

- **Peso** — numeric input (kg), shows last recorded weight for reference
- **Energía** — slider 1-10, color gradient from red (low) to green (high)
- **Humor** — 4 emoji buttons: 😢 Mal, 😐 Regular, 😊 Bien, 🤩 ¡Genial!

### 3.3 Hábitos del Día Section

- **Agua** — 8 tappable cup icons, each tap fills one cup (visual: grey → green). Goal configurable in settings (default 8).
- **Comidas del Plan** — 4 toggle pills: Desayuno, Almuerzo, Cena, Snack. Tap to mark as completed.
- **Suplemento** — single toggle: Tomado / Pendiente
- **Ejercicio** — single toggle: Hecho / Pendiente

### 3.4 Descanso Section

- **Horas de sueño** — numeric input or stepper (0.5h increments)
- **Calidad de sueño** — 3 options: 😴 Bien, 😐 Regular, 😫 Mal

### 3.5 Ciclo Hormonal Section

- **Fase actual** — 5 selectable pills:
  - 🔴 Menstruación
  - 🟡 Folicular
  - 🟢 Ovulación
  - 🟣 Lútea
  - 🔵 Menopausia (if selected, saved in `mc_settings.menopause=true` and auto-selected daily; other phase options greyed out until toggled off in settings)

- **Síntomas hoy** — multi-select toggles:
  - Bochornos, Hinchazón, Insomnio, Dolor de cabeza, Antojo de dulce, Irritabilidad, Fatiga, Retención de líquidos

### 3.6 Save & Feedback

- **"💾 Guardar Mi Día"** button — saves all data to localStorage
- After save: celebration card appears if streak milestone reached
- Data keyed by date (YYYY-MM-DD) in respective localStorage keys

---

## 4. Shopping List (Compras)

### 4.1 Adding Items

**From recipes:**
- "Agregar desde recetas" button → opens recipe browser (same data as Recetas tab)
- User selects recipes → ingredients extracted from recipe JSON `ingredientes` arrays
- Ingredient parsing: keyword match against `categorias-compras.json` for categorization. Quantities kept as-is from the original string (no parsing of "2 tazas" etc. — too fragile for free-text). Non-ingredient lines (e.g., "Relleno:") filtered out by checking against category keywords.
- Each item tagged with source recipe name

**Manual:**
- Text input field + "+" button
- Items go to "Otros" category by default

### 4.2 Display

Items grouped by category with color-coded headers:
- 🥬 Frutas y Verduras (green)
- 🥩 Proteínas (red)
- 🏪 Despensa (gold)
- 🥛 Lácteos (blue)
- 🧂 Condimentos (purple)
- 📦 Otros (grey)

Each item shows: checkbox, name, quantity, source recipe tag (if from recipe).

**Checked items:** strikethrough text, reduced opacity, moved to bottom of category.

### 4.3 Actions

- **Compartir** — generates formatted text list, shares via Web Share API (WhatsApp, copy to clipboard)
- **Limpiar** — removes all checked items (with confirmation)
- Counter shows total items and how many purchased

### 4.4 Ingredient Category Mapping

`data/categorias-compras.json` — maps common ingredient keywords to categories:
```json
{
  "frutas_verduras": ["espinaca", "brócoli", "tomate", "aguacate", "limón", ...],
  "proteinas": ["pollo", "salmón", "huevo", "atún", "carne", ...],
  "despensa": ["avena", "harina", "aceite", "stevia", ...],
  "lacteos": ["leche", "yogur", "queso", ...],
  "condimentos": ["sal", "pimienta", "canela", "cúrcuma", ...]
}
```

---

## 5. Progreso — Charts & Data

### 5.1 Period Filter

Tab bar at top: 7 días | 30 días | 90 días | Todo. All charts and averages adjust to selected period.

### 5.2 Summary Cards

Three cards: Peso inicial, Peso actual, Total perdido (with celebration emoji if negative).

### 5.3 Charts (Chart.js)

- **Peso** — line chart with gradient fill, showing trend over time
- **Agua** — bar chart, daily cups for last 7 days of selected period

### 5.4 Averages

Mini cards showing period averages for: Humor (most frequent emoji + %), Energía (numeric avg), Sueño (hours avg).

### 5.5 Streak & Consistency

Gold card showing: current streak, check-in % this month, best streak ever.

### 5.6 Hormonal Symptoms

Frequency count of each symptom in selected period, with comparison to previous period (e.g., "↓ Bochornos bajaron 25%").

### 5.7 Export/Import

- **Export:** collects all `mc_*` keys from localStorage, wraps in versioned JSON, triggers file download as `mi-codigo-backup-YYYY-MM-DD.json`
- **Import:** file input, validates JSON structure and version, confirms overwrite, restores all data
- Shows date of last backup

**Backup JSON format:**
```json
{
  "version": "2.0",
  "exportedAt": "2026-03-24T10:00:00",
  "auth": {},
  "checkins": {},
  "water": {},
  "meals": {},
  "supplements": {},
  "exercise": {},
  "sleep": {},
  "cycle": {},
  "shopping": [],
  "settings": {}
}
```

---

## 6. Home Dashboard

### 6.1 Greeting

Dynamic greeting based on time of day: "¡Buenos días!" / "¡Buenas tardes!" / "¡Buenas noches!" + current date.

### 6.2 Quick Stats Row

Three mini cards: Water (cups today/goal), Weight (latest), Mood (today's selection).

### 6.3 Mi Día Progress Card

Shows completion progress: "4/7 ✓" with progress bar. Lists all check-in items as pills (green if done, grey if pending). Tapping the card navigates to Mi Día.

### 6.4 Daily Tip

Gold gradient card with rotating tip from `data/dicas.json` (already exists).

---

## 7. "Más" Tab

Settings-style list grouped in sections:

**Contenido:**
- 🍽️ Recetas (500+ recipes browser)
- 📚 Biblioteca (22 ebooks — links to portal or embedded)
- 🎓 Mini-curso (step-by-step lessons)
- 💊 Suplementos (supplement guide)

**Herramientas:**
- 📅 Plan de 31 Días
- 📊 Tabla Índice Glucémico
- 🏋️ Ejercicios

**Ajustes:**
- 💾 Exportar / Importar
- 🔔 Recordatorios (placeholder for Phase 3)
- ℹ️ Sobre Mi Código (v2.0)

---

## 8. Data Architecture

### 8.1 localStorage Keys

| Key | Format | Purpose |
|-----|--------|---------|
| `mc_auth` | `{email, startWeight, goalWeight, activatedAt}` | User authentication and profile |
| `mc_checkins` | `{"YYYY-MM-DD": {weight, energy, mood}}` | Daily body metrics |
| `mc_water` | `{"YYYY-MM-DD": number}` | Daily water cup count |
| `mc_meals` | `{"YYYY-MM-DD": {desayuno, almuerzo, cena, snack}}` | Meal plan adherence (booleans) |
| `mc_supplements` | `{"YYYY-MM-DD": boolean}` | Supplement taken |
| `mc_exercise` | `{"YYYY-MM-DD": boolean}` | Exercise completed |
| `mc_sleep` | `{"YYYY-MM-DD": {hours, quality}}` | Sleep tracking |
| `mc_cycle` | `{"YYYY-MM-DD": {phase, symptoms[]}}` | Hormonal cycle tracking |
| `mc_shopping` | `[{name, qty, category, checked, source}]` | Shopping list items |
| `mc_settings` | `{waterGoal, reminders}` | User preferences |
| `mc_backup_date` | `"YYYY-MM-DD"` | Last backup date |

### 8.2 JS Modules (IIFE pattern)

**Existing (to modify):**
- `js/app.js` — update navigation to 5 tabs + FAB, update home dashboard
- `js/auth.js` — add goalWeight to profile
- `js/checkin.js` — deprecate; all check-in logic moves to `midia.js`. Keep file but empty module (backward compat with any references)
- `js/progress.js` — expand with new charts and data sources
- `js/recetas.js` — keep as-is

**New modules:**
- `js/midia.js` — Mi Día unified check-in (all trackers in one screen)
- `js/shopping.js` — shopping list management (add, check, share, clear, recipe extraction)
- `js/messages.js` — daily motivational message selection and display
- `js/backup.js` — export/import functionality
- `js/cycle.js` — hormonal cycle phase and symptom tracking

### 8.3 Data Files (new)

- `data/mensajes.json` — 365 daily motivational messages + milestone celebrations
- `data/categorias-compras.json` — ingredient-to-category mapping for shopping list

---

## 9. Technical Constraints

- **Pure vanilla JS** — no frameworks, no build tools
- **IIFE module pattern** — matches existing codebase (`const Module = (() => { ... return {}; })()`)
- **localStorage only** — no backend, no API calls (except Google Fonts CDN)
- **PWA** — must maintain Service Worker compatibility, offline-first
- **Mobile-first** — all UI designed for 320px+ screens
- **Brand:** `--verde: #2E7D52`, `--rosa: #E8445A`, `--gold: #C9922A`, font: DM Sans
- **Content rules:** NEVER mention diabetes/diabético/ADA/CDC — frame as hormonal balance
- **Language:** Latin American Spanish throughout
- **Service Worker:** All new JS modules and data files must be added to the `sw.js` cache list

---

## 10. Out of Scope (Phase 3)

- Backend / Firebase / user accounts
- Push notifications
- Exercise videos
- Fasting timer
- Wearable integration
- Exportable PDF reports
- Real SMS messaging
