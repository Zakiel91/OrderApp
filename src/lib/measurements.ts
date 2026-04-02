// Ring size conversion table
// US: includes quarter sizes (3, 3.25, 3.5, 3.75, 4, ...)
// EU: all consecutive sizes, popular ones with .5 halves
// IL: Israeli standard (same as circumference in mm, ranges 44-70)
// mm: inner diameter
export const RING_SIZES = [
  { us: 3, eu: 44, mm: 14.0 },
  { us: 3.25, eu: 44.5, mm: 14.1 },
  { us: 3.5, eu: 45, mm: 14.3 },
  { us: 3.75, eu: 45.5, mm: 14.5 },
  { us: 4, eu: 46, mm: 14.6 },
  { us: 4.25, eu: 46.5, mm: 14.8 },
  { us: 4.5, eu: 47, mm: 15.0 },
  { us: 4.75, eu: 47.5, mm: 15.2 },
  { us: 5, eu: 48, mm: 15.3 },
  { us: 5.25, eu: 48.5, mm: 15.5 },
  { us: 5.5, eu: 49, mm: 15.7 },
  { us: 5.75, eu: 49.5, mm: 15.8 },
  { us: 6, eu: 50, mm: 16.0 },
  { us: 6.25, eu: 50.5, mm: 16.1 },
  { us: 6.5, eu: 51, mm: 16.3 },
  { us: 6.75, eu: 51.5, mm: 16.5 },
  { us: 7, eu: 52, mm: 16.6 },
  { us: 7.25, eu: 52.5, mm: 16.8 },
  { us: 7.5, eu: 53, mm: 16.9 },
  { us: 7.75, eu: 53.5, mm: 17.1 },
  { us: 8, eu: 54, mm: 17.2 },
  { us: 8.25, eu: 54.5, mm: 17.4 },
  { us: 8.5, eu: 55, mm: 17.5 },
  { us: 8.75, eu: 55.5, mm: 17.7 },
  { us: 9, eu: 56, mm: 17.8 },
  { us: 9.25, eu: 56.5, mm: 18.0 },
  { us: 9.5, eu: 57, mm: 18.1 },
  { us: 9.75, eu: 57.5, mm: 18.3 },
  { us: 10, eu: 58, mm: 18.5 },
  { us: 10.25, eu: 58.5, mm: 18.6 },
  { us: 10.5, eu: 59, mm: 18.8 },
  { us: 10.75, eu: 59.5, mm: 18.9 },
  { us: 11, eu: 60, mm: 19.0 },
  { us: 11.25, eu: 60.5, mm: 19.2 },
  { us: 11.5, eu: 61, mm: 19.4 },
  { us: 11.75, eu: 61.5, mm: 19.5 },
  { us: 12, eu: 62, mm: 19.7 },
  { us: 12.25, eu: 62.5, mm: 19.8 },
  { us: 12.5, eu: 63, mm: 20.0 },
  { us: 12.75, eu: 63.5, mm: 20.2 },
  { us: 13, eu: 64, mm: 20.3 },
  { us: 13.25, eu: 64.5, mm: 20.5 },
  { us: 13.5, eu: 65, mm: 20.6 },
  { us: 13.75, eu: 65.5, mm: 20.8 },
  { us: 14, eu: 66, mm: 21.0 },
  { us: 14.25, eu: 66.5, mm: 21.1 },
  { us: 14.5, eu: 67, mm: 21.3 },
  { us: 14.75, eu: 67.5, mm: 21.4 },
  { us: 15, eu: 68, mm: 21.6 },
  { us: 15.25, eu: 68.5, mm: 21.8 },
  { us: 15.5, eu: 69, mm: 21.9 },
  { us: 15.75, eu: 69.5, mm: 22.1 },
  { us: 16, eu: 70, mm: 22.2 },
]

export function findRingSize(system: 'us' | 'eu' | 'mm', value: number) {
  return RING_SIZES.find(s => {
    if (system === 'us') return s.us === value
    if (system === 'eu') return s.eu === value
    return s.mm === value
  })
}

export function getRingSizeLabel(size: typeof RING_SIZES[0], system: 'us' | 'eu' | 'mm') {
  if (system === 'us') return `US ${size.us}`
  if (system === 'eu') return `EU ${size.eu}`
  return `${size.mm}mm`
}

export function getRingSizeConversion(size: typeof RING_SIZES[0], excludeSystem: 'us' | 'eu' | 'mm') {
  const parts: string[] = []
  if (excludeSystem !== 'us') parts.push(`US ${size.us}`)
  if (excludeSystem !== 'eu') parts.push(`EU ${size.eu}`)
  if (excludeSystem !== 'mm') parts.push(`${size.mm}mm`)
  return parts.join(' = ')
}

// Necklace presets (removed Matinee/Opera/Rope - not used)
export const NECKLACE_PRESETS = [
  { key: 'choker', cm: 38, range: '36-40' },
  { key: 'princess', cm: 43, range: '40-46' },
] as const

// Pendant: main sizes 36-45cm, all of them
export const PENDANT_SIZES: number[] = []
for (let cm = 36; cm <= 45; cm++) {
  PENDANT_SIZES.push(cm)
}

// Pendant extension 1: 38-45cm
export const PENDANT_EXT1_SIZES: number[] = []
for (let cm = 38; cm <= 45; cm++) {
  PENDANT_EXT1_SIZES.push(cm)
}

// Pendant extension 2: 40-45cm
export const PENDANT_EXT2_SIZES: number[] = []
for (let cm = 40; cm <= 45; cm++) {
  PENDANT_EXT2_SIZES.push(cm)
}

export const NECKLACE_EXTENSIONS = [
  { key: 'none', cm: 0 },
  { key: '5cm', cm: 5 },
  { key: '7.5cm', cm: 7.5 },
  { key: '10cm', cm: 10 },
] as const

export function cmToInches(cm: number) {
  return (cm / 2.54).toFixed(1)
}

// Bracelet sizes: 15cm to 22cm in 0.5cm steps (for chain and tennis)
export function getBraceletSizes() {
  const sizes: number[] = []
  for (let cm = 15; cm <= 22; cm += 0.5) {
    sizes.push(cm)
  }
  return sizes
}

// Bangle sizes: 15cm to 25cm in 0.5cm steps + custom
export function getBangleSizes() {
  const sizes: number[] = []
  for (let cm = 15; cm <= 25; cm += 0.5) {
    sizes.push(cm)
  }
  return sizes
}

// Earring measurements
export const HOOP_DIAMETERS = [10, 15, 20, 25, 30, 40, 50] as const

// Removed La Pousette from stud, ALFA present everywhere relevant
export const EARRING_BACKS: Record<string, string[]> = {
  stud: ['butterfly', 'screw_back', 'flat_back', 'alfa'],
  hoop: ['hinged', 'lever_back', 'alfa'],
  drop: ['hook', 'lever_back', 'alfa'],
  huggie: ['hinged'],
  'clip-on': ['spring_clip', 'omega'],
}

export const DROP_LENGTH_PRESETS = [
  { key: 'short', min: 15, max: 25 },
  { key: 'medium', min: 25, max: 50 },
  { key: 'long', min: 50, max: 75 },
] as const
