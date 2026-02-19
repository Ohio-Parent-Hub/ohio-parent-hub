# Ohio Parent Hub - Brand & Design System

**Version:** 1.0  
**Last Updated:** February 18, 2026

---

## 🎨 Brand Positioning

**Brand Name:** Ohio Parent Hub  
**Tone:** Playful Retro  
**Audience:** Ohio parents (young families, 25–45)

### Brand Personality
- **Fun but mature** - Not childish, not corporate
- **Friendly but not juvenile** - Warm without being condescending  
- **Modern but not tech-cold** - Approachable and human
- **Community-focused** - Trustworthy without feeling governmental

### Visual Vibe
Soft retro primaries, lifestyle editorial feel. **Not** daycare-cartoon aesthetic.

---

## 🏷️ Logo System

### 1️⃣ Primary Logo (State Silhouette Version)
- Ohio silhouette in dusty teal
- "Ohio" in script layered inside top portion
- "Parent Hub" in large playful serif stacked
- Minimal decorative sparkles

**Use for:**
- Website header
- Press materials
- Marketing graphics

### 2️⃣ Badge Logo (Circular Version)
- Circular outer ring with "OHIO PARENT HUB" around edge
- Ohio silhouette centered
- Subtle hub heart/dot inside state
- Minimal sparkles

**Use for:**
- Social avatars
- Profile images
- Stickers
- App icon

### 3️⃣ Icon Mark (Simplified State)
- Solid Ohio silhouette
- Cream inner state cutout
- Small heart in center (hub symbol)
- **No text**

**Use for:**
- Favicon
- Mobile nav
- Small UI applications

---

## 🎨 Color Palette

### Primary Brand Colors

| Color | Hex | RGB | Usage |
|-------|-----|-----|-------|
| **Dusty Teal** | `#6B8F95` | `107, 143, 149` | Ohio silhouette, primary backgrounds |
| **Mustard** | `#D6A21E` | `214, 162, 30` | Accent letters, highlights, buttons |
| **Blush Pink** | `#E7A7A9` | `231, 167, 169` | Accent typography, decorative elements |
| **Cream** | `#F4F1EC` | `244, 241, 236` | Backgrounds, inner state cutout |
| **Sage** | `#9FB8A3` | `159, 184, 163` | Secondary backgrounds, subtle UI areas |
| **Soft Teal (Darker)** | `#5F7F84` | `95, 127, 132` | Borders, hover states |

### Quick Reference (for Tailwind)
```js
colors: {
  'dusty-teal': '#6B8F95',
  'mustard': '#D6A21E',
  'blush': '#E7A7A9',
  'cream': '#F4F1EC',
  'sage': '#9FB8A3',
  'soft-teal': '#5F7F84',
}
```

---

## ✍️ Typography System

### Logo Typeface (Playful Retro Serif)

**Primary Logo Font:**
- `DM Serif Display` (Preferred)
- Alternatives: `Playfair Display`, `Abril Fatface`

**Usage:** "Parent Hub", large editorial headings

### Script Accent ("Ohio")

**Preferred:**
- `Allura`, `Parisienne`, or similar soft script with rounded terminals

**Usage:** Only for "Ohio" in primary logo. **Never for body copy.**

### Website Typography

**Headings:**
```
font-family: 'DM Serif Display', serif;
```

**Body Text:**
```
font-family: 'Inter', 'Lato', sans-serif;
```

**Rationale:** Keeps editorial personality while maintaining readability.

---

## ✨ Decorative Elements

### ✅ Allowed
- Small 4-point sparkles
- Rounded geometric stars  
- Tiny mustard or blush accents

### ❌ Not Allowed
- Drop shadows
- Gradients
- Gloss effects
- 3D styling
- Harsh primary colors

**All elements must remain flat design.**

---

## 📐 Spacing & Clear Space

### Logo Clear Space
**Minimum:** Height of the letter "O" in "Ohio"  
No text or elements may enter this zone.

### Badge Logo Padding
**Minimum:** 10% internal padding from edge of circle

---

## 🔲 Favicon Rules

- Use **icon mark only** (simplified Ohio silhouette)
- No text
- No sparkles  
- No badge ring

---

## ♿ Accessibility Requirements

### Contrast Ratios
**Minimum:** 4.5:1 for text elements

### Background Preferences
- Cream background preferred for most layouts

### ❌ Avoid
- Pink text on cream for body content
- Mustard on cream for small text

---

## 🚫 Anti-Patterns

### What This Brand Should NEVER Look Like:
- ❌ Daycare flyer
- ❌ Preschool clipart
- ❌ Church bulletin  
- ❌ Government agency
- ❌ Mommy blog circa 2012

### ✅ What It SHOULD Feel Like:
**Modern parenting lifestyle brand with personality.**

Think: Cup of Jo, The Everymom, Oh Joy! — but Ohio-specific and directory-focused.

---

## 🔮 Future Expansion

If brand expands beyond Ohio:
- Silhouette can be removed
- Typography and color system remain
- Hub heart/dot becomes primary symbol

---

## 📝 Implementation Notes

### For shadcn/ui Setup:
```css
:root {
  --background: 37 14% 95%;     /* Cream */
  --foreground: 195 16% 30%;     /* Soft Teal (dark text) */
  --primary: 193 16% 50%;        /* Dusty Teal */
  --primary-foreground: 37 14% 95%; /* Cream on teal */
  --accent: 44 75% 48%;          /* Mustard */
  --accent-foreground: 0 0% 100%; /* White on mustard */
  --muted: 133 14% 67%;          /* Sage */
  --border: 193 14% 45%;         /* Soft Teal borders */
}
```

### Google Fonts Import:
```html
<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

---

**Design Reference Image:** See attached Canva example for color/style inspiration.
