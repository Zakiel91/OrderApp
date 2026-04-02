export type Language = 'en' | 'he' | 'ru'

export type JewelryType = 'ring' | 'earrings' | 'pendant' | 'necklace' | 'bracelet' | 'eternity' | 'other'

export type EarringSubType = 'stud' | 'hoop' | 'drop' | 'huggie' | 'clip-on'

export type BraceletSubType = 'chain' | 'bangle' | 'tennis'

export type EternityType = 'full' | 'half' | '3/4'

export type RingSizeSystem = 'us' | 'eu' | 'il' | 'mm'

export interface Order {
  id: number
  order_number: string
  order_prefix: string
  order_date: string
  order_type: string
  client_name?: string
  client_name_raw?: string
  client_phone?: string
  client_email?: string
  salesman_name?: string
  jewelry_type?: string
  collection_style?: string
  description?: string
  model_code?: string
  metal?: string
  size?: string
  size_system?: string
  main_stone_parcel?: string
  main_stone_manual?: string
  side_stones?: string
  cat_claw?: string
  price_to_client?: number
  deadline?: string
  comment?: string
  image_urls?: string
  buy_supply?: string
  buy_supply_cost?: number
  status: string
  source_sheet?: string
  created_at?: string
  updated_at?: string
  display_name?: string
  // Measurement-specific fields
  earring_sub_type?: string
  earring_back_type?: string
  earring_diameter_mm?: number
  earring_drop_length_mm?: number
  bracelet_sub_type?: string
  bracelet_fit?: string
  necklace_extension?: string
  necklace_stations?: string
  eternity_type?: string
  // New fields
  pendant_attached?: boolean
  pendant_extension_1?: string
  pendant_extension_2?: string
  order_purpose?: string // upid or memo
  certificate?: string
}

export interface FilterData {
  jewellers: string[]
  metals: string[]
  jewelryTypes: string[]
  statuses: string[]
  clients: string[]
  models: string[]
  prefixes: string[]
}

export interface StoneResult {
  parcel_name: string
  shape?: string
  carat?: number
  color?: string
  clarity?: string
  certificate?: string
}

export interface OrderFormData {
  // Step 1
  order_prefix: string
  order_number: string
  order_date: string
  // Step 2
  client_db_id: number // 0 = new client, >0 = existing DB id
  client_name: string
  client_id: string // תעודת זהות
  client_company_number: string // חפ (חברה פרטית)
  client_country_code: string // +972, +1, etc
  client_phone: string
  client_email: string
  client_address: string // street + city
  client_country: string // default: Israel
  salesman_name: string
  // Step 3
  jewelry_type: JewelryType | ''
  collection_style: string
  comment: string // was "description" - renamed to Comments
  metal: string
  size: string
  size_system: RingSizeSystem
  // Step 3 - measurements
  earring_sub_type: EarringSubType | ''
  earring_back_type: string
  earring_diameter_mm: string
  earring_drop_length_mm: string
  earring_wire_thickness: string
  bracelet_sub_type: BraceletSubType | ''
  bracelet_fit: string
  bangle_size_cm: string
  necklace_length_cm: string
  necklace_extension: string
  necklace_stations: string[]
  necklace_has_pendant: boolean
  necklace_pendant_drop: string
  eternity_type: EternityType | ''
  wide_band: boolean
  // Pendant specific
  pendant_attached: boolean
  pendant_length_cm: string
  pendant_extension_1: string
  pendant_extension_2: string
  // Step 4
  main_stone_parcel: string
  main_stone_manual: string
  side_stones: string
  cat_claw: string
  // Step 5
  order_purpose: string // upid or memo
  certificate: string
  price_to_client: string
  cgl_price_details: string
  deadline: string
  advance_amount: string
  advance_method: string // cash, credit_card, bank_wire
  special_instructions: string
  // Images
  image_files: File[]
}

// ===== FIX ORDER TYPES =====

export type FixOption = 'resize' | 'polish' | 'rhodium' | 'stone_fix' | 'cleaning' | 'clasp_fix' | 'chain_fix' | 'soldering' | 'engraving' | 'other'

export interface FixFormData {
  // Auto
  order_prefix: string // always 'FIX'
  order_number: string
  order_date: string
  salesman_name: string
  // Client
  client_db_id: number
  client_name: string
  client_id: string
  client_company_number: string
  client_country_code: string
  client_phone: string
  client_email: string
  client_address: string
  client_country: string
  // Item
  jewelry_type: JewelryType | ''
  metal: string
  // Fix info
  fix_options: FixOption[] // what needs to be done (multi-select)
  fix_other_text: string // if 'other' selected
  description: string // free text: additional details
  main_stone: string // UPID / stone reference (optional)
  size: string // new size if resize selected
  comment: string // price notes, extra info
  price_to_client: string
  advance_amount: string
  advance_method: string
  deadline: string
  // Images
  image_files: File[]
}

export const INITIAL_FIX_FORM: FixFormData = {
  order_prefix: 'FIX',
  order_number: '',
  order_date: new Date().toISOString().split('T')[0],
  salesman_name: '',
  client_db_id: 0,
  client_name: '',
  client_id: '',
  client_company_number: '',
  client_country_code: '+972',
  client_phone: '',
  client_email: '',
  client_address: '',
  client_country: 'Israel',
  jewelry_type: '',
  metal: '',
  fix_options: [],
  fix_other_text: '',
  description: '',
  main_stone: '',
  size: '',
  comment: '',
  price_to_client: '',
  advance_amount: '',
  advance_method: '',
  deadline: '',
  image_files: [],
}

export const INITIAL_FORM_DATA: OrderFormData = {
  order_prefix: '',
  order_number: '',
  order_date: new Date().toISOString().split('T')[0],
  client_db_id: 0,
  client_name: '',
  client_id: '',
  client_company_number: '',
  client_country_code: '+972',
  client_phone: '',
  client_email: '',
  client_address: '',
  client_country: 'Israel',
  salesman_name: '',
  jewelry_type: '',
  collection_style: '',
  comment: '',
  metal: '14K WHITE',
  size: '',
  size_system: 'us',
  earring_sub_type: '',
  earring_back_type: '',
  earring_diameter_mm: '',
  earring_drop_length_mm: '',
  earring_wire_thickness: '',
  bracelet_sub_type: '',
  bracelet_fit: 'comfortable',
  bangle_size_cm: '',
  necklace_length_cm: '',
  necklace_extension: '',
  necklace_stations: [],
  necklace_has_pendant: false,
  necklace_pendant_drop: '',
  eternity_type: '',
  wide_band: false,
  pendant_attached: true,
  pendant_length_cm: '',
  pendant_extension_1: '',
  pendant_extension_2: '',
  main_stone_parcel: '',
  main_stone_manual: '',
  side_stones: '',
  cat_claw: '',
  order_purpose: '',
  certificate: '',
  price_to_client: '',
  cgl_price_details: '',
  deadline: '',
  advance_amount: '',
  advance_method: '',
  special_instructions: '',
  image_files: [],
}
