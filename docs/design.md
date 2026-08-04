# Pasal Karobar Design System

## Visual Identity

A professional, modern, and accessible design system for a business management platform. The aesthetic is clean and high-contrast, utilizing a sophisticated dark green palette balanced by soft off-white backgrounds to ensure readability and a sense of trust.

## Color Palette

### Primary (Brand)

- **Deep Forest**: `#1B3320` — Used for main headers, navigation backgrounds, and primary action buttons.
- **Action Green**: `#457B5D` — Used for primary actions, the center **+** in mobile nav, and positive trend indicators.
- **Profit Green**: `#D1E4D1` — A soft light green used for background highlights on success-related metrics.

### Neutral & UI

- **Canvas**: `#F9F9F7` — The main background color for the application.
- **Surface**: `#FFFFFF` — Used for metric cards and containers to create depth.
- **Text Primary**: `#1A1A1A` — High contrast for headings and core data.
- **Text Secondary**: `#666666` — Used for labels and secondary metadata.

## Typography

- **Typeface**: [DM Sans](https://fonts.google.com/specimen/DM+Sans) across the app — neutral, medium height, readable at small sizes (including the sidebar tagline).
- **Headings & data**: **600–700** weight.
- **Body & labels**: **400–500**; avoid wide letter-spacing on taglines and metadata.
- **Subheadings**: All-caps, tracked-out secondary labels for section headers (e.g., "BUSINESS OVERVIEW").
- **Currency/Data**: Semi-bold, large figures for primary metrics (e.g., "Rs. 1,072").

## Components

### Metric Cards

- **Structure**: Rounded corners (`1.5rem` / `24px`), subtle borders or white backgrounds.
- **Layout**: Label at the top, primary data figure in bold central position.
- **Variations**: Full-width cards for Profit; split half-width cards for Revenue/Expenses.

### Navigation

- **Mobile**: Fixed bottom navigation bar with clear iconography (Dashboard, Activity, Settings).
- **Active State**: Inverted colors or bold icons to indicate current location.

### Buttons

Use the shared `Button` component (`src/components/ui/button.tsx`):

- **Primary** (`variant="primary"`) — main actions: gradient fill, on-primary text, squircle. Sizes: `cta` (48px) for forms/dialogs, `prominent` (56px) for hero actions (New Entry, Record Transaction).
- **Secondary** (`variant="secondary"`) — cancel, alternate actions: outlined surface, on-surface text, squircle.
- **Ghost** — icon-only toolbar/nav controls; not for primary page actions.

### Confirm drawer

- Global **`ConfirmDrawer`** (`src/components/confirm-drawer/`) — bottom sheet drawer for destructive or important confirmations.
- Use **`useConfirmDrawer().confirm()`** or **`runConfirmedAction()`** from any client component inside `ConfirmDrawerProvider`.

## Layout & Spacing

- **Padding**: Generous padding (`1.5rem`) within cards and containers.
- **Grid**: Fluid vertical stack for mobile, maintaining clear vertical rhythm between sections.
