# Client Search & Validation Improvements

## Overview
Enhanced the Order App and Dashboard to support searching clients by company number (חפ) and Teudat Zehut (ID), with Israeli government API validation support.

## Changes Made

### 1. **Backend (Cloudflare Workers)**

#### Database Schema Updates (`Dashboard/worker/src/routes/production.ts`)
- Added `company_number` field to clients table
- Added `teudat_validated` flag for tracking validation status
- Added `company_validated` flag for tracking company registry validation
- Added database migrations to add these columns to existing tables

#### New Israeli Validation Utility (`Dashboard/worker/src/utils/israeli-id-validator.ts`)
- `validateTeudat()` - Validates Israeli ID checksum algorithm (9 digits)
- `validateCompanyNumber()` - Validates Israeli company number checksum
- `validateTeudatWithGov()` - Validates against gov.il registry (placeholder for future API)
- `validateCompanyNumberWithGov()` - Validates against Israeli company registry
- `sanitizeIsraeliId()` - Normalizes ID format
- `sanitizeCompanyNumber()` - Normalizes company number format

#### New API Endpoint (`Dashboard/worker/src/index.ts`)
- **`GET /api/production/client-lookup`** - New endpoint for searching clients by:
  - `?phone=` - Search by phone number
  - `?id=` - Search by Teudat Zehut (ID)
  - `?company=` - Search by company number (חפ)

  Returns: `{ client_name, client_id, company_number, client_phone, client_email, client_address, client_country }`

#### Updated Handlers
- **`handleClients()`** - Enhanced to:
  - Search by phone, Teudat Zehut, and company number simultaneously
  - Sanitize and store Israeli IDs/company numbers

- **`handleClientLookup()`** - New handler for the client-lookup endpoint

### 2. **Frontend (Order App)**

#### Type Definitions (`src/lib/types.ts`)
- Added `client_company_number` field to `OrderFormData`
- Added `client_company_number` field to `FixFormData`
- Updated `INITIAL_FORM_DATA` and `INITIAL_FIX_FORM` with the new field

#### API Client (`src/lib/api.ts`)
- Updated `ClientRecord` interface to include `company_number`
- Enhanced `searchClientByField()` to support three search modes:
  - `field: 'phone'` - Search by phone
  - `field: 'id'` - Search by Teudat Zehut
  - `field: 'company'` - Search by company number

#### UI Components
- **`FormField.tsx`** - Added optional `sublabel` prop for showing Hebrew labels

- **`Step2Client.tsx`** - Added:
  - Company number input field with Hebrew sublabel (חפ)
  - Updated lookup logic to support company number searches
  - Fixed TypeScript ref typing issue

- **`FixStep1Client.tsx`** - Added:
  - Company number input field (same as Step2Client)
  - Updated lookup logic for fix order forms
  - Fixed TypeScript ref typing issue

## Features

### Auto-Fill on Search
When a user searches by phone, ID, or company number:
1. Lookup is triggered automatically (with 600ms debounce)
2. If found in database, all client details are auto-populated:
   - Name (English & Hebrew)
   - Phone
   - Email
   - Address
   - Country
   - Company number

### Validation Support
- Israeli ID validation using checksum algorithm
- Company number validation using checksum algorithm
- Foundation for gov.il API integration (when APIs become available)

## Database Changes

### Clients Table Schema
```sql
CREATE TABLE clients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  name_hebrew TEXT,
  phone TEXT,
  teudat_zehut TEXT,
  company_number TEXT,           -- NEW
  email TEXT,
  is_showroom INTEGER DEFAULT 0,
  teudat_validated INTEGER DEFAULT 0,     -- NEW
  company_validated INTEGER DEFAULT 0,    -- NEW
  active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
)
```

## API Usage Examples

### Search by Phone
```bash
curl "https://api.example.com/api/production/client-lookup?phone=0541234567"
```

### Search by Teudat Zehut (ID)
```bash
curl "https://api.example.com/api/production/client-lookup?id=123456789"
```

### Search by Company Number
```bash
curl "https://api.example.com/api/production/client-lookup?company=514123456"
```

## Response Example
```json
{
  "client_name": "John Doe",
  "client_id": "123456789",
  "company_number": "514123456",
  "client_phone": "+972541234567",
  "client_email": "john@example.com",
  "client_address": "Tel Aviv, Israel",
  "client_country": "Israel"
}
```

## Future Enhancements

1. **Gov.IL API Integration**
   - Implement actual API calls to gov.il registries
   - Store validation status in database
   - Show validation badges in UI

2. **Advanced Filtering**
   - Filter by showroom status
   - Filter by active/inactive clients
   - Sort by last order date

3. **Validation UI**
   - Show validation status indicators
   - Allow manual validation triggers
   - Display company registry information

## Compatibility

- ✅ New clients table columns created with safe migrations
- ✅ Existing clients work without company_number (NULL-safe)
- ✅ Backward compatible with existing order data
- ✅ All TypeScript types validated
- ✅ Both Order App and Fix Order forms updated

## Testing Checklist

- [ ] Search existing client by phone
- [ ] Search existing client by Teudat Zehut
- [ ] Search existing client by company number
- [ ] Verify auto-fill works correctly
- [ ] Create new client with company number
- [ ] Verify database migrations run successfully
- [ ] Test with both Hebrew and English names
- [ ] Verify debounce prevents excessive lookups
