import { MeetBy, Milestone, Task } from './state';

// 内置挑战
export const plans: Omit<Milestone, 'taskId' | 'createdAt'>[] = [
  {
    key: 'keep_7',
    title: '连续 7 天打卡',
    meetBy: MeetBy.keepTimes,
    meetValue: 7,
    award: {
      score: 7,
    },
  },
  {
    key: 'keep_30',
    title: '连续 30 天打卡',
    meetBy: MeetBy.keepTimes,
    meetValue: 30,
    award: {
      score: 30,
    },
  },
  {
    key: 'keep_60',
    title: '连续 60 天打卡',
    meetBy: MeetBy.keepTimes,
    meetValue: 60,
    award: {
      score: 100,
    },
  },
  {
    key: 'keep_100',
    title: '连续 100 天打卡',
    meetBy: MeetBy.keepTimes,
    meetValue: 100,
    award: {
      score: 200,
    },
  },
  {
    key: 'keep_200',
    title: '连续 200 天打卡',
    meetBy: MeetBy.keepTimes,
    meetValue: 200,
    award: {
      title: '连续 360 天打卡奖励',
      score: 500,
    },
  },
  {
    key: 'keep_360',
    title: '连续 360 天打卡',
    meetBy: MeetBy.keepTimes,
    meetValue: 360,
    award: {
      score: 1000,
    },
  },
  {
    key: 'keep_1000',
    title: '连续 1000 天打卡',
    meetBy: MeetBy.keepTimes,
    meetValue: 1000,
    award: {
      score: 3000,
    },
  },
  {
    key: 'daka_10',
    title: '打卡 10 次',
    meetBy: MeetBy.dakaTimes,
    meetValue: 10,
    award: {
      score: 10,
    },
  },
  {
    key: 'daka_20',
    title: '打卡 20 次',
    meetBy: MeetBy.dakaTimes,
    meetValue: 20,
    award: {
      score: 20,
    },
  },
  {
    key: 'daka_50',
    title: '打卡 50 次',
    meetBy: MeetBy.dakaTimes,
    meetValue: 50,
    award: {
      score: 30,
    },
  },
  {
    key: 'daka_111',
    title: '打卡 111 次',
    meetBy: MeetBy.dakaTimes,
    meetValue: 111,
    award: {
      score: 100,
    },
  },
  {
    key: 'daka_250',
    title: '打卡 250 次',
    meetBy: MeetBy.dakaTimes,
    meetValue: 250,
    award: {
      score: 200,
    },
  },
  {
    key: 'daka_500',
    title: '打卡 500 次',
    meetBy: MeetBy.dakaTimes,
    meetValue: 500,
    award: {
      score: 300,
    },
  },
  {
    key: 'daka_999',
    title: '打卡 999 次',
    meetBy: MeetBy.dakaTimes,
    meetValue: 999,
    award: {
      score: 500,
    },
  },
  {
    key: 'daka_2000',
    title: '打卡 2000 次',
    meetBy: MeetBy.dakaTimes,
    meetValue: 2000,
    award: {
      score: 1000,
    },
  },
  {
    key: 'daka_3000',
    title: '打卡 3000 次',
    meetBy: MeetBy.dakaTimes,
    meetValue: 3000,
    award: {
      score: 1500,
    },
  },
  {
    key: 'daka_4000',
    title: '打卡 4000 次',
    meetBy: MeetBy.dakaTimes,
    meetValue: 4000,
    award: {
      score: 2000,
    },
  },
  {
    key: 'daka_5000',
    title: '打卡 5000 次',
    meetBy: MeetBy.dakaTimes,
    meetValue: 5000,
    award: {
      score: 2500,
    },
  },
  {
    key: 'daka_6000',
    title: '打卡 6000 次',
    meetBy: MeetBy.dakaTimes,
    meetValue: 6000,
    award: {
      score: 3000,
    },
  },
  {
    key: 'daka_7000',
    title: '打卡 7000 次',
    meetBy: MeetBy.dakaTimes,
    meetValue: 7000,
    award: {
      score: 3500,
    },
  },
  {
    key: 'daka_8000',
    title: '打卡 8000 次',
    meetBy: MeetBy.dakaTimes,
    meetValue: 8000,
    award: {
      score: 4000,
    },
  },
  {
    key: 'daka_9000',
    title: '打卡 9000 次',
    meetBy: MeetBy.dakaTimes,
    meetValue: 9000,
    award: {
      score: 4500,
    },
  },
  {
    key: 'daka_10000',
    title: '打卡 10000 次',
    meetBy: MeetBy.dakaTimes,
    meetValue: 10000,
    award: {
      score: 5000,
    },
  },
];

export function findNearbyPlan(task: Task) {
  const res: Array<{ key: string; delta: number; title: string }> = [];
  const smallNear = 3; // 差 3 天完成，可以记为即将完成
  const bigNear = 10; // 当数据量已经比较大时，差 10 天标记为即将完成
  for (let plan of plans) {
    if (plan.meetBy == MeetBy.dakaTimes) {
      const delta = plan.meetValue! - task.dakas;
      const near = plan.meetValue! > 100 ? bigNear : smallNear;
      if (delta > 0 && delta <= near) {
        res.push({ key: plan.key!, delta, title: plan.title });
      }
    }
    if (plan.meetBy == MeetBy.keepTimes) {
      const delta = plan.meetValue! - task.keeps;
      const near = plan.meetValue! > 100 ? bigNear : smallNear;
      if (delta > 0 && delta <= near) {
        res.push({ key: plan.key!, delta, title: plan.title });
      }
    }
  }
  return res;
}
