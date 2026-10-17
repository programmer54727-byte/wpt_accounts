# Theme Documentation — WPT Accounts

This document defines the official **Light** and **Dark** theme for the WPT Accounts application.

The theme system is designed to be clean, professional, and easy on the eyes for long working hours (especially important for accounting software).

---

## Design Goals

- Clean and professional look suitable for finance/accounting
- High contrast for readability
- Soft backgrounds to reduce eye strain
- Consistent color usage across both themes
- Easy to implement with Tailwind CSS + CSS variables

---

## Color Palette

### 1. Brand / Primary Color

| Name          | Hex       | Usage                          |
|---------------|-----------|--------------------------------|
| Primary       | `#2563EB` | Buttons, links, active states  |
| Primary Hover | `#1D4ED8` | Hover state of primary buttons |
| Primary Soft  | `#DBEAFE` | Light theme soft backgrounds   |

---

### 2. Light Theme

| Token               | Hex       | Usage                              |
|---------------------|-----------|------------------------------------|
| Background          | `#F8FAFC` | Main page background               |
| Surface             | `#FFFFFF` | Cards, modals, sidebars            |
| Surface Elevated    | `#FFFFFF` | Elevated cards / dropdowns         |
| Border              | `#E2E8F0` | Borders, dividers                  |
| Text Primary        | `#0F172A` | Main headings & body text          |
| Text Secondary      | `#475569` | Secondary text, labels             |
| Text Muted          | `#94A3B8` | Placeholders, disabled text        |
| Success             | `#16A34A` | Positive amounts, success states   |
| Danger / Error      | `#DC2626` | Negative amounts, errors           |
| Warning             | `#D97706` | Warnings, pending states           |
| Info                | `#2563EB` | Informational highlights           |

---

### 3. Dark Theme

| Token               | Hex       | Usage                              |
|---------------------|-----------|------------------------------------|
| Background          | `#0F172A` | Main page background               |
| Surface             | `#1E293B` | Cards, modals, sidebars            |
| Surface Elevated    | `#334155` | Elevated cards / dropdowns         |
| Border              | `#334155` | Borders, dividers                  |
| Text Primary        | `#F1F5F9` | Main headings & body text          |
| Text Secondary      | `#94A3B8` | Secondary text, labels             |
| Text Muted          | `#64748B` | Placeholders, disabled text        |
| Success             | `#22C55E` | Positive amounts, success states   |
| Danger / Error      | `#EF4444` | Negative amounts, errors           |
| Warning             | `#F59E0B` | Warnings, pending states           |
| Info                | `#3B82F6` | Informational highlights           |

---

## Typography

- **Font Family**: Inter (or system-ui as fallback)
- **Headings**: Semibold / Bold
- **Body**: Regular (400)
- **Numbers (amounts)**: Prefer tabular figures for better alignment

---

## Recommended CSS Variables

You can implement the theme using CSS custom properties:

```css
:root {
  /* Light Theme (default) */
  --background: #F8FAFC;
  --surface: #FFFFFF;
  --surface-elevated: #FFFFFF;
  --border: #E2E8F0;
  --text-primary: #0F172A;
  --text-secondary: #475569;
  --text-muted: #94A3B8;
  --primary: #2563EB;
  --primary-hover: #1D4ED8;
  --success: #16A34A;
  --danger: #DC2626;
  --warning: #D97706;
}

.dark {
  --background: #0F172A;
  --surface: #1E293B;
  --surface-elevated: #334155;
  --border: #334155;
  --text-primary: #F1F5F9;
  --text-secondary: #94A3B8;
  --text-muted: #64748B;
  --primary: #3B82F6;
  --primary-hover: #2563EB;
  --success: #22C55E;
  --danger: #EF4444;
  --warning: #F59E0B;
}
```

---

## Implementation Notes

1. Use `class="dark"` on the `<html>` element to switch themes.
2. Prefer Tailwind’s `dark:` variant along with CSS variables.
3. Keep financial numbers (debit/credit) clearly colored:
   - Positive / Credit → Success green
   - Negative / Debit → Danger red
4. Avoid pure black (`#000000`) and pure white in dark mode for better comfort.
5. Maintain minimum contrast ratio of 4.5:1 for text.

---

## Theme Toggle

A theme toggle button should be available in the top navigation bar (sun/moon icon).

Preferred behavior:
- Remember user preference in `localStorage`
- Also respect system preference (`prefers-color-scheme`) on first visit

---

**Document maintained by Web Power Tech**  
Last updated: October 2026
