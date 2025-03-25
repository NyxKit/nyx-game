
import { NyxCollection } from '@/types'
import type { KeyDict } from 'nyx-kit/types'
import { doc, getDoc, getDocs, collection, onSnapshot, addDoc, setDoc, updateDoc, initializeFirestore } from 'firebase/firestore'
import type {
  Query, DocumentData, CollectionReference, FirestoreDataConverter, DocumentReference, FirestoreError,
  QueryDocumentSnapshot, DocumentSnapshot, WithFieldValue, Firestore
} from 'firebase/firestore'
import { initializeApp, type FirebaseApp, type FirebaseOptions } from 'firebase/app'
// import { getAnalytics, type Analytics } from 'firebase/analytics'
import { getAuth, GoogleAuthProvider, signInWithPopup, type Auth, type AuthProvider } from 'firebase/auth'
// import { GoogleAuthProvider } from 'firebase/auth/web-extension'

const __CONFIG__ = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
} as const

interface NyxSubscription {
  key: string
  count: number
  destroy?: () => void
}

interface NyxSubscriptionParams<T> {
  key: string
  docRef?: DocumentReference<DocumentData>
  queryRef?: Query<DocumentData>
  callback: (data: T|T[]) => void
  error?: (error: FirestoreError) => void
  converter?: FirestoreDataConverter<T>
}

export default class NyxDatabase {
  public app: FirebaseApp
  public db: Firestore
  // public analytics: Analytics
  public auth: Auth
  public authProviders: KeyDict<AuthProvider> = {
    google: new GoogleAuthProvider()
  }
  private subscriptions: KeyDict<NyxSubscription> = {}

  constructor (options: FirebaseOptions = __CONFIG__) {
    this.app = initializeApp(options)
    this.db = initializeFirestore(this.app, { ignoreUndefinedProperties: true })
    this.auth = getAuth(this.app)
    // this.analytics = getAnalytics(this.app)
  }

  public async signIn (provider: keyof typeof this.authProviders = 'google') {
    const result = await signInWithPopup(this.auth, this.authProviders[provider])
    return result
  }

  public getRunningKeys (prefix: string = '') {
    return Object.keys(this.subscriptions).filter((key) => key.startsWith(prefix))
  }

  public async getDocument<T>(
    collectionName: NyxCollection,
    docId: string,
    converter?: FirestoreDataConverter<T>,
    suppressError: boolean = false
  ): Promise<T|null> {
    const docRef = this.getDocRef(collectionName, docId, converter)
    const doc = await getDoc<T, DocumentData>(docRef)
    if (doc.exists()) return doc.data()
    if (!suppressError) console.error(`No document found with id "${docId}" in collection "${collectionName}".`)
    return null
  }

  public async addDocument<T>(
    collectionName: NyxCollection,
    data: T,
    converter?: FirestoreDataConverter<T>
  ): Promise<string> {
    const colRef = this.getCollectionRef(collectionName)
    const docData = converter ? converter.toFirestore(data) : data as WithFieldValue<DocumentData>
    const docRef = await addDoc(colRef, docData)
    return docRef.id
  }

  public async setDocument<T>(
    collectionName: NyxCollection,
    docId: string,
    data: T,
    converter?: FirestoreDataConverter<T>
  ) {
    const docRef = this.getDocRef(collectionName, docId, converter)
    await setDoc(docRef, data)
  }

  public async updateDocument<T>(
    collectionName: NyxCollection,
    docId: string,
    data: Partial<T>,
    converter?: FirestoreDataConverter<T>
  ) {
    const docRef = this.getDocRef(collectionName, docId, converter)
    await updateDoc(docRef, data)
  }

  public async subscribe<T>({ key, docRef, queryRef, callback, error, converter }: NyxSubscriptionParams<T>) {
    if (this.subscriptions[key] === undefined) {
      this.subscriptions[key] = { key, count: 0 }
    }

    this.subscriptions[key].count += 1
    if (this.subscriptions[key].count !== 1) return
    try {
      if (docRef) {
        const destroyFn = onSnapshot(docRef, (doc) => this.handleDocSnapshot(doc, callback, converter), error)
        this.subscriptions[key].destroy = destroyFn
      } else if (queryRef) {
        const destroyFn = onSnapshot(queryRef, (snapshot) => this.handleQuerySnapshot(snapshot, callback, converter), error)
        this.subscriptions[key].destroy = destroyFn
      }
    } catch (error) {
      console.error(`Error subscribing to key "${key}":`, error)
    }
  }

  public unsubscribe = (key: string, cleanup?: () => void) => {
    if (!this.subscriptions[key]) {
      console.warn(`You should not unsubscribe if you have not yet subscribed to key "${key}".`)
      return
    }

    this.subscriptions[key].count -= 1
    if (this.subscriptions[key].count !== 0) return
    const destroyFn = this.subscriptions[key].destroy
    if (destroyFn) {
      delete this.subscriptions[key]
      destroyFn()
      cleanup?.()
    } else {
      console.warn(`Unsubscribe called with key "${key}" while subscribe is waiting to complete.`)
    }
  }

  public getCollectionRef = <T = DocumentData>(
    collectionName: NyxCollection,
    converter?: FirestoreDataConverter<T>
  ) => {
    return converter
      ? collection(this.db, collectionName).withConverter(converter)
      : collection(this.db, collectionName) as CollectionReference<T>
  }

  public getDocRef = <T = DocumentData>(
    collectionName: NyxCollection,
    docId: string|null,
    converter?: FirestoreDataConverter<T>
  ) => {
    const colRef = this.getCollectionRef<T>(collectionName)
    if (docId !== null) return converter
      ? doc(colRef, docId).withConverter(converter)
      : doc(colRef, docId) as DocumentReference<T>
    else return converter
      ? doc(colRef).withConverter(converter)
      : doc(colRef) as DocumentReference<T>
  }

  public getSnapshot = async <T = DocumentData>(
    collectionName: NyxCollection,
    docId: string|null,
    converter?: FirestoreDataConverter<T>
  ) => {
    const docRef = this.getDocRef<T>(collectionName, docId, converter)
    return await getDoc<T, DocumentData>(docRef)
  }

  public getDocData = async <T = DocumentData>(
    collectionName: NyxCollection,
    docId: string|null,
    converter?: FirestoreDataConverter<T>
  ) => {
    const docSnap = await this.getSnapshot<T>(collectionName, docId, converter)
    if (docSnap.exists()) return docSnap.data()
    console.error(`There is no document with id "${docId}" in collection "${collectionName}".`)
    return null
  }

  public getDocDataByRef = async <T = DocumentData>(ref: DocumentReference<T>) => {
    const docSnap = await getDoc<T, DocumentData>(ref)
    if (docSnap.exists()) return docSnap.data()
    console.error(`No document found with reference id "${ref.id}".`)
    return undefined
  }

  public getDocDataByQuery = async <T = DocumentData>(query: Query<T>) => {
    const querySnap = await getDocs(query)
    if (!querySnap.empty) return querySnap.docs.map((doc) => doc.data())
    console.error(`No document(s) found using query "${query}".`)
    return []
  }

  public getCollectionData = async <T = DocumentData>(
    collectionName: NyxCollection,
    converter?: FirestoreDataConverter<T>
  ) => {
    const colRef = this.getCollectionRef<T>(collectionName, converter)
    const querySnap = await getDocs<T, DocumentData>(colRef as Query<T>)
    if (!querySnap.empty) return querySnap.docs.map((doc) => doc.data())
    console.error(`Collection "${collectionName}" is empty.`)
    return []
  }

  private getData<T>(
    snapshot: QueryDocumentSnapshot<DocumentData>,
    converter?: FirestoreDataConverter<T>
  ) {
    return converter ? converter.fromFirestore(snapshot) : (snapshot.data() as T)
  }

  private handleDocSnapshot<T>(
    doc: DocumentSnapshot<DocumentData>,
    callback: (data: T) => void,
    converter?: FirestoreDataConverter<T>
  ) {
    if (!doc.exists()) return
    const docData = this.getData(doc, converter)
    if (docData) callback(docData)
  }

  private handleQuerySnapshot<T>(
    snapshot: { docs: QueryDocumentSnapshot<DocumentData>[] },
    callback: (data: T[]) => void,
    converter?: FirestoreDataConverter<T>
  ) {
    const queryData = snapshot.docs.map((doc) => this.getData(doc, converter))
    callback(queryData)
  }
}
