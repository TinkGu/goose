import { useDebounceFn } from '@tinks/xeno/react';
import { Checkbox } from 'app/components/checkbox';
import { WeekCheckbox } from 'app/components/week-checkbox';
import classnames from 'classnames/bind';
import dayjs from 'dayjs';
import { openDakaSheet } from '../daka-sheet';
import { findNearbyPlan } from '../plans';
import { checkDone, Task, TaskStatus } from '../state';
import { showStats } from '../stats';
import styles from './styles.module.scss';

const cx = classnames.bind(styles);

function getLastDakaDiffTime(task: Task) {
  if (!task.lastDakaAt) {
    return 0;
  }
  const now = dayjs();
  const lastDakaAt = dayjs(task.lastDakaAt);
  return now.diff(lastDakaAt, 'day');
}

export function TaskItem({ task }: { task: Task }) {
  const nearbyPlans = findNearbyPlan(task);
  const isDone = checkDone(task);
  const diffTime = getLastDakaDiffTime(task);
  const diffTimeText = diffTime > 10 ? `荒废 ${diffTime} 天` : '';

  const handleClick = useDebounceFn(() => {
    if (isDone || task.status === TaskStatus.paused) {
      showStats(task);
      return;
    }
    openDakaSheet(task);
  });

  return (
    <div className={cx('task-item')} onClick={handleClick}>
      <div className={cx('days')}>
        <span className={cx('g-tag', 'yellow', 'active')}>{task.dakas} 天</span>
        {!!nearbyPlans.length && !diffTimeText && <span className={cx('g-tag', 'grass', 'active')}>即将突破</span>}
        {!!diffTimeText && <span className={cx('g-tag', 'red', 'active')}>{diffTimeText}</span>}
      </div>
      <Checkbox checked={isDone} className={cx('todo-mark')} />
      <div className={cx('left')}>
        <div className={cx('icon')}>{task.icon}</div>
      </div>
      <div className={cx('main')}>
        <div className={cx('content')}>
          <div className={cx('title')}>{task.title}</div>
          <div className={cx('stats')}>
            <WeekCheckbox value={task.weekdays} />
          </div>
        </div>
        <div className={cx('progress')}></div>
      </div>
    </div>
  );
}
