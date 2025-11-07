import { useDebounceFn } from '@tinks/xeno/react';
import { Checkbox } from 'app/components/checkbox';
import { WeekCheckbox } from 'app/components/week-checkbox';
import classnames from 'classnames/bind';
import { openDakaSheet } from '../daka-sheet';
import { checkDone, Task } from '../state';
import styles from './styles.module.scss';

const cx = classnames.bind(styles);

export function TaskItem({ task }: { task: Task }) {
  const isDone = checkDone(task);
  const handleClick = useDebounceFn(() => {
    openDakaSheet(task);
  });

  return (
    <div className={cx('task-item')} onClick={handleClick}>
      <div className={cx('days')}>
        <span className={cx('g-tag', 'yellow', 'active')}>{task.dakas} 天</span>
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
