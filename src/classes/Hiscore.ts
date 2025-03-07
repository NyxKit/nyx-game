import { GameMode } from '@/types'
import type { QueryDocumentSnapshot } from 'firebase/firestore'
import { NyxLoader } from 'nyx-kit/classes'

export default class Hiscore {
  public id: string = ''
  public score: number = 0
  public timestamp: Date = new Date()
  public userId: string = ''
  public version: string = import.meta.env.VITE_APP_VERSION
  public gameMode: GameMode = GameMode.Normal

  constructor (data?: unknown) {
    if (!data) return
    this.id = NyxLoader.loadString(data, 'id', this.id)
    this.score = NyxLoader.loadNumber(data, 'score', this.score)
    // this.timestamp = NyxLoader.loadDate(data, 'timestamp', this.timestamp)
    this.userId = NyxLoader.loadString(data, 'userId', this.userId)
    this.version = NyxLoader.loadString(data, 'version', this.version)
    this.gameMode = NyxLoader.loadEnum(data, 'gameMode', this.gameMode, Object.values(GameMode))
  }

  public getRawData() {
    return {
      score: this.score,
      timestamp: this.timestamp,
      userId: this.userId,
      version: this.version,
      gameMode: this.gameMode
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
