import { useEffect, useState } from 'react';
import { useDebounceFn } from '@tinks/xeno/react';
import { IconAdd, IconAll, IconLoop } from 'app/components/icons';
import classnames from 'classnames/bind';
import { useAtomView } from 'use-atom-view';
import SiteIcon from '../../../public/icons-48.png';
import { showSettings } from '../settings';
import { db, Task } from './state';
import { TaskItem } from './task-item';
import styles from './styles.module.scss';

const cx = classnames.bind(styles);

export default function PageMarkList() {
  const { items, score } = useAtomView(db.atom);
  const [records, setRecords] = useState<Task[]>([]);
  const [todoCount, setTodoCount] = useState();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const list = db.atom.get().items;
    let next = list;
    setRecords(next);
  }, [items]);

  useEffect(() => {
    async function init() {
      await db.pull();
    }
    init();
  }, []);

  const handleAddTask = useDebounceFn(() => {
    // TODO:
  });

  return (
    <div className={cx('page-editor')}>
      <div className={cx('mask', { active: isLoading })}></div>
      <div className={cx('page-header')}>
        <div className={cx('page-actions')}>
          <div className={cx('site-names')}>
            <div className={cx('logo')}>
              <img src={SiteIcon} />
            </div>
            <div className={cx('scores')}>{score || ''}</div>
          </div>
          <div className={cx('rights')}>
            <div className={cx('btn', 'icon')} onClick={handleAddTask}>
              <IconAdd />
            </div>
          </div>
        </div>
      </div>

      {!!records.length && (
        <div className={cx('results-box')}>
          {records.map((x) => (
            <div className={cx('task-item')} key={x.id}>
              <TaskItem task={x} />
            </div>
          ))}
        </div>
      )}
      <div className={cx('results-box')}>
        <div className={cx('task-item')}>
          <TaskItem task={{} as any} />
        </div>
        <div className={cx('task-item')}>
          <TaskItem task={{} as any} />
        </div>
        <div className={cx('task-item')}>
          <TaskItem task={{} as any} />
        </div>
        <div className={cx('task-item')}>
          <TaskItem task={{} as any} />
        </div>
      </div>

      {/* 底部悬浮导航栏 */}
      <div className={cx('bottom-nav')}>
        <div className={cx('nav-item')}>
          <div className={cx('nav-icon')}>
            <IconLoop />
            {!!todoCount && <div className={cx('nav-badge')}>{todoCount}</div>}
          </div>
        </div>
        <div className={cx('nav-item')} onClick={showSettings}>
          <div className={cx('nav-icon')}>
            <IconAll />
          </div>
        </div>
      </div>
    </div>
  );
}
