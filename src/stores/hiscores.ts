import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

const DUMMY_HISCORES = [
  { id: 'wxoQTosk', name: 'Victor Brown', score: 421737, country: 'Belgium', timestamp: new Date('2024-01-15T08:23:15') },
  { id: 'A5bHdGCX', name: 'Ursula Perez', score: 372994, country: 'Mexico', timestamp: new Date('2024-02-28T14:45:30') },
  { id: 'aN8QupS0', name: 'Henry Ramirez', score: 371024, country: 'Spain', timestamp: new Date('2023-11-12T19:10:45') },
  { id: 'c7FajyrG', name: 'Quinn Hernandez', score: 476932, country: 'Belgium', timestamp: new Date() },
  { id: 'nkeYa6Cm', name: 'Jack Johnson', score: 674158, country: 'United States', timestamp: new Date('2023-09-05T11:30:20') },
  { id: '1tnplbR9', name: 'Xander Smith', score: 879401, country: 'United Kingdom', timestamp: new Date() },
  { id: 'bIwPvfAL', name: 'Emma Clark', score: 660068, country: 'Belgium', timestamp: new Date('2024-03-17T16:55:40') },
  { id: 'PhhdMBtF', name: 'Jack Miller', score: 450942, country: 'New Zealand', timestamp: new Date('2023-12-24T22:15:10') },
  { id: 'L0w2s6Gm', name: 'Nancy Perez', score: 575921, country: 'Colombia', timestamp: new Date() },
  { id: 'VrGkMOx9', name: 'Paul Williams', score: 957025, country: 'Ireland', timestamp: new Date('2023-08-30T03:40:25') },
  { id: '4qMZBsEa', name: 'Ivy Smith', score: 659281, country: 'France', timestamp: new Date('2024-01-01T00:00:00') },
  { id: '2t15VicD', name: 'Wendy Perez', score: 277813, country: 'Chile', timestamp: new Date('2023-10-19T09:20:50') },
  { id: '6Ew5HlSi', name: 'Oscar White', score: 706845, country: 'Germany', timestamp: new Date() },
  { id: 'rccrz4Cg', name: 'Steve Taylor', score: 206658, country: 'Sweden', timestamp: new Date('2024-02-14T13:05:30') },
  { id: '4Ig36jv6', name: 'Oscar Williams', score: 300431, country: 'Norway', timestamp: new Date('2023-11-28T17:50:15') },
  { id: 'GyXD4K6t', name: 'Nancy Hernandez', score: 213437, country: 'Brazil', timestamp: new Date('2024-03-01T21:35:45') },
  { id: 'ZG74xVI2', name: 'Leo Martinez', score: 677727, country: 'Portugal', timestamp: new Date('2023-09-15T04:25:20') },
  { id: 'pItqmhBB', name: 'David Perez', score: 721409, country: 'Italy', timestamp: new Date() },
  { id: 'zEJLz3Me', name: 'Quinn Martinez', score: 741545, country: 'Greece', timestamp: new Date('2024-01-30T07:15:35') },
  { id: 'pHSS3r8a', name: 'Charlie Rodriguez', score: 421920, country: 'Japan', timestamp: new Date('2023-12-11T12:40:50') },
  { id: 'ZlYlqmTN', name: 'Nancy Miller', score: 178384, country: 'South Korea', timestamp: new Date('2024-02-05T15:55:25') },
  { id: 'J5YM8KS5', name: 'Bob Davis', score: 900804, country: 'India', timestamp: new Date('2023-10-03T19:30:40') },
  { id: 'D3XaohQF', name: 'Emma Johnson', score: 772826, country: 'Russia', timestamp: new Date('2024-03-22T23:45:15') },
  { id: 'k6ewyuqI', name: 'Frank Garcia', score: 977661, country: 'Poland', timestamp: new Date('2023-11-07T02:20:30') },
  { id: 'PUqJtJBQ', name: 'Oscar Lee', score: 298808, country: 'Netherlands', timestamp: new Date('2024-01-20T06:35:55') },
  { id: 'DWmngatx', name: 'John Lee', score: 666838, country: 'Belgium', timestamp: new Date('2023-09-28T10:50:20') },
  { id: 'k38P1Osq', name: 'Quinn Wilson', score: 274556, country: 'Denmark', timestamp: new Date('2024-02-19T14:15:45') },
  { id: 'AsxwxjHE', name: 'David Lee', score: 474213, country: 'Finland', timestamp: new Date('2023-12-05T18:30:10') },
  { id: 'oSqfjx6D', name: 'Yasmine Gonzalez', score: 998104, country: 'Switzerland', timestamp: new Date('2024-03-10T22:45:35') },
  { id: 'vGl4ctrl', name: 'Leo Anderson', score: 139716, country: 'Austria', timestamp: new Date('2023-10-25T01:00:50') },
  { id: 'yPzDnTdq', name: 'Bob Thompson', score: 587669, country: 'Hungary', timestamp: new Date('2024-01-08T05:25:15') },
  { id: 'HPfZHkIn', name: 'Nancy Wilson', score: 163063, country: 'Czech Republic', timestamp: new Date('2023-11-21T09:40:40') },
  { id: 'R5Vwk16q', name: 'Quinn Clark', score: 620315, country: 'Romania', timestamp: new Date('2024-02-09T13:55:05') },
  { id: 'PqT4ARPI', name: 'Wendy Brown', score: 207687, country: 'Bulgaria', timestamp: new Date('2023-09-20T17:10:30') },
  { id: '9fNzufbx', name: 'Jack Martin', score: 760993, country: 'Croatia', timestamp: new Date('2024-03-05T21:25:55') },
  { id: 'ACSWkbGh', name: 'Mona Jones', score: 633138, country: 'Serbia', timestamp: new Date('2023-12-18T00:40:20') },
  { id: '26YtvJUF', name: 'Oscar Lewis', score: 883657, country: 'Ukraine', timestamp: new Date('2024-01-25T04:55:45') },
  { id: 'lpCihLjk', name: 'Bob Jackson', score: 915447, country: 'Turkey', timestamp: new Date('2023-10-31T08:10:10') },
  { id: 'tg2isXNo', name: 'Mona Clark', score: 765488, country: 'Egypt', timestamp: new Date('2024-02-23T12:25:35') },
  { id: 'SaxpmlBt', name: 'Yasmine White', score: 280055, country: 'South Africa', timestamp: new Date('2023-11-16T16:40:00') },
  { id: 'O5Py7ML6', name: 'Tina Harris', score: 807775, country: 'Nigeria', timestamp: new Date('2024-03-15T20:55:25') },
  { id: 'vq2n1dt9', name: 'Victor Martin', score: 601171, country: 'Kenya', timestamp: new Date('2023-09-10T23:10:50') },
  { id: 'o7FpyTTf', name: 'John Martinez', score: 138879, country: 'Morocco', timestamp: new Date('2024-01-05T03:25:15') },
  { id: '9DzgPJFT', name: 'Yasmine Martinez', score: 789907, country: 'Israel', timestamp: new Date('2023-12-29T07:40:40') },
  { id: 'scZCzXQ0', name: 'Jack Garcia', score: 104977, country: 'Saudi Arabia', timestamp: new Date('2024-02-02T11:55:05') },
  { id: 'urO4Mk1o', name: 'Ivy White', score: 743786, country: 'United Arab Emirates', timestamp: new Date('2023-10-15T15:10:30') },
  { id: 'T9toNLrW', name: 'Mona Lewis', score: 349774, country: 'China', timestamp: new Date('2024-03-20T19:25:55') },
  { id: 'TeP9BQlR', name: 'Jane Jackson', score: 897721, country: 'Thailand', timestamp: new Date('2023-11-03T22:40:20') },
  { id: 'RxyhmS3K', name: 'Victor Moore', score: 683548, country: 'Belgium', timestamp: new Date('2024-01-12T02:55:45') },
  { id: 'EiVOZmJu', name: 'Emma Lopez', score: 288626, country: 'Singapore', timestamp: new Date('2023-12-22T06:10:10') }
]

const useHiscoresStore = defineStore('hiscores', () => {
  const hiscores = ref(DUMMY_HISCORES)

  return { hiscores }
})

export default useHiscoresStore
