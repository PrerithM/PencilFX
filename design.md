# Pencil FX — Design System Specification

## 1. Brand Identity
- **Name**: Pencil FX
- **Wordmark Styling**:
  - The word **Pencil** is rendered in primary brand green (`#16834A`).
  - The letters **FX** are rendered in ink black (`#171917`).
- **Core Concept**: Academic paper-inspired physical stationery & document pre-order portal. Clean, tactile, reliable, and functional.

---

## 2. Colour Tokens
| Token | Hex | Role |
|-------|-----|------|
| `bg-paper` | `#F7F6F0` | Main canvas / warm ivory paper finish |
| `surface-paper` | `#FFFFFF` | Standard clean paper card surface |
| `surface-warm` | `#FAF9F5` | Secondary paper card / subtle highlight |
| `surface-muted` | `#EFECE6` | Table headers, chip backgrounds, disabled cards |
| `brand-primary` | `#16834A` | Primary green buttons, active states, key tags |
| `brand-deep` | `#105C36` | Dark forest green for hover states, focused borders |
| `brand-light` | `#EAF5EE` | Very soft green background for success alerts / badges |
| `text-ink` | `#171917` | Primary high-contrast typography |
| `text-muted` | `#5C605C` | Secondary notes, timestamps, specifications |
| `text-faint` | `#8C908C` | Placeholders, inactive hints |
| `border-paper` | `#E5E3D8` | Standard crisp 1px borders for cards and tables |
| `border-strong` | `#D2CFBF` | Input borders, active dividers |
| `status-ready` | `#16834A` | Green badge for "Ready for Pickup" / "In Stock" |
| `status-prep` | `#B45309` | Amber badge for "Preparing" / "Printing" |
| `status-out` | `#B91C1C` | Crimson badge for "Out of Stock" / "Cancelled" |

---

## 3. Typography
- **Font Stack**: System sans-serif with high legibility (`ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`).
- **Monospace Stack**: High-readability tabular mono for Order IDs, time slots, and tokens (`ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`).
- **Scale**:
  - Display / H1: `28px` / `32px`, font-bold, tracking-tight
  - Section / H2: `20px` / `24px`, font-semibold
  - Card Title / H3: `16px` / `20px`, font-semibold
  - Body: `14px` / `20px`, font-normal
  - Small / Meta: `12px` / `16px`, font-medium
  - Micro / Badges: `11px` / `14px`, font-semibold, uppercase, tracking-wider

---

## 4. Paper Background & Texture
- **Base Canvas**: Solid `#F7F6F0`.
- **Grain Overlay**: Lightweight SVG feTurbulence data URI applied as a fixed subtle overlay (`pointer-events: none; opacity: 0.035; mix-blend-mode: multiply;`).
- **Constraint**: Must never compromise text contrast, CPU performance, or mobile battery life.

---

## 5. Component Geometry & Shape System
- **Strictly Rectangular**:
  - Buttons, cards, modals, table rows, and input boxes use either `rounded-none` or subtle `rounded-sm` (max 2px–4px).
  - Strictly **NO** high border radii, pill-shaped cards (`rounded-full`), floating bubbles, or bubbly icons.
- **Borders**:
  - Consistent 1px solid borders (`border border-[#E5E3D8]`).
  - Active / selected states use 1.5px or 2px `#16834A`.
- **Shadows**:
  - Flat paper elevation only: `box-shadow: 0 1px 2px rgba(23, 25, 23, 0.04)`.
  - Strictly **NO** large diffused drop shadows, glassmorphism, or neon glow effects.

---

## 6. Components Standard

### Buttons
- **Primary**: Background `#16834A`, text `#FFFFFF`, border `#105C36`, hover `#105C36`.
- **Secondary**: Background `#FFFFFF`, text `#171917`, border `#D2CFBF`, hover `#FAF9F5`.
- **Danger / Cancel**: Background `#FFFFFF`, text `#B91C1C`, border `#FCA5A5`, hover `#FEF2F2`.
- **Disabled**: Background `#EFECE6`, text `#8C908C`, border `#E5E3D8`, cursor not-allowed.

### Form Inputs
- Background `#FFFFFF`, border 1px solid `#D2CFBF`, text `#171917`.
- Focus: Outline none, border 1.5px solid `#16834A`, ring 1px solid `#16834A`.
- Clear labels above input in `#171917` (13px, font-medium).
- Helper and validation text immediately below.

### Tables (Shopkeeper Dashboard)
- Header: Background `#EFECE6`, text `#5C605C`, uppercase, 11px font-semibold.
- Row: Background alternating `#FFFFFF` / `#FAF9F5`, border-b 1px `#E5E3D8`.
- Padding: `px-4 py-3`, compact data density.

### Badges & Status Chips
- Rectangular 1px bordered badges with uppercase mono or bold sans text:
  - `[ IN STOCK ]` -> bg `#EAF5EE`, text `#16834A`, border `#B7E1CD`
  - `[ OUT OF STOCK ]` -> bg `#FEF2F2`, text `#B91C1C`, border `#FECACA`
  - `[ READY FOR PICKUP ]` -> bg `#EAF5EE`, text `#16834A`, border `#16834A`

---

## 7. Responsive Rules
- Fluid grid down to 320px mobile viewport.
- Mobile catalog presents 1-column or 2-column cards with sticky bottom paper summary bar for cart & checkout.
- Shopkeeper dashboard renders a horizontally scrollable table on mobile or adaptive card view.

---

## 8. Accessibility
- Minimum contrast ratio 4.5:1 for all normal text against warm ivory/paper backgrounds.
- Explicit keyboard focus states with high contrast.
- ARIA labels on all modal dismiss actions and icon buttons.
