
import { NyxCollection } from '@/types'
import { getFirestore, doc, getDoc, getDocs, collection, onSnapshot } from 'firebase/firestore'
import type { Query, DocumentData, CollectionReference, FirestoreDataConverter, DocumentReference, FirestoreError, QueryDocumentSnapshot, DocumentSnapshot, QuerySnapshot } from 'firebase/firestore'

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
  private db = getFirestore()
  private subscriptions: { [key: string]: NyxSubscription } = {}

  async subscribe<T>({ key, docRef, queryRef, callback, error, converter }: NyxSubscriptionParams<T>) {
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

  unsubscribe = (key: string, cleanup?: () => void) => {
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

  public get runningKeys() {
    return Object.keys(this.subscriptions)
  }

  public getRunningKeys (prefix: string = '') {
    return this.runningKeys.filter((key) => key.startsWith(prefix))
  }
  
  public getCollectionRef = <T = DocumentData>(
    collectionName: NyxCollection,
    converter?: FirestoreDataConverter<T>
    ) => {
    return !!converter
      ? collection(this.db, collectionName).withConverter(converter)
      : collection(this.db, collectionName) as CollectionReference<T>
  }

  public getDocRef = <T = DocumentData>(
    collectionName: NyxCollection,
    docId: string|null,
    converter?: FirestoreDataConverter<T>
  ) => {
    const colRef = this.getCollectionRef<T>(collectionName)
    if (docId !== null) return !!converter
      ? doc(colRef, docId).withConverter(converter)
      : doc(colRef, docId) as DocumentReference<T>
    else return !!converter
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

  private getData<T>(snapshot: QueryDocumentSnapshot<DocumentData>, converter?: FirestoreDataConverter<T>) {
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
