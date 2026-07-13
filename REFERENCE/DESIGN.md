---
name: Horizon Enterprise
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#534434'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#867461'
  outline-variant: '#d8c3ad'
  surface-tint: '#855300'
  primary: '#855300'
  on-primary: '#ffffff'
  primary-container: '#f59e0b'
  on-primary-container: '#613b00'
  inverse-primary: '#ffb95f'
  secondary: '#0051d5'
  on-secondary: '#ffffff'
  secondary-container: '#316bf3'
  on-secondary-container: '#fefcff'
  tertiary: '#006c49'
  on-tertiary: '#ffffff'
  tertiary-container: '#30c88f'
  on-tertiary-container: '#004e34'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffddb8'
  primary-fixed-dim: '#ffb95f'
  on-primary-fixed: '#2a1700'
  on-primary-fixed-variant: '#653e00'
  secondary-fixed: '#dbe1ff'
  secondary-fixed-dim: '#b4c5ff'
  on-secondary-fixed: '#00174b'
  on-secondary-fixed-variant: '#003ea8'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
typography:
  display-lg:
    fontFamily: Manrope
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  sidebar-width: 280px
  content-tuck: 32px
  gutter: 24px
  margin-page: 40px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 24px
---

## Brand & Style

The design system establishes a premium, production-quality aesthetic tailored for high-stakes enterprise travel management. It targets professional travel agents and corporate administrators, evoking feelings of efficiency, precision, and world-class hospitality.

The visual style is a fusion of **Corporate Modern** and **Glassmorphism**. It leverages the structural discipline of fintech leaders like Linear or Stripe—utilizing crisp typography and ample white space—while introducing tactile, "physical" elements inspired by premium travel artifacts. 

Key Brand Pillars:
- **Aerodynamic Precision:** Every element feels intentional and lightweight.
- **Warm Professionalism:** A palette that balances the energy of travel with the reliability of enterprise software.
- **Layered Clarity:** Using translucency and depth to organize complex visa and flight data without overwhelming the user.

## Colors

This design system uses a warm, high-contrast palette to distinguish between actions and navigation.

- **Primary (Warm Orange):** Reserved for high-intent actions, global sidebar gradients, and brand identifiers.
- **Secondary (Royal Blue):** Used for interactive accents, links, and processing states to maintain a professional "SaaS" feel.
- **Backgrounds:** The primary interface uses an off-white/warm-gray (`#F8F9FA`) to reduce eye strain during long administrative sessions. 
- **Semantic Logic:** Status colors follow a strict mapping. Use light-tinted backgrounds (10% opacity) with full-saturation text for status chips to ensure readability and a premium feel.

## Typography

The typography system prioritizes legibility and hierarchical scale. 

**Manrope** is used for headlines to provide a modern, technical, yet approachable character. **Inter** is used for all functional UI elements, body text, and data inputs to ensure maximum clarity in dense tables and forms.

- **Scale:** Use `headline-lg` for page titles and `label-md` for table headers.
- **Weight:** Maintain a strict distinction between regular (400) for prose and medium/semi-bold (500/600) for interactive elements.
- **Mobile:** For screens below 768px, `display-lg` should downscale to `headline-lg` (32px) to prevent layout overflow.

## Layout & Spacing

This design system utilizes a **Fixed Sidebar + Fluid Content** model. 

- **The Sidebar:** Fixed at 280px. It features a vertical gradient from Primary Orange to a deeper Amber. 
- **The Content Tuck:** The main content area is a white/off-white surface that overlaps the sidebar. It must have a `border-top-left-radius: 32px` and `border-bottom-left-radius: 32px`. This creates a distinctive "tucked" silhouette where the content sits over the brand layer.
- **Grid:** Use a 12-column grid for the internal content area with a 24px gutter. 
- **Breakpoints:**
  - **Desktop:** 1200px+ (Full sidebar + fluid content).
  - **Tablet:** 768px - 1199px (Sidebar collapses to icons, content margins reduce to 24px).
  - **Mobile:** <767px (Sidebar becomes a bottom navigation or hamburger overlay, tuck effect is disabled).

## Elevation & Depth

Hierarchy is established through **Soft Shadows** and **Glassmorphism**.

1.  **Level 0 (Base):** The sidebar gradient and the main page background.
2.  **Level 1 (Surface):** Main content cards and data tables. Use an extremely soft shadow: `0 4px 20px rgba(0, 0, 0, 0.04)`.
3.  **Level 2 (Interaction):** Hover states on cards and active input fields. Increase shadow to `0 8px 30px rgba(0, 0, 0, 0.08)`.
4.  **Glassmorphism:** Use for floating elements like notifications or flight status overlays. Apply `backdrop-filter: blur(12px)` with a white surface at 80% opacity and a thin 1px white border at 20% opacity.

## Shapes

The shape language is generous and friendly, moving away from the sharp edges of traditional enterprise software.

- **Standard Elements:** Buttons, inputs, and small chips use a `0.5rem` (8px) radius.
- **Large Components:** Main content containers and boarding-pass cards use a `1rem` to `1.5rem` (16px-24px) radius.
- **The Signature Tuck:** The primary dashboard container uses a unique `2rem` (32px) radius on its left side only.

## Components

### Buttons & Controls
- **Primary Button:** Solid Warm Orange with white text. Sublte inner-glow on hover.
- **Secondary Button:** Ghost style with Royal Blue border and text.
- **Toggles:** Use the status colors for active states (e.g., Green for "Active" toggle).

### Cards (Boarding Pass Style)
Cards should mimic the aesthetics of a premium ticket. Use a vertical dashed line to separate "Action/Status" from "Details". Incorporate subtle, light-gray route-line patterns in the background of the card header.

### Input Fields
Inputs should be large (min 48px height) with a subtle warm-gray fill (`#F3F4F6`). The border should only appear on focus, using the Royal Blue accent.

### Sidebar Items
Inactive icons are white at 70% opacity. Active items feature a white semi-transparent background (Glassmorphism) and 100% opacity icons, with a thick 4px white indicator bar on the far left.

### Travel Accents
- **Icons:** Use thin-stroke (1.5pt) icons.
- **Patterns:** Apply a 5% opacity "Compass Rose" or "Grid" pattern to the top-right corner of header sections to add texture without distracting from data.