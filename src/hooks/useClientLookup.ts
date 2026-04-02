import { useState, useCallback, useRef } from 'react'
import { searchClientByField, searchClientsByName, type ClientRecord } from '../lib/api'

// Session-level cache — same search won't hit DB twice
const fieldCache = new Map<string, ClientRecord | null>()
const nameCache = new Map<string, ClientRecord[]>()

export type LookupStatus = 'idle' | 'searching' | 'found' | 'not_found'

export function useClientLookup(onClientFound: (client: ClientRecord) => void) {
  const [lookupStatus, setLookupStatus] = useState<LookupStatus>('idle')
  const [nameSuggestions, setNameSuggestions] = useState<ClientRecord[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [nameSearching, setNameSearching] = useState(false)
  const [clientSelected, setClientSelected] = useState(false)
  const [phoneMatches, setPhoneMatches] = useState<ClientRecord[]>([])
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const nameDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const onFoundRef = useRef(onClientFound)
  onFoundRef.current = onClientFound

  const lookupByField = useCallback((field: 'phone' | 'id' | 'company', value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    // Skip if client already selected from DB
    if (clientSelected) return
    // Phone needs 7 digits minimum to avoid "054" matching everyone
    const digits = value.replace(/\D/g, '')
    const minLen = field === 'phone' ? 7 : field === 'id' ? 7 : 8
    if (!value || digits.length < minLen) { setLookupStatus('idle'); return }

    const cacheKey = `${field}:${value}`
    debounceRef.current = setTimeout(async () => {
      setLookupStatus('searching')
      let client: ClientRecord | null
      if (fieldCache.has(cacheKey)) {
        client = fieldCache.get(cacheKey) ?? null
      } else {
        client = await searchClientByField(field, value)
        fieldCache.set(cacheKey, client)
      }
      if (client && (client as any).multiple) {
        // Multiple matches — show picker
        setPhoneMatches((client as any).results || [])
        setLookupStatus('found')
      } else if (client && client.client_name) {
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
    setNameSearching(true)
    const key = value.toLowerCase()
    let results: ClientRecord[]
    if (nameCache.has(key)) {
      results = nameCache.get(key)!
    } else {
      results = await searchClientsByName(value)
      nameCache.set(key, results)
    }
    setNameSearching(false)
    setNameSuggestions(results)
    setShowSuggestions(results.length > 0)
  }, [])

  const handleNameChange = useCallback((value: string, updateFn: (v: string) => void) => {
    updateFn(value)
    setClientSelected(false)
    setLookupStatus('idle')
    setShowSuggestions(false)
    if (nameDebounceRef.current) clearTimeout(nameDebounceRef.current)
    if (value.length < 3) { setNameSuggestions([]); return }
    nameDebounceRef.current = setTimeout(() => doNameSearch(value), 400)
  }, [doNameSearch])

  const selectSuggestion = useCallback((c: ClientRecord) => {
    setNameSuggestions([])
    setShowSuggestions(false)
    setLookupStatus('found')
    setClientSelected(true)
    onFoundRef.current(c)
  }, [])

  const selectPhoneMatch = useCallback((c: ClientRecord) => {
    setPhoneMatches([])
    setLookupStatus('found')
    setClientSelected(true)
    onFoundRef.current(c)
  }, [])

  const clearClient = useCallback((onClear: () => void) => {
    setLookupStatus('idle')
    setClientSelected(false)
    setNameSuggestions([])
    setShowSuggestions(false)
    setPhoneMatches([])
    onClear()
  }, [])

  return {
    lookupStatus, nameSuggestions, showSuggestions, nameSearching, clientSelected, phoneMatches,
    setShowSuggestions, lookupByField, doNameSearch, handleNameChange, selectSuggestion,
    selectPhoneMatch, clearClient,
  }
}
