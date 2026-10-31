---
name: NGENYANGIN
description: Responsive web app connecting food-surplus suppliers (MSMEs) with consumers, with pickup or courier delivery.
colors:
  primary: "#046838"
  primary-dark: "#0B3D2A"
  primary-soft: "#E3F0E5"
  accent: "#D24F0F"
  accent-dark: "#B03F08"
  accent-soft: "#FCE9DF"
  background: "#F7F5F0"
  surface: "#FFFFFF"
  surface-mint: "#EAF3EA"
  text-primary: "#16241C"
  text-secondary: "#5B6B62"
  border: "#DDE5DE"
  success: "#2E8B57"
  warning: "#E0A100"
  error: "#C62828"
  info: "#2F6DB5"
typography:
  display:
    fontFamily: Poppins
    fontSize: 48px
    fontWeight: 700
    lineHeight: 1.1
  headline:
    fontFamily: Poppins
    fontSize: 28px
    fontWeight: 600
    lineHeight: 1.25
  title:
    fontFamily: Poppins
    fontSize: 18px
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: 500
    lineHeight: 1.3
rounded:
  sm: 8px
  md: 16px
  lg: 24px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  section: 64px
---

# NGENYANGIN Design System

## 1. Overview

**Product.** NGENYANGIN is a responsive web app (browser only, no native mobile app) that turns unsold, still-edible food from small culinary businesses (market vendors, cafes, eateries) into discounted sales. Suppliers list surplus food, consumers browse and order, and the order is either picked up at the outlet or delivered by the supplier's partner courier. Admins monitor activity and handle complaints.

**Problem it solves.** Small food sellers lose money on unsold food every day. Selling it manually reaches few buyers, has no order records, and gives buyers no food-safety assurance. NGENYANGIN gives them a simple, structured digital flow.

**Personality.** Fresh, friendly, trustworthy, and local. Think "pasar" warmth meets a clean modern grocery storefront. Playful but never childish, since food safety and trust matter.

**Visual direction.** Modern, clean, fresh e-commerce. Soft mint and sage section backgrounds, white cards with generous rounding, deep green for trust and structure, warm orange-red for appetite and calls to action. Real food photography with natural light. Leaf and swoosh motifs echo the logo's green swoosh.

**Target users.** (1) Supplier: market vendors, cafes, eateries. (2) Consumer: students and workers seeking affordable food. (3) Courier: partner of the supplier. (4) Admin: platform manager. Many users are not tech-savvy, so keep interfaces simple, with large touch targets and short labels.

**UI language.** Bahasa Indonesia (casual-polite, e.g. "Pesan Sekarang", "Ambil di Outlet").

## 2. Brand and Logo

- Wordmark "ngenyangin" is a rounded, playful, hand-drawn style in orange-red (#D24F0F) with small burst lines at the upper right and a long green (#046838) swoosh underneath.
- Use the uploaded logo (ngenyangin.svg) as-is in the navbar (left), footer, login, and landing hero. Never recolor, stretch, or add effects.
- Clear space around the logo equals the height of the letter "n". Minimum width is 120px.
- On dark green backgrounds, place the logo on a white or cream rounded chip.

## 3. Colors

| Role | Token | Hex | Use |
|---|---|---|---|
| Primary | primary | #046838 | Navbar active state, key buttons, icons, links, success surfaces |
| Primary dark | primary-dark | #0B3D2A | Headlines on light backgrounds, footer, dark banners |
| Primary soft | primary-soft | #E3F0E5 | Chips, selected states, subtle fills |
| Accent | accent | #D24F0F | Main CTA ("Pesan Sekarang"), discount badges, logo-matching highlights |
| Accent soft | accent-soft | #FCE9DF | Discount tags background, notices |
| Background | background | #F7F5F0 | Page background (warm cream) |
| Mint section | surface-mint | #EAF3EA | Hero, category, and promo banner sections |
| Surface | surface | #FFFFFF | Cards, forms, modals |
| Text primary | text-primary | #16241C | Headings and body |
| Text secondary | text-secondary | #5B6B62 | Captions, helper text |
| Border | border | #DDE5DE | Dividers and input outlines |

**Status colors (order tracking).** Menunggu = warning (#E0A100), Diproses = info (#2F6DB5), Dalam Pengantaran = accent (#D24F0F), Selesai = success (#2E8B57), Dibatalkan/Pengaduan = error (#C62828).

**Rules.**
- Green is the structure color, orange-red is the action color. Use only one orange-red primary CTA per view.
- Discounts and urgency (e.g. "Tersisa 3 porsi", "Ambil sebelum 20.00") use accent-soft background with accent text.
- Maintain WCAG AA contrast. White text only on primary, primary-dark, or accent-dark.

## 4. Typography

- **Headings:** Poppins (rounded geometric, close to the logo's friendliness). Bold for hero, semibold for sections.
- **Body and UI:** Inter for readability on forms, tables, and dashboards.
- **Scale:** Display 48 / Headline 28 / Title 18 / Body 16 / Label 13. On mobile, Display drops to 32 and Headline to 24.
- Prices use Poppins semibold. The discounted price is large in primary-dark; the original price is small, struck through, text-secondary.

## 5. Layout and Spacing

- 12-column grid, max content width 1200px, 24px gutters. Desktop 1280+, tablet 768, mobile 360-430, all must work.
- Generous whitespace between sections (64px desktop, 40px mobile).
- Sticky top navbar: logo left, links (Beranda, Makanan, Pesanan, Bantuan), search, cart icon with badge, profile menu right.
- Landing and home structure: hero with search, row of category tiles, "Surplus Hari Ini" product grid, "Segera Berakhir" strip, how-it-works (3 steps), testimonials, supplier call-to-action banner, footer.
- Product grid: 4 columns desktop, 2 tablet, 1-2 mobile.
- Dashboards (supplier, courier, admin): left sidebar (collapses to bottom or hamburger on mobile), content area with summary cards on top, then table or list.

## 6. Shapes and Elevation

- Cards: 16px radius, white, 1px border (#DDE5DE) with a very soft shadow (0 4px 16px rgba(4,104,56,0.06)).
- Buttons and chips: fully rounded (pill).
- Images: 16px radius, 4:3 for food photos.
- Large banners and hero: 24px radius.
- Modals: 24px radius with a dim green-tinted scrim.
- Keep shadows subtle. Hover raises cards slightly (translateY -2px).

## 7. Components

**Buttons**
- Primary CTA: accent fill, white text, pill, 48px height. Hover darkens to accent-dark.
- Secondary: primary green fill or outline.
- Tertiary: text link in primary.
- Disabled: border color fill, text-secondary.

**Food card.** Photo on top, small discount badge ("-40%") in accent at the photo's corner, food name (Title), supplier name with outlet icon, category chip, remaining stock, pickup-by time, discounted price plus struck original price, small round green "add" button.

**Category tile.** Rounded white tile with a food cut-out image and label (Makanan Berat, Jajanan, Roti & Kue, Minuman, Sayur & Buah).

**Food-safety badge.** Small shield icon plus "Sudah disetujui kebijakan keamanan pangan" shown on every food card and detail page. Builds trust.

**Delivery method selector.** Two large selectable cards: "Ambil di Outlet" (store icon) and "Diantar Kurir" (scooter icon). The selected card has a primary border and primary-soft fill. Selecting delivery reveals an address field and notes.

**Order status timeline.** Vertical stepper with status colors: Pesanan dibuat, Diproses supplier, Siap diambil / Dalam pengantaran, Selesai. Show a proof-of-delivery photo for courier orders. No live map (real-time tracking is out of scope).

**Forms.** Labels above fields, 12px-radius inputs, 48px height, clear helper and error text. The supplier "Tambah Makanan" form: name, description, original price, discount price, stock, pickup deadline, photo upload (drag and drop with preview), mandatory checkbox for the food-safety policy, and a publish button disabled until the checkbox is ticked.

**Rating and review.** 5-star input with an optional comment, shown after the order is complete.

**Tables (admin and supplier).** Zebra-free, light dividers, status chips, row actions, search and filter bar on top.

**Empty states.** Friendly illustration with a leaf motif and a short Indonesian message.

**Footer.** primary-dark background, logo on a cream chip, columns: Tentang, Bantuan, Syarat & Ketentuan, Kontak.

## 8. Screens to Generate

Design as a website, desktop first, with responsive variants.

**Public and shared**
1. Landing page (hero, how it works, featured surplus, testimonials, CTA to become a supplier)
2. Login and register (role selection: Supplier, Konsumen, Kurir)

**Consumer (Konsumen)**
3. Home / browse food (search, filter by category, distance, price)
4. Food detail (photos, price, supplier info, safety badge, stock, pickup deadline)
5. Cart and checkout (choose Ambil di Outlet or Diantar Kurir, payment summary)
6. My orders and order status tracking
7. Review and rating form

**Supplier (Penyalur)**
8. Supplier dashboard (today's sales, active listings, incoming orders)
9. Add / edit surplus food (with photo upload and food-safety policy approval)
10. Incoming orders and status update (Diproses, Siap diambil, Dikirim, Selesai), assign delivery to courier

**Courier (Kurir)**
11. Delivery requests list
12. Delivery task detail (accept, go to outlet, picked up, delivered)
13. Upload proof of delivery

**Admin**
14. Monitoring dashboard (users, orders, listings, activity chart)
15. Complaint handling (list and detail with resolution actions)
16. Help, Terms and Conditions, and platform settings management

## 9. Core User Flow (summary)

1. Supplier inputs surplus food info, uploads photos, approves the food-safety policy, and the food goes live.
2. Consumer views and selects food, creates an order, and chooses a method.
3. If **Ambil di Outlet**: consumer picks up at the outlet, the order completes, and the consumer leaves a review and rating.
4. If **Diantar Kurir**: delivery request goes to the courier, who accepts, goes to the outlet, picks up the food, delivers it, uploads proof of delivery, and the order completes.
5. Supplier updates order status throughout; the consumer sees it in "Status pesanan".
6. Admin monitors everything, handles complaints, and manages help and Terms and Conditions.

## 10. System Constraints (design must respect)

- Responsive web only, no native mobile app.
- Only surplus food that has passed the food-safety policy can be listed.
- Receiving methods are limited to pickup or the supplier's partner courier.
- No real-time courier location tracking, so show status steps and proof-of-delivery photos instead of a live map.
- Requires an internet connection.

## 11. Do's and Don'ts

**Do**
- Use real, appetizing food photography and warm natural light.
- Make the discount, remaining stock, and pickup deadline instantly visible.
- Keep flows short, one primary action per screen.
- Use plain Indonesian wording and clear icons.
- Keep touch targets at least 44px.

**Don't**
- Don't use pure black or neon colors.
- Don't place more than one orange-red CTA in the same viewport.
- Don't show a live map or GPS tracking UI.
- Don't hide the food-safety information.
- Don't crowd screens with dense tables on mobile; use cards instead.
