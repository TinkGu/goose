import { useDebounceFn } from '@tinks/xeno/react';
import { Modal } from 'app/components';
import classnames from 'classnames/bind';
import dayjs from 'dayjs';
import { useAtomView } from 'use-atom-view';
import { db, Task, TaskStatus } from '../state';
import { showStats } from '../stats';
import styles from './styles.module.scss';

const cx = classnames.bind(styles);

function PausedTaskItem({ task }: { task: Task }) {
  const diffDays = dayjs().diff(dayjs(task.lastDakaAt), 'day');
  const handleClick = useDebounceFn(() => {
    showStats(task);
  });

  return (
    <div className={cx('paused-task-item')} onClick={handleClick}>
      <div className={cx('main')}>
        <div className={cx('icon')}>{task.icon}</div>
        <div className={cx('name')}>{task.title}</div>
      </div>
      <div className={cx('footer')}>
        <div className={cx('days')}>🎯 打卡 {task.dakas} 天</div>
        <div className={cx('days')}>⏳ 已暂停 {diffDays} 天</div>
      </div>
    </div>
  );
}

function PausedTasksPanel({ onDestory }: { onDestory: () => void }) {
  const { items } = useAtomView(db.atom);
  const pausedTasks = items.filter((item) => item.status === TaskStatus.paused);
  return (
    <div className={cx('paused-tasks-panel')}>
      {!pausedTasks?.length && <div className={cx('empty')}>暂无暂停的任务</div>}
      {pausedTasks?.map((task) => (
        <PausedTaskItem key={task.id} task={task} />
      ))}
    </div>
  );
}

export function showPausedTasks() {
  return Modal.show({
    title: '暂停的任务',
    maskClosable: true,
    position: 'bottom',
    content: (onDestory) => {
      return <PausedTasksPanel onDestory={onDestory} />;
    },
  });
}
