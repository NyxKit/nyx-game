import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

const DUMMY_HISCORES = [
  { id: 'wxoQTosk', name: 'Victor Brown', score: 421737 },
  { id: 'A5bHdGCX', name: 'Ursula Perez', score: 372994 },
  { id: 'aN8QupS0', name: 'Henry Ramirez', score: 371024 },
  { id: 'c7FajyrG', name: 'Quinn Hernandez', score: 476932 },
  { id: 'nkeYa6Cm', name: 'Jack Johnson', score: 674158 },
  { id: '1tnplbR9', name: 'Xander Smith', score: 879401 },
  { id: 'bIwPvfAL', name: 'Emma Clark', score: 660068 },
  { id: 'PhhdMBtF', name: 'Jack Miller', score: 450942 },
  { id: 'L0w2s6Gm', name: 'Nancy Perez', score: 575921 },
  { id: 'VrGkMOx9', name: 'Paul Williams', score: 957025 },
  { id: '4qMZBsEa', name: 'Ivy Smith', score: 659281 },
  { id: '2t15VicD', name: 'Wendy Perez', score: 277813 },
  { id: '6Ew5HlSi', name: 'Oscar White', score: 706845 },
  { id: 'rccrz4Cg', name: 'Steve Taylor', score: 206658 },
  { id: '4Ig36jv6', name: 'Oscar Williams', score: 300431 },
  { id: 'GyXD4K6t', name: 'Nancy Hernandez', score: 213437 },
  { id: 'ZG74xVI2', name: 'Leo Martinez', score: 677727 },
  { id: 'pItqmhBB', name: 'David Perez', score: 721409 },
  { id: 'zEJLz3Me', name: 'Quinn Martinez', score: 741545 },
  { id: 'pHSS3r8a', name: 'Charlie Rodriguez', score: 421920 },
  { id: 'ZlYlqmTN', name: 'Nancy Miller', score: 178384 },
  { id: 'J5YM8KS5', name: 'Bob Davis', score: 900804 },
  { id: 'D3XaohQF', name: 'Emma Johnson', score: 772826 },
  { id: 'k6ewyuqI', name: 'Frank Garcia', score: 977661 },
  { id: 'PUqJtJBQ', name: 'Oscar Lee', score: 298808 },
  { id: 'DWmngatx', name: 'John Lee', score: 666838 },
  { id: 'k38P1Osq', name: 'Quinn Wilson', score: 274556 },
  { id: 'AsxwxjHE', name: 'David Lee', score: 474213 },
  { id: 'oSqfjx6D', name: 'Yasmine Gonzalez', score: 998104 },
  { id: 'vGl4ctrl', name: 'Leo Anderson', score: 139716 },
  { id: 'yPzDnTdq', name: 'Bob Thompson', score: 587669 },
  { id: 'HPfZHkIn', name: 'Nancy Wilson', score: 163063 },
  { id: 'R5Vwk16q', name: 'Quinn Clark', score: 620315 },
  { id: 'PqT4ARPI', name: 'Wendy Brown', score: 207687 },
  { id: '9fNzufbx', name: 'Jack Martin', score: 760993 },
  { id: 'ACSWkbGh', name: 'Mona Jones', score: 633138 },
  { id: '26YtvJUF', name: 'Oscar Lewis', score: 883657 },
  { id: 'lpCihLjk', name: 'Bob Jackson', score: 915447 },
  { id: 'tg2isXNo', name: 'Mona Clark', score: 765488 },
  { id: 'SaxpmlBt', name: 'Yasmine White', score: 280055 },
  { id: 'O5Py7ML6', name: 'Tina Harris', score: 807775 },
  { id: 'vq2n1dt9', name: 'Victor Martin', score: 601171 },
  { id: 'o7FpyTTf', name: 'John Martinez', score: 138879 },
  { id: '9DzgPJFT', name: 'Yasmine Martinez', score: 789907 },
  { id: 'scZCzXQ0', name: 'Jack Garcia', score: 104977 },
  { id: 'urO4Mk1o', name: 'Ivy White', score: 743786 },
  { id: 'T9toNLrW', name: 'Mona Lewis', score: 349774 },
  { id: 'TeP9BQlR', name: 'Jane Jackson', score: 897721 },
  { id: 'RxyhmS3K', name: 'Victor Moore', score: 683548 },
  { id: 'EiVOZmJu', name: 'Emma Lopez', score: 288626 }
]

const useHiscoresStore = defineStore('hiscores', () => {
  const hiscores = ref(DUMMY_HISCORES)

  return { hiscores }
})

export default useHiscoresStore
