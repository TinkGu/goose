import { useDebounceFn } from '@tinks/xeno/react';
import { IconCorrect } from 'app/components/icons';
import classnames from 'classnames/bind';
import { Task } from '../state';
import styles from './styles.module.scss';

const cx = classnames.bind(styles);

function ActionSheet({}) {
  return (
    <div className={cx('action-sheet')}>
      <div className={cx()}></div>
    </div>
  );
}

const getNumCls = (x: number) => {
  if (x < 10) {
    return 'lg';
  }
  if (x >= 100) {
    return 'sm';
  }
  return '';
};

export function TaskItem({}: { task: Task }) {
  const handleClick = useDebounceFn(() => {
    // TODO:
  });

  return (
    <div className={cx('task-item')} onClick={handleClick}>
      <div className={cx('days')}>
        <span className={cx('g-tag', 'yellow', 'active')}>117天</span>
      </div>
      <div className={cx('todo-mark', 'active')}>
        <IconCorrect className={cx('icon')} color="#009929" />
      </div>
      <div className={cx('left')}>
        <div className={cx('icon')}>🤔</div>
      </div>
      <div className={cx('main')}>
        <div className={cx('content')}>
          <div className={cx('title')}>打卡名</div>
          <div className={cx('stats')}></div>
        </div>
        <div className={cx('progress')}></div>
      </div>
    </div>
  );
}
