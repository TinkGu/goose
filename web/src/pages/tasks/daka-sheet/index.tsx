import { useEffect, useState } from 'react';
import { trim } from '@tinks/xeno';
import { useDebounceFn } from '@tinks/xeno/react';
import { Modal, Portal, toast } from 'app/components';
import { IconCoin, IconMoreCircle } from 'app/components/icons';
import { createGitFile, JsonDb } from 'app/utils/json-service';
import { getMonthWeek, isInHours } from 'app/utils/time';
import classnames from 'classnames/bind';
import dayjs from 'dayjs';
import { Atom } from 'use-atom-view';
import { MilestoneItem } from '../milestone';
import { plans } from '../plans';
import { gainPrizes } from '../prize';
import { Daka, db, getWeekPeriod, isPerfectMonthPlan, isPerfectWeekPlan, MeetBy, Milestone, Task } from '../state';
import { showStats } from '../stats';
import { openTaskActions } from '../task-editor';
import styles from './styles.module.scss';

const cx = classnames.bind(styles);
const RATING_VALUES = [1, 2, 3];

function Rating({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <div className={cx('rating')}>
      {RATING_VALUES.map((x) => (
        <span key={x} className={cx('rating-value', { active: x <= value })}>
          <IconCoin onClick={() => onChange(x)} />
        </span>
      ))}
    </div>
  );
}

function DakaSheet({ task, onDestory }: { task: Task; onDestory: () => void }) {
  const [rating, setRating] = useState(1);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [doneCount, setDoneCount] = useState(0);
  const handleSave = useDebounceFn(async () => {
    try {
      const completes = await addDaka(task, { score: rating });
      onDestory();
      await gainPrizes(completes);
      showStats(task);
    } catch (err) {
      toast.error(err);
      console.error(err);
    }
  });

  const handleOpenTaskActions = useDebounceFn(() => {
    openTaskActions({ task, onContinue: onDestory, ignoreStats: false });
  });

  const handleDoneMilestone = useDebounceFn(async (ms) => {
    if (ms.isDone) return;
    const isOk = await Modal.confirm({
      position: 'bottom',
      title: ms.title,
      content: '确认完成里程碑？',
    });
    if (isOk) {
      ms.isDone = true;
      ms.doneAt = Date.now();
      setMilestones(milestones.map((x) => (x === ms ? ms : x)));
      task.scores += ms.award?.score || 0;
      task.milestones = task.milestones.map((x) => (x === ms ? ms : x));
      db.atom.modify((state) => {
        state.items = state.items.map((x) => (x.id === task.id ? task : x));
        state.score += ms.award?.score || 0;
        return state;
      });
      await db.save();
    }
  });

  useEffect(() => {
    if (!task.milestones) return;
    const dones: Milestone[] = [];
    const undones: Milestone[] = [];
    for (let x of task.milestones) {
      if (x.isDone) {
        dones.push(x);
      } else {
        undones.push(x);
      }
    }
    setMilestones(undones.concat(dones));
    setDoneCount(dones.length);
  }, [task.milestones]);

  return (
    <div className={cx('daka-sheet')}>
      <div className={cx('header-actions')}>
        <div className={cx('icon')} onClick={handleOpenTaskActions}>
          <IconMoreCircle color="#fff" />
        </div>
      </div>
      <div className={cx('header')}>
        <div className={cx('icon')}>{task.icon || '🤔'}</div>
        <div className={cx('title')}>{task.title}</div>
      </div>
      <div className={cx('content')}>
        <div className={cx('section')}>
          <div className={cx('section-title')}>今天感觉怎么样</div>
          <Rating value={rating} onChange={setRating} />
        </div>
        {milestones?.length > 0 && (
          <>
            <div className={cx('section')}>
              <div className={cx('section-title')}>
                里程碑 {doneCount}/{milestones.length}
              </div>
            </div>
            <div className={cx('milestone-list')}>
              {milestones.map((x) => (
                <MilestoneItem key={x.createdAt} value={x} onClick={handleDoneMilestone} />
              ))}
            </div>
          </>
        )}
        <div className={cx('g-btn', 'save-btn')} onClick={handleSave}>
          提交 →
        </div>
      </div>
    </div>
  );
}

function completeMilestone(milestone: Milestone) {
  milestone.isDone = true;
  milestone.doneAt = Date.now();
}

// 自动完成里程碑
function autoCompleteMilestones(task: Task) {
  let completes: Milestone[] = [];
  const insetPlans = plans.map((x) => {
    return { ...x, taskId: task.id, createdAt: task.createdAt };
  });
  const milestones = [...(task.milestones || []), ...insetPlans];
  for (let x of milestones) {
    if (x.isDone) continue;
    if (x.key && task.prizes?.includes(x.key)) continue;
    let shouldComplete = false;
    if (x.meetBy === MeetBy.dakaTimes && x.meetValue && task.dakas >= x.meetValue) {
      shouldComplete = true;
    }
    if (x.meetBy === MeetBy.keepTimes && x.meetValue && task.keeps >= x.meetValue) {
      shouldComplete = true;
    }
    if (shouldComplete) {
      completes.push(x);
      completeMilestone(x);
      if (x.key) {
        task.prizes = task.prizes || [];
        task.prizes.push(x.key);
      }
    }
  }

  // 检查周计划
  const { month, week } = getMonthWeek();
  if (isPerfectWeekPlan(task)) {
    const weekPeriod = getWeekPeriod();
    const key = 'week_' + weekPeriod;
    completes.unshift({
      key,
      taskId: task.id,
      title: `${month} 月完美第 ${week} 周`,
      createdAt: Date.now(),
      isDone: true,
      doneAt: Date.now(),
      award: { score: 10 },
      meetBy: MeetBy.custom,
    });
    task.prizes = task.prizes || [];
    task.prizes.push(key);
  }

  // 检查月计划
  if (isPerfectMonthPlan(task)) {
    const now = dayjs();
    const key = `month_${now.format('YY')}_${month}`;
    completes.unshift({
      key,
      taskId: task.id,
      title: `完美 ${month} 月`,
      createdAt: Date.now(),
      isDone: true,
      doneAt: Date.now(),
      award: { score: 10 },
      meetBy: MeetBy.custom,
    });
    task.prizes = task.prizes || [];
    task.prizes.push(key);
  }

  return completes;
}

// 添加一个打卡记录
export async function addDaka(task: Task, daka: Partial<Daka>) {
  const rawDakaCount = task.dakas;
  task.dakas++;
  const dakaItem = {
    createdAt: Date.now(),
    score: daka.score || 1,
  } as Daka;
  if (daka.desc) {
    dakaItem.desc = trim(daka.desc);
  }

  // 如果上次打卡时间在 30 小时之内，则连续打卡天数加1
  if (task.lastDakaAt && isInHours(task.lastDakaAt, dakaItem.createdAt, 30)) {
    task.keeps++;
    task.maxKeeps = Math.max(task.maxKeeps || 0, task.keeps || 0);
  }

  // 周期记录
  let weekday: number = dayjs().day();
  weekday = weekday === 0 ? 6 : weekday - 1;
  task.weekdays[weekday] = 1;

  task.lastDakaAt = dakaItem.createdAt;
  let completes = autoCompleteMilestones(task);
  let gains = dakaItem.score;
  for (let x of completes) {
    task.scores += x.award?.score || 0;
    gains += x.award?.score || 0;
  }
  task.scores += gains;

  // 更新任务数据
  db.atom.modify((state) => {
    state.items = state.items.map((x) => (x.id === task.id ? task : x));
    state.score += gains;
    return state;
  });
  await db.save();
  return completes;
}

async function createDakaLog(task: Task, dakaItem: Daka, rawDakaCount: number) {
  try {
    // 新建打卡仓库
    const dakaEntry = {
      repo: 'TinkGu/private-cloud',
      path: `goose/dakas/task_${task.id}`,
    };
    if (rawDakaCount <= 0) {
      await createGitFile({
        ...dakaEntry,
        content: [dakaItem],
      });
    } else {
      const dakaDb = new JsonDb({
        ...dakaEntry,
        atom: Atom.of({
          items: [] as Daka[],
        }),
      });
      await dakaDb.pull();
      dakaDb.atom.modify((x) => ({ ...x, items: [...x.items, dakaItem] }));
      await dakaDb.save();
    }
  } catch (err) {
    toast.error(err);
  }
}

export function openDakaSheet(task: Task) {
  Portal.show({
    content: (onDestory) => (
      <div className={cx('modal')}>
        <div className={cx('mask')} onClick={onDestory}></div>
        <DakaSheet onDestory={onDestory} task={task} />
      </div>
    ),
  });
}
