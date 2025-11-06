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
  lastDakaAt: number; // 上次打卡时间
  dakas: number; // 总打卡次数
  keeps: number; // 持续打卡天数
  avgTime: number; // 执行一次，大概需要多少时间。0 表示不统计时间
  scores: number; // 收获的总分数
  weeks: number[]; // 每周打卡的标记
  isCycle: boolean; // 是否是周期任务
  weekMinTimes: number; // 每周最少做几次
  milestones: Milestone[]; // 里程碑
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
export enum MeetBy {
  custom,
  daka_times,
  keep_times,
}

// 里程碑
export interface Milestone {
  id: number;
  taskId: number;
  title: string;
  createdAt: number;
  expectedAt?: number; // 期望完成时间
  doneAt?: number; // 实际完成时间
  isDone: boolean; // 是否完成
  meetBy: MeetBy;
  meetValue?: number; // 需要满足的值
  award?: Award; // 奖励
}

export interface Award {
  title: string;
  score: number;
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
