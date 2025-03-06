import type { QueryDocumentSnapshot } from 'firebase/firestore'
import { NyxLoader } from 'nyx-kit/classes'

export default class Profile {
  public id: string = ''
  public firstName: string = ''
  public lastName: string = ''
  public email: string = ''
  public country: string = ''
  public createdAt: Date = new Date()
  public updatedAt: Date = new Date()
  
  constructor(data?: unknown) {
    if (!data) return
    this.id = NyxLoader.loadString(data, 'id')
    this.firstName = NyxLoader.loadString(data, 'firstName')
    this.lastName = NyxLoader.loadString(data, 'lastName')
    this.email = NyxLoader.loadString(data, 'email')
    this.country = NyxLoader.loadString(data, 'country')
    // this.createdAt = NyxLoader.loadDate(data, 'createdAt')
    // this.updatedAt = NyxLoader.loadDate(data, 'updatedAt')
  }

  public get fullName () {
    return `${this.firstName} ${this.lastName}`
  }

  public get initials () {
    return `${this.firstName.charAt(0)}${this.lastName.charAt(0)}`
  }

  public getRawData() {
    return {
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
