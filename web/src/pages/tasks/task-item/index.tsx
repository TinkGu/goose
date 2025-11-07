import { useDebounceFn } from '@tinks/xeno/react';
import { Checkbox } from 'app/components/checkbox';
import { WeekCheckbox } from 'app/components/week-checkbox';
import classnames from 'classnames/bind';
import { openDakaSheet } from '../daka-sheet';
import { findNearbyPlan } from '../plans';
import { checkDone, Task, TaskStatus } from '../state';
import { showStats } from '../stats';
import styles from './styles.module.scss';

const cx = classnames.bind(styles);

export function TaskItem({ task }: { task: Task }) {
  const nearbyPlans = findNearbyPlan(task);
  const isDone = checkDone(task);
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
        {!!nearbyPlans.length && <span className={cx('g-tag', 'grass', 'active')}>即将突破</span>}
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
