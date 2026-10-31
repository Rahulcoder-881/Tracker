---
name: Tracker Growth Platform
colors:
  surface: '#0e1323'
  surface-dim: '#0e1323'
  surface-bright: '#34394a'
  surface-container-lowest: '#080d1d'
  surface-container-low: '#161b2b'
  surface-container: '#1a1f30'
  surface-container-high: '#25293a'
  surface-container-highest: '#2f3446'
  on-surface: '#dee1f9'
  on-surface-variant: '#c5c5d5'
  inverse-surface: '#dee1f9'
  inverse-on-surface: '#2b3041'
  outline: '#8f909e'
  outline-variant: '#454652'
  surface-tint: '#bac3ff'
  primary: '#bac3ff'
  on-primary: '#02218b'
  primary-container: '#8296ff'
  on-primary-container: '#0b278f'
  inverse-primary: '#4155ba'
  secondary: '#cebdff'
  on-secondary: '#381385'
  secondary-container: '#4f319c'
  on-secondary-container: '#bea8ff'
  tertiary: '#50ddad'
  on-tertiary: '#003828'
  tertiary-container: '#00b386'
  on-tertiary-container: '#003d2c'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#dee1ff'
  primary-fixed-dim: '#bac3ff'
  on-primary-fixed: '#001159'
  on-primary-fixed-variant: '#263ca1'
  secondary-fixed: '#e8ddff'
  secondary-fixed-dim: '#cebdff'
  on-secondary-fixed: '#21005e'
  on-secondary-fixed-variant: '#4f319c'
  tertiary-fixed: '#71fac8'
  tertiary-fixed-dim: '#50ddad'
  on-tertiary-fixed: '#002116'
  on-tertiary-fixed-variant: '#00513b'
  background: '#0e1323'
  on-background: '#dee1f9'
  surface-variant: '#2f3446'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '600'
    lineHeight: 44px
    letterSpacing: -0.025em
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
    letterSpacing: -0.005em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-tablet: 2rem
  margin-desktop: 3rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system delivers an ultra-clean, systematic workspace engineered for high-agency students and ambitious professionals tracking goals, daily execution, and personal momentum. Rooted in utilitarian clarity, the aesthetic pairs the focused efficiency of developer-grade issue tracking with the structured flexibility of modern workspace documents.

The visual direction centers on quiet authority: deep atmospheric surfaces, razor-sharp typographic hierarchy, high-legibility data density, and restrained indigo illumination. Visual feedback is immediate, subtle, and tactile. The emotional tone evokes calm mastery, absolute control, and focused progress without overwhelming sensory noise.

## Colors

The palette operates on high functional contrast and deep ambient layers. The default mode is dark, anchored by an obsidian blue-slate canvas (`#0B1020`) layered with distinct card surfaces (`#172338`) and recessed secondary panels (`#111A2C`).

### Palette Tokens & Roles

- **Primary Accent (`#8296FF`):** Powers key actions, focused states, interactive selections, and subtle glow rings. In light mode, this deepens to `#526FE8`.
- **Secondary Accent (`#A78BFA`):** Reserved for AI-assisted insights, growth trajectory signals, and generative suggestions. In light mode, this renders as `#8064D9`.
- **Feedback & Semantics:**
  - **Success (`#35C99A` / Light: `#168B67`):** Completed tasks, habit streaks, positive growth indicators.
  - **Warning (`#F5B85C` / Light: `#C48B27`):** Approaching deadlines, low-capacity flags.
  - **Danger (`#F47783` / Light: `#D94D5B`):** Overdue items, blocked tasks, destructive actions.
- **Neutrals & Typography:**
  - **Canvas Base:** `#0B1020` (Light: `#F5F7FC`)
  - **Card / Raised Surface:** `#172338` (Light: `#FFFFFF`)
  - **Inset / Recessed Surface:** `#111A2C` (Light: `#EDF1F8`)
  - **Text Primary:** `#F4F6FC` (Light: `#172238`)
  - **Text Secondary:** `#98A6BC` (Light: `#6B7890`)
  - **Structural Borders:** Dark surfaces utilize translucent borders (`rgba(255, 255, 255, 0.08)` to `rgba(255, 255, 255, 0.12)`). Light surfaces utilize crisp slate dividers (`#E2E8F0`).

## Typography

The type system is strictly utilitarian, leveraging `Inter` across all tiers for consistent horizontal rhythm, crisp numerals, and immaculate tabular tracking.

### Rules of Application

- **Headlines:** Set with tight tracking (`-0.02em` to `-0.025em`) and semi-bold weights to anchor visual hierarchy without shouting. Mobile viewports reduce display headlines proportionally to preserve horizontal breathing room.
- **Body:** Calibrated line heights (`1.5x` to `1.6x`) prevent fatigue during deep reading sessions, audit logs, and breakdown lists.
- **Labels & Micro-copy:** Rendered with slight letter-spacing adjustments (`+0.01em` to `+0.04em`) to ensure instant legibility on micro status badges, timestamp meta, and keyboard navigation shortcuts. Numbers across metric tables and timers must enforce tabular figures (`font-variant-numeric: tabular-nums`).

## Layout & Spacing

Layout geometry follows an 8-point spatial model (with 4px sub-increments for compact interactive elements).

### Screen Adaptation

- **Mobile (< 768px):** Single-column fluid stream bounded by a `1rem` outer margin. Touch targets maintain a minimum vertical height of 44px. Content relies on sticky action bars and a thumb-accessible floating dock.
- **Tablet (768px - 1024px):** 8-column layout with `1rem` gutters and `2rem` outer margins. Side panels collapse into progressive overlay drawers.
- **Desktop (> 1024px):** 12-column layout with `1.5rem` gutters and `3rem` margins. Three-pane split view accommodates navigation, execution board, and contextual AI insights concurrently.

All component internal padding is explicitly decoupled from layout gutters, relying on `space-xs` through `space-xl` tokens to govern density.

## Elevation & Depth

Depth is established primarily through **tonal layering** and **low-contrast glassmorphic edges**, avoiding heavy blurred drop-shadows that clutter dark environments.

### Elevation Hierarchy

1. **Canvas (`Level 0` - `#0B1020`):** The primary root surface. Flat, non-reflective.
2. **Sub-surfaces (`Level 0.5` - `#111A2C`):** Inset containers, grouped list wells, and tabular headers.
3. **Card Surfaces (`Level 1` - `#172338`):** Elevated work units surrounded by a 1px perimeter stroke (`rgba(255, 255, 255, 0.08)`).
4. **Interactive Overlays & Popovers (`Level 2` - `#1C2B44`):** Command palettes, dropdown menus, and date pickers. Enhanced with a subtle directional shadow (`0 8px 24px -4px rgba(0, 0, 0, 0.45)`) and a crisper 1px border (`rgba(255, 255, 255, 0.12)`).
5. **AI Insight Banners & Active Cards:** Differentiated by a dual perimeter: an inner border tinted with Primary Accent (`rgba(130, 150, 255, 0.3)`) paired with a diffused ambient glow (`0 0 20px -4px rgba(130, 150, 255, 0.15)`).

## Shapes

The design system implements a refined `roundedness: 2` scale, standardizing container and component radii to achieve a modern, approachable, and disciplined interface.

- **Standard Elements (`0.5rem` / 8px):** Default cards, checklist containers, input fields, and standard buttons.
- **Large Containers (`1rem` / 16px):** Dialog modals, AI insight banners, and bottom navigation dock wrappers.
- **Pills (`9999px`):** Status badges, category tags, avatar status dots, and the active navigation glow indicator.

## Components

### Buttons
- **Primary:** Solid `#8296FF` background with `#0B1020` text, medium weight, `0.5rem` radius. Subtle active state compression (`scale(0.98)`).
- **Secondary:** Surface `#172338` with `1px rgba(255, 255, 255, 0.1)` border and `#F4F6FC` text.
- **Floating Action Button (FAB):** Elevated circle or pill with `#8296FF` surface, high-contrast white glyph, soft shadow (`0 4px 16px rgba(130, 150, 255, 0.3)`), anchored with mobile safe-area clearance.

### Chips & Micro Status Badges
- **Status Badges:** Compact height (20-22px), `rounded-full`, uppercase or title case typography (`label-sm`). Rendered with a 10% opacity tint of semantic color (e.g., `#35C99A1A`) and a solid glyph/dot indicator.
- **Pill Tags:** Surface `#111A2C`, soft border, label typography (`label-md`), used for tagging domains (e.g., `Engineering`, `Deep Work`, `Academic`).

### Task Checklist Cards
- Background `#172338`, border `rgba(255, 255, 255, 0.08)`, inner padding `space-md`.
- High-contrast checkbox: rounded-md (`0.25rem`), custom SVG tickmark, changing from an outline state (`rgba(255, 255, 255, 0.2)`) to an active `#8296FF` fill upon completion with strike-through transition on title.

### Interactive Progress Meters
- Thin track height (4px to 6px), background `#111A2C`, fully rounded radius.
- Dynamic fill bar using a smooth linear gradient transition from `#8296FF` to `#35C99A` representing streak and task velocity.

### Sleek AI Insight Banners
- Background `#172338` elevated with a translucent linear gradient overlay (`linear-gradient(135deg, rgba(167, 139, 250, 0.08) 0%, transparent 100%)`).
- Border: `1px solid rgba(167, 139, 250, 0.25)`.
- Left-aligned indicator icon with a soft ambient indigo glow (`#A78BFA`).

### Bottom Navigation Dock
- Fixed floating glass bar at screen bottom with `backdrop-filter: blur(16px)` and background `rgba(23, 35, 56, 0.85)`.
- Active item marked by a smooth background pill indicator (`rgba(130, 150, 255, 0.15)`) and `#8296FF` icon highlight.
- Enforces safe-area inset padding (`env(safe-area-inset-bottom)`) for seamless mobile ergonomics.