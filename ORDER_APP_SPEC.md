# Order App - Project Specification

## Overview
Mobile-first Progressive Web App (PWA) for creating jewelry production orders.
Replaces the current Google Forms + Google Sheets workflow.
Uses the same Cloudflare Worker API and D1 database as the Dashboard.

## Tech Stack
- **Frontend:** React + TypeScript + Tailwind CSS (mobile-first)
- **Hosting:** Cloudflare Pages (free)
- **API:** Existing Cloudflare Worker (`innovation-diamonds-api`)
- **Database:** Existing D1 (`innovation-diamonds`)
- **Auth:** Google Auth (same as Dashboard, restricted to company domains)
- **Photos:** Cloudflare R2 bucket (when ready)
- **Repo:** `Zakiel91/OrderApp` (separate from Dashboard)

## Architecture
```
OrderApp (Cloudflare Pages)
    |
    v
Same Cloudflare Worker API  <-->  D1 Database
    ^
    |
Dashboard (Cloudflare Pages)
```

Both apps read/write the same `orders` table.
Dashboard is for viewing/analytics. OrderApp is for creating orders.

## API Endpoints (already exist)
- `POST /api/production/import` - Create new order
- `PUT /api/production/orders` - Update order
- `GET /api/production/order?id=X` - Get order detail
- `GET /api/production/stone-autocomplete?q=X` - Search stones in inventory
- `GET /api/production/filters` - Get metals, jewellers, statuses, types
- `GET /api/production/next-order-number?prefix=X` - Get next order number
- `GET /api/production/jewellers` - List jewellers
- `GET /api/production/clients` - List/create clients

## New API Endpoints Needed
- `POST /api/upload/image` - Upload photo to R2 (future)
- `GET /api/production/order-prefixes` - List active prefixes with next numbers

## Order Form Fields (Step-by-Step Wizard)

### Step 1: Order Basics
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Order Prefix | Dropdown | Yes | INNO, IDO, JOR, RAV, RAN, TAL, etc. Auto-generates order number |
| Order Number | Auto-generated | Yes | Based on prefix + next sequence |
| Order Date | Date (today default) | Yes | Pre-filled with today |
| Order Type | Hidden | - | Always "production" (fixes have separate flow) |

### Step 2: Client & Salesman
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Client Name | Autocomplete + free text | Yes | Search existing clients or type new |
| Client Phone | Phone input | No | For contact |
| Client Email | Email input | No | For notifications later |
| Salesman Name | Dropdown | Yes | List of active salesmen |

### Step 3: Product Details
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Jewelry Type | Visual buttons (big icons) | Yes | Ring, Earrings, Pendant, Necklace, Bracelet, Eternity |
| Collection/Style | Dropdown (filtered by type) | No | Solitaire, Halo, Tennis, Stud, etc. |
| Description | Text | No | Free text, additional details |
| Model Code | Autocomplete | No | Search existing model codes |
| Metal | Dropdown | Yes | 14K White, 14K Yellow, 14K Rose, 18K White, etc. |
| Size | Text | Conditional | Required for rings (US/EUR format) |
| From Scratch | Toggle | No | Is this a completely new design? |

### Step 4: Stones
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Main Stone | Autocomplete from inventory | No | Search by parcel name, shows shape/ct/color/clarity |
| Main Stone (manual) | Text | No | If stone not in inventory, type description |
| Side Stones | Autocomplete with qty/ct input | No | Select parcel, enter qty used and ct used |
| Cat Claw / Setting | Text | No | Setting type specification |

### Step 5: Costs & Notes (optional, admin-only fields)
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Price to Client | Number ($) | No | Quoted price |
| Deadline | Date | No | Expected completion date |
| Comment | Textarea | No | Special instructions for jeweller |
| Photo | Camera/upload | No | Reference photo or similar product (R2 storage) |
| Buy Supply | Text + Number ($) | No | External supply needed (e.g. chain from Rashbel) |

### Step 6: Review & Submit
- Show all entered data in a clean summary card
- "Submit Order" button
- Confirmation screen with order number
- Option to "Create Another Order"

## Fields NOT in the form (set by system/admin later)
These are managed in Dashboard, not in the order form:
- Jeweller assignment (production manager assigns)
- Jeweller wage, modelling cost, 3D print cost, metal cost
- Barak Job Bag, Barak UPID, Valigara SKU
- Certificate price
- Status changes
- Payment tracking
- Setting Cost calculations

## UI/UX Requirements
- **Mobile-first:** Designed for phone screens (375px+)
- **Large touch targets:** Buttons min 44px height
- **Step wizard:** One section per screen, progress bar at top
- **Offline draft:** Save form progress to localStorage (submit when online)
- **RTL support:** Some users may prefer Hebrew
- **Fast:** No unnecessary loading, instant autocomplete
- **Simple:** Salesman should be able to create an order in under 2 minutes

## Authentication
- Google Auth (Firebase or Cloudflare Access)
- Restricted to company Google Workspace domains
- Special email invites for external users
- Role-based: Salesman (create orders), Admin (see costs)

## Pages
1. **Login** - Google sign-in button
2. **My Orders** - List of orders created by this user
3. **New Order** - Step-by-step wizard (main feature)
4. **Order Detail** - View submitted order status
5. **All Orders** - Search/filter all orders (admin only)

## Deployment
- GitHub repo: `Zakiel91/OrderApp`
- Cloudflare Pages auto-deploy on push to main
- Custom domain: `orders.innovationdia.com` (or similar)
- Same CORS setup as Dashboard

## Current Google Form Being Replaced
**Form Title:** INNO ORDERS - JEWELRY ORDER FORM INNO
**URL:** `https://docs.google.com/forms/d/1eEWFjUVzF_1nCMXlrTgEg0YPRxBty9Aof-9wDEtjWEo/viewform`

### Current Form Fields (exact):

1. **WHO IS ORDERING** (Required, Dropdown) - Options: Anton, JORDAN
   -> Maps to: `salesman_name` (needs expanded list of all salesmen)

2. **Cat claw?** (Required, Dropdown) - Options: cat claw, short cat claw, no cat claw, not relevant
   -> Maps to: `cat_claw`

3. **TYPE OF JEWELRY** (Required, Multiple choice + Other) - Options: RING, EARRINGS, BRACELET, NECKLACE, Other
   -> Maps to: `jewelry_type`

4. **CLIENT NAME, TZ, PHONE NUMBER** (Optional, Text)
   -> Maps to: `client_name_raw`, `client_phone` (split into separate fields)

5. **MAIN STONE OR TOP DETAILS** (Required, Text)
   -> Maps to: `main_stone_parcel` (with autocomplete from inventory)

6. **SIZE OF THE RING / LENGTH OF CHAIN OR BRACELET / TYPE OF EARRING LOCK** (Required, Text)
   -> Maps to: `size` (contextual label based on jewelry type)

7. **GOLD TYPE** (Required, Multiple choice + Other) - Options: 14K WHITE, 14K YELLOW, 14K ROSE, 18K WHITE, 18K YELLOW, 18K ROSE, PLATINUM, Other
   -> Maps to: `metal`

8. **JEWELRY PICTURE IF EXIST** (Optional, File upload, up to 5 files, max 10MB each)
   -> Maps to: `image_urls` (upload to R2)

9. **SHORT DESCRIPTION IF NO PICTURE** (Optional, Text)
   -> Maps to: `description` / `comment`

10. **MAIN STONE PICTURE IF EXIST** (Optional, File upload, up to 5 files, max 10MB each)
    -> Maps to: additional image in `image_urls`

11. **CGL PRICE AND DETAILS IF NEEDED** (Required, Text)
    -> Maps to: `certificate_cgl_price` + certificate details text

12. **DEADLINE** (Required, Date picker)
    -> Maps to: `deadline`

13. **PRICE FOR CUSTOMER IF ALREADY CLOSED** (Optional, Text)
    -> Maps to: `price_to_client`

14. **ANY OTHER PICTURE IF NEEDED** (Optional, File upload, up to 5 files, max 10MB each)
    -> Maps to: additional images in `image_urls`

15. **COMMENTS** (Optional, Text)
    -> Maps to: `comment`

### Improvements Over the Form:
- Autocomplete for stones (instead of typing parcel names manually)
- Autocomplete for clients (instead of typing name+tz+phone in one field)
- Visual jewelry type selection (icons instead of radio buttons)
- Metal as proper dropdown (sorted 14K first, then 18K)
- Size field label changes based on jewelry type selected
- Cat claw only shown for rings (not relevant for earrings/necklaces)
- Photo upload with camera access on mobile
- Order number auto-generated (no manual entry)
- Salesman list from database (not hardcoded 2 names)
- Bilingual: Hebrew + English labels
- Side stones selection (not in current form at all)

## Phase 1 (MVP)
- Order creation wizard (Steps 1-6)
- Google Auth login
- My Orders list
- No photo upload yet
- No offline support yet

## Phase 2
- Photo upload to R2
- Push notifications (order status changes)
- Offline draft support
- Hebrew RTL toggle

## Phase 3
- Client portal (clients can check their order status)
- Jeweller view (jeweller sees assigned work)
- Auto-notifications to client on status change
