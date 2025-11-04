import { JsonDb } from 'app/utils/json-service';
import dayjs from 'dayjs';
import { Atom } from 'use-atom-view';

export enum TaskStatus {
  doing = 1,
  paused,
}

// 任务
export interface Task {
  id: number;
  title: string;
  desc: string;
  icon: string;
  status: TaskStatus;
  createdAt: number;
  closedAt: number;
  // 上次打卡时间
  lastDakaAt: number;
  // 总打卡次数
  dakas: number;
  // 持续打卡天数
  keeps: number;
  // 执行一次，大概需要多少时间。0 表示不统计时间
  avg_time: number;
  // 收获的总分数
  scores: number;
}

// 一次记录
export interface Daka {
  desc?: string;
  score: number;
  createdAt: number;
}

// 奖励
export interface Award {
  id: number;
  milestore: number;
}

// 里程碑实现方式
enum MeetBy {
  custom,
  daka_times,
  keep_times,
}

// 里程碑
export interface Milestone {
  id: number;
  taskId: number;
  title: string;
  desc?: string;
  // 期望完成时间
  expectedAt?: number;
  // 实际完成时间
  doneAt?: number;
  // 是否完成
  isDone: boolean;
  meetBy: MeetBy;
  // 需要满足的值
  needValue?: number;
}

export const db = new JsonDb({
  repo: 'TinkGu/private-cloud',
  path: 'goose/tasks',
  atom: Atom.of({
    items: [] as Task[],
    score: 0,
  }),
});

db.subscribe(() => {
  // TODO:
});

// 判断是否是今天打卡的
export function checkDone(task: Task) {
  if (!task.lastDakaAt) {
    return false;
  }
  return dayjs(task.lastDakaAt).isSame(dayjs(), 'day');
}
