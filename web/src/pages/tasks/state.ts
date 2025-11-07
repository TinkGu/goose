import { JsonDb } from 'app/utils/json-service';
import { getMonthWeek } from 'app/utils/time';
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
  maxKeeps: number; // 最大持续打卡天数
  avgTime: number; // 执行一次，大概需要多少时间。0 表示不统计时间
  scores: number; // 收获的总分数
  weekPeriod?: string; // 当前处于的周周期
  weekdays: number[]; // 每天打卡的标记
  isCycle: boolean; // 是否是周期任务
  weekMinTimes: number; // 每周最少做几次
  milestones: Milestone[]; // 里程碑
  prizes: string[]; // 奖章
}

// 一次记录
export interface Daka {
  desc?: string;
  score: number;
  createdAt: number;
}

// 里程碑实现方式
export enum MeetBy {
  custom,
  dakaTimes,
  keepTimes,
}

// 里程碑
export interface Milestone {
  key?: string;
  taskId: number;
  title: string;
  createdAt: number;
  expectedAt?: number; // 期望完成时间
  doneAt?: number; // 实际完成时间
  isDone?: boolean; // 是否完成
  meetBy: MeetBy;
  meetValue?: number; // 需要满足的值
  award?: Award; // 奖励
}

export interface Award {
  title?: string;
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

// 判断是否是今天打卡的
export function checkDone(task: Task) {
  if (!task.lastDakaAt) {
    return false;
  }
  return dayjs(task.lastDakaAt).isSame(dayjs(), 'day');
}

// 根据周期变化，自动清洗数据
export async function washTasks() {
  let shouldSave = false;
  const { items } = db.atom.get();
  for (let task of items) {
    const period = getWeekPeriod();
    if (task.weekPeriod !== period) {
      task.weekPeriod = period;
      task.weekdays = [];
      shouldSave = true;
    }
  }
  if (shouldSave) {
    db.atom.merge({ items });
    await db.save();
  }
}

export function getWeekPeriod() {
  const now = dayjs();
  const { month, week } = getMonthWeek();
  return `${now.format('YY')}_${month}_${week}`;
}

export function weekPeriodToObj(key: string) {
  const [_, year, month, week] = key.split('_');
  return {
    year: Number(year),
    month: Number(month),
    week: Number(week),
  };
}

// 检查是否需要颁发完美周奖励
export function isPerfectWeekPlan(task: Task) {
  if (!task.isCycle) {
    return false;
  }
  const weekPeriod = getWeekPeriod();
  if (task.prizes?.includes('week_' + weekPeriod)) {
    return false;
  }
  const weekNeeds = task.weekMinTimes || 7;
  let days = 0;
  task.weekdays?.forEach((x) => {
    if (x > 0) {
      days++;
    }
  });
  return days >= weekNeeds;
}

// 检查是否需要颁发完美月奖励
export function isPerfectMonthPlan(task: Task) {
  const now = dayjs();
  const { month } = getMonthWeek();
  if (task.prizes?.includes(`month_${now.format('YY')}_${month}`)) {
    return false;
  }
  if (!task.prizes?.length) {
    return false;
  }
  const plans = [
    `week_${now.format('YY')}_${month}_1`,
    `week_${now.format('YY')}_${month}_2`,
    `week_${now.format('YY')}_${month}_3`,
    `week_${now.format('YY')}_${month}_4`,
  ];
  for (let plan of plans) {
    if (!task.prizes.includes(plan)) {
      return false;
    }
  }
  return true;
}
