---
name: Mana Telugu Entertainment
colors:
  surface: '#10131b'
  surface-dim: '#10131b'
  surface-bright: '#363941'
  surface-container-lowest: '#0b0e15'
  surface-container-low: '#181b23'
  surface-container: '#1d2027'
  surface-container-high: '#272a32'
  surface-container-highest: '#32353d'
  on-surface: '#e0e2ed'
  on-surface-variant: '#e9bcb6'
  inverse-surface: '#e0e2ed'
  inverse-on-surface: '#2d3038'
  outline: '#af8782'
  outline-variant: '#5e3f3b'
  surface-tint: '#ffb4aa'
  primary: '#ffb4aa'
  on-primary: '#690003'
  primary-container: '#e50914'
  on-primary-container: '#fff7f6'
  inverse-primary: '#c0000c'
  secondary: '#f9bc45'
  on-secondary: '#422d00'
  secondary-container: '#bc8708'
  on-secondary-container: '#392600'
  tertiary: '#a7c8ff'
  on-tertiary: '#003061'
  tertiary-container: '#0072d7'
  on-tertiary-container: '#f8f9ff'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdad5'
  primary-fixed-dim: '#ffb4aa'
  on-primary-fixed: '#410001'
  on-primary-fixed-variant: '#930007'
  secondary-fixed: '#ffdea8'
  secondary-fixed-dim: '#f9bc45'
  on-secondary-fixed: '#271900'
  on-secondary-fixed-variant: '#5e4200'
  tertiary-fixed: '#d5e3ff'
  tertiary-fixed-dim: '#a7c8ff'
  on-tertiary-fixed: '#001b3c'
  on-tertiary-fixed-variant: '#004689'
  background: '#10131b'
  on-background: '#e0e2ed'
  surface-variant: '#32353d'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.005em
  title-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
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
  gutter: 1.25rem
  margin: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

Mana Telugu Entertainment is a premium dark-mode OTT streaming platform dedicated to Telugu Live TV. The interface is designed for Telugu-speaking households and diaspora audiences who want effortless, reliable access to live news, cinema, and entertainment channels across desktop, tablet, and mobile. The emotional tone is cinematic, focused, and welcoming—anchoring the viewer's attention on live video feeds without visual clutter.

The design system combines a **Minimalism** foundation with **Corporate / Modern** structure tailored for media streaming. Deep obsidian canvases, disciplined typography, and restrained micro-interactions ensure that channel artwork and live broadcasts remain the primary focal points. Surfaces rely on tonal separation and subtle borders rather than excessive gradients or heavy ornamentation.

## Colors

The palette is built on a deep, cinematic dark mode that minimizes eye strain during extended viewing and makes live video thumbnails pop.

* **Primary Accent (`#E50914`):** Live Red. Reserved strictly for live broadcast indicators, active playback states, primary call-to-action buttons (e.g., "Watch Live"), and active navigation highlights.
* **Secondary Accent (`#F5B942`):** Warm Gold. Used sparingly for premium tier badges, featured channel highlights, and subtle celebratory orcurated markers.
* **Backgrounds & Surfaces:**
  * **Primary Canvas (`#080B12`):** The deepest background layer for the main application viewport.
  * **Secondary Surface (`#111827`):** Used for sidebars, navigation bars, and grouped content sections.
  * **Card Surface (`#171D2A`):** Elevated surface for channel cards, EPG (Electronic Program Guide) rows, and modal dialogs.
* **Text & Borders:**
  * **Primary Text (`#FFFFFF`):** High-contrast white for channel titles, active program names, and primary headings.
  * **Secondary Text (`#9CA3AF`):** Muted cool gray for program schedules, metadata, timestamps, and inactive navigation items.
  * **Subtle Borders (`#1F2937`):** Low-contrast dark gray borders used to define card edges, dividers, and input fields without harsh visual breaks.

## Typography

The design system uses **Inter** across all typographic roles to ensure crisp legibility on dark backgrounds, whether scanning a dense Electronic Program Guide (EPG) or reading channel metadata from a distance.

* **Hierarchy & Weight:** Headlines use SemiBold (`600`) and Bold (`700`) weights with tight negative tracking (`-0.01em` to `-0.02em`) to give featured hero banners and category headers a strong, editorial presence.
* **Body & Metadata:** Program descriptions and schedules use Regular (`400`) weight at `14px`–`16px` with generous line heights (`20px`–`24px`) for effortless scanning.
* **Labels & Badges:** Live indicators (`LIVE`), channel numbers, and category chips use Medium (`500`) to SemiBold (`600`) weights with slightly expanded letter spacing (`0.02em`–`0.04em`) for instant recognition at small sizes.
* **Responsive Scaling:** Display and large headline sizes scale down on mobile viewports (`display-lg-mobile`, `headline-lg-mobile`) to preserve screen real estate for video thumbnails.

## Layout & Spacing

The layout follows a **Fluid Grid** philosophy, allowing horizontal channel carousels and live TV grids to stretch naturally across widescreen monitors while maintaining comfortable reading widths for text-heavy modals and settings.

* **Grid System:** A 12-column fluid grid on desktop (`>= 1280px`) with `20px` (`1.25rem`) gutters and `32px` (`2rem`) outer margins.
* **Breakpoints & Adaptation:**
  * **Desktop (`>= 1280px`):** 12-column grid, 4 to 6 channel cards per row, persistent left or top navigation.
  * **Tablet (`768px – 1279px`):** 8-column grid, 3 to 4 channel cards per row, `24px` outer margins.
  * **Mobile (`< 768px`):** 4-column grid, 1 to 2 channel cards per row (or horizontal scroll carousels), `16px` outer margins, and `12px` gutters.
* **Spacing Rhythm:** Generous vertical spacing (`space-xl` / `40px`) separates content rails (e.g., "Live News", "Telugu Cinema", "Devotional") so the interface feels breathable and uncrowded.

## Elevation & Depth

Visual hierarchy is achieved through **Tonal Layers** paired with **Low-Contrast Outlines**, avoiding heavy drop shadows or excessive gradients that muddy dark interfaces.

* **Surface Stacking:** Depth progresses from the primary canvas (`#080B12`) to secondary containers (`#111827`) and finally to interactive cards (`#171D2A`).
* **Ghost Borders:** Cards, navigation bars, and input fields are framed by `1px` solid borders in `#1F2937` to clearly delineate boundaries against the dark canvas.
* **Hover & Focus States:** Interactive channel cards respond to hover with a subtle scale (`1.02x`), a brightened border (`#374151`), and a soft, low-opacity ambient glow rather than harsh elevation jumps.

## Shapes

The design system uses a **Rounded** (`roundedness: 2`) shape language that softens the technical nature of a live TV grid and aligns with modern OTT streaming conventions.

* **Standard Elements (`0.5rem` / `8px`):** Buttons, input fields, and small badges use `8px` corner radii.
* **Cards & Containers (`1rem` / `16px`):** Channel cards, EPG program blocks, and modal dialogs use `rounded-lg` (`16px`) corners for a smooth, cinematic feel.
* **Hero & Featured Panels (`1.5rem` / `24px`):** Large featured broadcast banners use `rounded-xl` (`24px`) corners.

## Components

* **Buttons:**
  * *Primary:* Solid `#E50914` background, `#FFFFFF` text, `8px` radius, `12px 24px` padding. Used for "Watch Live" and primary actions. Hover darkens slightly to `#B91C1C`.
  * *Secondary:* `#171D2A` background with `1px` `#1F2937` border and `#FFFFFF` text. Hover shifts background to `#1F2937`.
  * *Ghost:* Transparent background with `#9CA3AF` text, transitioning to `#FFFFFF` on hover.
* **Channel Cards:** `#171D2A` background, `16px` radius, `1px` `#1F2937` border. Features a `16:9` live thumbnail or channel logo container at the top, followed by `16px` (`space-md`) internal padding housing the channel title (`title-md`), current program (`body-md` in `#9CA3AF`), and a subtle `#E50914` `LIVE` indicator dot or badge.
* **Chips (Category Filters):** Pill-shaped or `8px` rounded tags (`#111827` background, `#1F2937` border, `#9CA3AF` text) for genres like "News", "Movies", "Entertainment", and "Music". Active chips switch to `#FFFFFF` text with an `#E50914` border or solid fill.
* **Lists (EPG / Program Schedule):** Clean horizontal rows separated by `1px` `#1F2937` dividers. Active/currently airing rows feature a subtle `#171D2A` highlight and a `2px` `#E50914` left accent bar.
* **Input Fields:** `#111827` background, `1px` `#1F2937` border, `8px` radius, `#FFFFFF` text, and `#9CA3AF` placeholder text. Focus state applies a `1px` `#E50914` or `#F5B942` border.
* **Checkboxes & Radio Buttons:** `1px` `#374151` border on `#111827` fill. Checked states fill with `#E50914` and crisp `#FFFFFF` icons.
* **Live Badges & Premium Tags:** `LIVE` badges use `#E50914` background with `#FFFFFF` `label-sm` uppercase text. Premium/VIP channel tags use `#F5B942` text or subtle gold-tinted borders (`rgba(245, 185, 66, 0.3)`).