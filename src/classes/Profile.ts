import type { QueryDocumentSnapshot } from 'firebase/firestore'
import { NyxLoader } from 'nyx-kit/classes'

export default class Profile {
  public id: string = ''
  public displayName: string|null = null
  public firstName: string|null = null
  public lastName: string|null = null
  public email: string|null = null
  public country: string|null = null
  public createdAt: Date = new Date()
  public updatedAt: Date = new Date()
  
  constructor(data?: unknown) {
    if (!data) return
    this.id = NyxLoader.loadString(data, 'id')
    this.displayName = NyxLoader.loadStringOrNull(data, 'displayName', null)
    this.firstName = NyxLoader.loadStringOrNull(data, 'firstName', null)
    this.lastName = NyxLoader.loadStringOrNull(data, 'lastName', null)
    this.email = NyxLoader.loadStringOrNull(data, 'email', null)
    this.country = NyxLoader.loadStringOrNull(data, 'country', null)
    // this.createdAt = NyxLoader.loadDate(data, 'createdAt')
    // this.updatedAt = NyxLoader.loadDate(data, 'updatedAt')
  }

  public get fullName () {
    if (this.displayName) return this.displayName
    return `${this.firstName} ${this.lastName}`
  }

  public get initials () {
    if (this.displayName) return this.displayName.split(' ').map((name) => name[0]).join('')
    return `${this.firstName?.charAt(0)}${this.lastName?.charAt(0)}`
  }

  public getRawData() {
    return {
      displayName: this.displayName,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      country: this.country,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }

  static Converter = {
    toFirestore: (profile: Profile) => profile.getRawData(),
    fromFirestore: (snapshot: QueryDocumentSnapshot) => {
      const data = snapshot.data()
      return new Profile({ ...data, id: snapshot.id })
    }
  }
}
