---
name: Architectural Curator
colors:
  surface: '#faf9fc'
  surface-dim: '#dad9dd'
  surface-bright: '#faf9fc'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f3f7'
  surface-container: '#eeedf1'
  surface-container-high: '#e9e7eb'
  surface-container-highest: '#e3e2e6'
  on-surface: '#1a1c1e'
  on-surface-variant: '#43474e'
  inverse-surface: '#2f3033'
  inverse-on-surface: '#f1f0f4'
  outline: '#74777f'
  outline-variant: '#c4c6cf'
  surface-tint: '#455f87'
  primary: '#022448'
  on-primary: '#ffffff'
  primary-container: '#1e3a5f'
  on-primary-container: '#8aa4cf'
  inverse-primary: '#adc8f5'
  secondary: '#006a68'
  on-secondary: '#ffffff'
  secondary-container: '#a0f1ed'
  on-secondary-container: '#10706e'
  tertiary: '#341f00'
  on-tertiary: '#ffffff'
  tertiary-container: '#503300'
  on-tertiary-container: '#c69b5f'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d5e3ff'
  primary-fixed-dim: '#adc8f5'
  on-primary-fixed: '#001c3b'
  on-primary-fixed-variant: '#2d486d'
  secondary-fixed: '#a0f1ed'
  secondary-fixed-dim: '#84d4d1'
  on-secondary-fixed: '#00201f'
  on-secondary-fixed-variant: '#00504e'
  tertiary-fixed: '#ffddb2'
  tertiary-fixed-dim: '#edbf7f'
  on-tertiary-fixed: '#291800'
  on-tertiary-fixed-variant: '#60410c'
  background: '#faf9fc'
  on-background: '#1a1c1e'
  surface-variant: '#e3e2e6'
typography:
  display-lg:
    fontFamily: Space Grotesk
    fontSize: 56px
    fontWeight: '600'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 28px
    fontWeight: '500'
    lineHeight: '1.2'
  title-md:
    fontFamily: Space Grotesk
    fontSize: 20px
    fontWeight: '500'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Work Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: 0.01em
  body-md:
    fontFamily: Work Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-sm:
    fontFamily: Work Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.0'
    letterSpacing: 0.12em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  gutter: 24px
  margin-mobile: 20px
  margin-desktop: 64px
  max-width: 1440px
---

## Brand & Style

The design system embodies the "Architectural Curator" persona—a blend of structural precision and editorial grace. It is built upon the principles of **Architectural Minimalism**, emphasizing space as a functional element rather than a void. The system avoids decorative clutter, relying instead on the rhythmic placement of content and the sophisticated interplay of light and shadow.

The target audience consists of design professionals and discerning collectors who value clarity and intellectual rigor. The emotional response is one of **calm authority**; the UI feels established yet progressive, providing a premium "gallery" environment where content is the primary focus. High-contrast typography and generous whitespace create a sense of curated luxury.

## Colors

The palette is rooted in a naturalistic, academic foundation. The primary **Deep Indigo** provides a stable, grounding force for text and structural elements. The **Parchment** surface creates a warm, breathable backdrop that is less clinical than pure white, evoking the feel of high-quality architectural vellum.

Hierarchy is strictly managed through **Tonal Layering** rather than borders. This creates a "molded" appearance where surfaces transition through subtle shifts in value:

- **Surface**: The base canvas.
- **Surface Container Low**: Used for subtle grouping and subtle background shifts.
- **Surface Container**: The primary container level for cards and navigation.
- **Surface Container Highest**: Reserved for active states or deeply recessed elements.
- **Oxidized Teal**: Employed sparingly as a functional accent for primary actions and success indicators, providing a sophisticated contrast to the indigo.

## Typography

Typography is the primary vehicle for the "curated" aesthetic. **Space Grotesk** is used for headlines, bringing a technical, geometric edge that feels engineered and contemporary. **Work Sans** handles all functional and body text, ensuring high legibility.

A critical stylistic signature is the use of **Work Sans in Uppercase with expanded tracking** for metadata, labels, and micro-copy. This creates a rhythmic, archival feel reminiscent of museum placards. All body text should maintain a generous line height to preserve the editorial "air" of the layout.

## Layout & Spacing

The layout follows a **Fluid Grid** model with strict horizontal alignment to mimic architectural blueprints.

- **Desktop**: A 12-column grid with 64px outer margins. Content blocks should span at least 2 columns to maintain structural integrity.
- **Mobile**: A 4-column grid with 20px margins.
- **Spacing Rhythm**: All vertical spacing is derived from a 8px base unit. Component internal padding should be generous (24px - 32px) to prevent visual crowding.

Elements should be aligned to a "hanging" baseline where possible, creating a strong vertical axis that guides the eye through the archival content.

## Elevation & Depth

Depth is communicated through "Natural Ink" shadows and material transparency rather than stark outlines.

- **Shadows**: Use a custom shadow formula utilizing the **Deep Indigo** (#1E3A5F) at 6-10% opacity. Shadows must be extremely diffuse (high blur, low spread) to simulate natural ambient light hitting a physical surface.
- **Glassmorphism**: Floating elements (menus, dialogs, hover-states) utilize a "Surface Variant" effect: 60% opacity of the Surface color paired with a 12px backdrop blur. This allows the structural grid of the page to remain visible beneath the active layer, maintaining the sense of spatial depth.

## Shapes

The design system uses a distinctive **24px Squircle** (superellipse) for all major containers, including cards, input fields, and dialogs. This specific curvature is softer and more organic than a standard rounded rectangle, reinforcing the premium, custom-built nature of the architecture. Smaller elements like chips or buttons should scale this curvature proportionally to maintain a consistent visual language.

## Components

- **Buttons**: Primary buttons are solid Deep Indigo with white text. Secondary buttons use the Tonal Layering approach (Surface Container Highest) with no border.
- **Cards**: Cards must use the 24px Squircle radius and the "Natural Ink" shadow. Avoid borders; use Surface Container Low against the base Surface for definition.
- **Input Fields**: Soft squircle containers using Surface Container. Focus states are indicated by a subtle shift to the Oxidized Teal for the label or a 2px inner "ink" shadow.
- **Labels/Chips**: Always Uppercase Work Sans with 0.12em tracking. Use Surface Container Highest for the background to keep them distinct but understated.
- **Dialogs & Menus**: These are the primary vehicles for the Glassmorphism effect. They should appear to float over the content, utilizing the 12px blur to maintain focus while preserving the editorial context underneath.
- **Lists**: Items are separated by whitespace and tonal shifts rather than lines. A hover state should simply transition the background to Surface Container.
