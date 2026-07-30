import { useState, useCallback, useRef, useEffect } from 'react'
import { searchClientByField, searchClientsByName, type ClientRecord } from '../lib/api'

// Session-level cache — same search won't hit DB twice.
// Cleared on logout (see clearClientLookupCaches) so a shared device never
// leaks the previous salesman's clients into autocomplete.
const fieldCache = new Map<string, ClientRecord | null>()
const nameCache = new Map<string, ClientRecord[]>()

export function clearClientLookupCaches(): void {
  fieldCache.clear()
  nameCache.clear()
}

export type LookupStatus = 'idle' | 'searching' | 'found' | 'not_found'
export type LookupField = 'phone' | 'id' | 'company'

export function useClientLookup(onClientFound: (client: ClientRecord) => void) {
  const [lookupStatus, setLookupStatus] = useState<LookupStatus>('idle')
  // Which input the status belongs to. Without this, one shared status painted a
  // ✓ next to every lookup field at once.
  const [lookupField, setLookupField] = useState<LookupField | null>(null)
  const [nameSuggestions, setNameSuggestions] = useState<ClientRecord[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [nameSearching, setNameSearching] = useState(false)
  const [clientSelected, setClientSelected] = useState(false)
  const [phoneMatches, setPhoneMatches] = useState<ClientRecord[]>([])
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const nameDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Monotonic request ids: a slow response must not overwrite a newer one.
  const fieldReqRef = useRef(0)
  const nameReqRef = useRef(0)
  // Synced in an effect rather than during render (refs are not render state).
  // Only ever read from debounced timeouts and click handlers, which run after
  // effects have flushed.
  const onFoundRef = useRef(onClientFound)
  useEffect(() => { onFoundRef.current = onClientFound }, [onClientFound])

  useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (nameDebounceRef.current) clearTimeout(nameDebounceRef.current)
    // Invalidate anything in flight so it cannot setState after unmount.
    fieldReqRef.current++
    nameReqRef.current++
  }, [])

  const lookupByField = useCallback((field: LookupField, value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    // Skip if client already selected from DB
    if (clientSelected) return
    // Phone needs 7 digits minimum to avoid "054" matching everyone
    const digits = value.replace(/\D/g, '')
    const minLen = field === 'phone' ? 7 : field === 'id' ? 7 : 8
    if (!value || digits.length < minLen) {
      fieldReqRef.current++
      setLookupStatus('idle')
      setLookupField(null)
      return
    }

    const cacheKey = `${field}:${value}`
    const reqId = ++fieldReqRef.current

    debounceRef.current = setTimeout(async () => {
      setLookupStatus('searching')
      setLookupField(field)

      let client: ClientRecord | null
      if (fieldCache.has(cacheKey)) {
        client = fieldCache.get(cacheKey) ?? null
      } else {
        client = await searchClientByField(field, value)
        fieldCache.set(cacheKey, client)
      }

      // A newer keystroke (or unmount) superseded this request.
      if (reqId !== fieldReqRef.current) return

      const multi = client as (ClientRecord & { multiple?: boolean; results?: ClientRecord[] }) | null
      if (multi?.multiple) {
        // Multiple matches — show picker
        setPhoneMatches(multi.results || [])
        setLookupStatus('found')
      } else if (client && (client.client_name || client.name)) {
        setPhoneMatches([])
        setLookupStatus('found')
        setClientSelected(true)
        onFoundRef.current(client)
      } else {
        setPhoneMatches([])
        setLookupStatus('not_found')
      }
    }, field === 'phone' ? 700 : 500)
  }, [clientSelected])

  const doNameSearch = useCallback(async (value: string) => {
    if (!value) return
    const reqId = ++nameReqRef.current
    setNameSearching(true)

    const key = value.toLowerCase()
    let results: ClientRecord[]
    if (nameCache.has(key)) {
      results = nameCache.get(key)!
    } else {
      results = await searchClientsByName(value)
      nameCache.set(key, results)
    }

    if (reqId !== nameReqRef.current) return

    setNameSearching(false)
    setNameSuggestions(results)
    setShowSuggestions(results.length > 0)
  }, [])

  const handleNameChange = useCallback((value: string, updateFn: (v: string) => void) => {
    updateFn(value)
    setClientSelected(false)
    setLookupStatus('idle')
    setLookupField(null)
    setShowSuggestions(false)
    if (nameDebounceRef.current) clearTimeout(nameDebounceRef.current)
    if (value.length < 3) { nameReqRef.current++; setNameSuggestions([]); return }
    nameDebounceRef.current = setTimeout(() => doNameSearch(value), 400)
  }, [doNameSearch])

  const selectSuggestion = useCallback((c: ClientRecord) => {
    nameReqRef.current++
    fieldReqRef.current++
    setNameSuggestions([])
    setShowSuggestions(false)
    setLookupStatus('found')
    setLookupField(null)
    setClientSelected(true)
    onFoundRef.current(c)
  }, [])

  const selectPhoneMatch = useCallback((c: ClientRecord) => {
    fieldReqRef.current++
    setPhoneMatches([])
    setLookupStatus('found')
    setLookupField('phone')
    setClientSelected(true)
    onFoundRef.current(c)
  }, [])

  const clearClient = useCallback((onClear: () => void) => {
    fieldReqRef.current++
    nameReqRef.current++
    setLookupStatus('idle')
    setLookupField(null)
    setClientSelected(false)
    setNameSuggestions([])
    setShowSuggestions(false)
    setPhoneMatches([])
    onClear()
  }, [])

  /** Status for one specific input — 'idle' unless the lookup targeted it. */
  const statusFor = useCallback(
    (field: LookupField): LookupStatus => (lookupField === field ? lookupStatus : 'idle'),
    [lookupField, lookupStatus],
  )

  return {
    lookupStatus, lookupField, statusFor,
    nameSuggestions, showSuggestions, nameSearching, clientSelected, phoneMatches,
    setShowSuggestions, lookupByField, doNameSearch, handleNameChange, selectSuggestion,
    selectPhoneMatch, clearClient,
  }
}
