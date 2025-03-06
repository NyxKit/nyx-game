import type { QueryDocumentSnapshot } from 'firebase/firestore'
import { NyxLoader } from 'nyx-kit/classes'

export default class Hiscore {
  public id: string = ''
  public score: number = 0
  public timestamp: Date = new Date()
  public userId: string = ''

  constructor (data?: unknown) {
    if (!data) return
    this.id = NyxLoader.loadString(data, 'id')
    this.score = NyxLoader.loadNumber(data, 'score')
    // this.timestamp = NyxLoader.loadDate(data, 'timestamp')
    this.userId = NyxLoader.loadString(data, 'userId')
  }

  public getRawData() {
    return {
      score: this.score,
      timestamp: this.timestamp,
      userId: this.userId,
    }
  }

  static Converter = {
    toFirestore: (hiscore: Hiscore) => hiscore.getRawData(),
    fromFirestore: (snapshot: QueryDocumentSnapshot) => {
      const data = snapshot.data()
      return new Hiscore({ ...data, id: snapshot.id })
    }
  }
}
