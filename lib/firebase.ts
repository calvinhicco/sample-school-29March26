import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getFirestore, Firestore, collection, onSnapshot, doc, getDocs, query, orderBy, enableNetwork, disableNetwork, clearIndexedDbPersistence } from 'firebase/firestore'

// Firebase configuration - matches the Electron app's Firebase project
function requireEnv(value: string | undefined, name: string): string {
  if (!value) {
    // During build/SSG, env vars might not be available - return empty string
    // Runtime checks will handle missing config
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'production') {
      console.warn(`Missing env var during build: ${name}`)
      return ''
    }
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

// Lazy Firebase initialization - only initialize when needed
let app: FirebaseApp | undefined
let db: Firestore | undefined

function getFirebaseApp(): FirebaseApp {
  if (!app) {
    // NOTE: Next.js only inlines NEXT_PUBLIC_* env vars into the browser bundle when they are
    // referenced statically (process.env.NEXT_PUBLIC_...). Dynamic access (process.env[name])
    // will be undefined in the browser.
    const firebaseConfig = {
      apiKey: requireEnv(process.env.NEXT_PUBLIC_FIREBASE_API_KEY, 'NEXT_PUBLIC_FIREBASE_API_KEY'),
      authDomain: requireEnv(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'),
      projectId: requireEnv(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID, 'NEXT_PUBLIC_FIREBASE_PROJECT_ID'),
      storageBucket: requireEnv(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET, 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'),
      messagingSenderId: requireEnv(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID, 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
      appId: requireEnv(process.env.NEXT_PUBLIC_FIREBASE_APP_ID, 'NEXT_PUBLIC_FIREBASE_APP_ID'),
      measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
    }

    // Skip initialization if config is incomplete (during build)
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
      throw new Error('Firebase config incomplete - skipping initialization')
    }

    app = initializeApp(firebaseConfig)
  }
  return app
}

export function getDb(): Firestore {
  if (!db) {
    db = getFirestore(getFirebaseApp())
  }
  return db
}

// Ultra-aggressive cache clearing for emergency situations (factory resets, etc.)
export async function clearAllFirebaseCache(): Promise<void> {
  try {
    console.log('🚨 ULTRA-AGGRESSIVE cache clearing (emergency mode)...')
    
    const dbInstance = getDb()
    
    // Step 1: Disable network
    await disableNetwork(dbInstance)
    
    // Step 2: Clear IndexedDB persistence cache
    await clearIndexedDbPersistence(dbInstance)
    
    // Step 3: Clear browser storage
    if (typeof window !== 'undefined') {
      Object.keys(localStorage).forEach(key => {
        if (key.includes('firebase') || key.includes('firestore')) {
          localStorage.removeItem(key)
        }
      })
      
      Object.keys(sessionStorage).forEach(key => {
        if (key.includes('firebase') || key.includes('firestore')) {
          sessionStorage.removeItem(key)
        }
      })
    }
    
    // Step 4: Re-enable network
    await enableNetwork(dbInstance)
    
    // Step 5: Wait for fresh connection
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    console.log('✅ Ultra-aggressive cache clearing completed')
  } catch (error) {
    console.error('❌ Error during ultra-aggressive cache clearing:', error)
  }
}

// Get initial data from a Firestore collection with optional cache clearing
export async function getInitial<T>(collectionName: string, forceFresh = false): Promise<T[]> {
  try {
    const dbInstance = getDb()
    
    // Gentle cache clearing for routine refreshes, aggressive only when needed
    if (forceFresh) {
      console.log(`🔄 Gentle cache refresh for ${collectionName}...`)
      
      try {
        // Only use network disable/enable for gentle refresh (no IndexedDB clearing)
        await disableNetwork(dbInstance)
        await enableNetwork(dbInstance)
        
        // Short delay for gentle refresh (reduced from 1000ms to 200ms)
        await new Promise(resolve => setTimeout(resolve, 200))
      } catch (cacheError: any) {
        console.log(`⚠️ Gentle cache refresh completed for ${collectionName}:`, cacheError?.message || 'Unknown error')
      }
    }
    
    const collectionRef = collection(dbInstance, collectionName)
    const querySnapshot = await getDocs(collectionRef)
    
    const data: T[] = []
    querySnapshot.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() } as T)
    })
    
    console.log(`📊 Fetched ${data.length} items from ${collectionName}${forceFresh ? ' (refreshed)' : ''}`)
    
    return data
  } catch (error) {
    console.error(`❌ Error fetching ${collectionName}:`, error)
    return []
  }
}

// Subscribe to real-time updates from a Firestore collection
export function subscribe<T>(collectionName: string, cb: (docs: T[]) => void) {
  try {
    const dbInstance = getDb()
    const collectionRef = collection(dbInstance, collectionName)
    
    // Subscribe to real-time updates
    const unsubscribe = onSnapshot(collectionRef, (querySnapshot) => {
      const data: T[] = []
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as T)
      })
      cb(data)
    }, (error) => {
      console.error(`Error subscribing to ${collectionName}:`, error)
      cb([]) // Return empty array on error
    })
    
    return unsubscribe
  } catch (error) {
    console.error(`Error setting up subscription for ${collectionName}:`, error)
    return () => {} // Return empty unsubscribe function
  }
}

// Get a single document from Firestore
export async function getOne<T>(collectionName: string, id: string): Promise<T | null> {
  try {
    const dbInstance = getDb()
    const docRef = doc(dbInstance, collectionName, id)
    const docSnap = await getDocs(query(collection(dbInstance, collectionName)))
    
    // Find the document with matching id
    let foundDoc: T | null = null
    docSnap.forEach((document) => {
      const data = document.data()
      if (data.id === id || document.id === id) {
        foundDoc = { id: document.id, ...data } as T
      }
    })
    
    return foundDoc
  } catch (error) {
    console.error(`Error fetching document ${id} from ${collectionName}:`, error)
    return null
  }
}

// Subscribe to a single document's updates
export function subscribeOne<T>(collectionName: string, id: string, cb: (doc: T | null) => void) {
  try {
    const dbInstance = getDb()
    const collectionRef = collection(dbInstance, collectionName)
    
    const unsubscribe = onSnapshot(collectionRef, (querySnapshot) => {
      let foundDoc: T | null = null
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        if (data.id === id || doc.id === id) {
          foundDoc = { id: doc.id, ...data } as T
        }
      })
      cb(foundDoc)
    }, (error) => {
      console.error(`Error subscribing to document ${id} in ${collectionName}:`, error)
      cb(null)
    })
    
    return unsubscribe
  } catch (error) {
    console.error(`Error setting up subscription for document ${id} in ${collectionName}:`, error)
    return () => {}
  }
}
