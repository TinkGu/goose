import { useMemo } from 'react';
import { useDebounceFn } from '@tinks/xeno/react';
import { Portal } from 'app/components';
import { IconCoin, IconMoreCircle } from 'app/components/icons';
import classnames from 'classnames/bind';
import { findNearbyPlan } from '../plans';
import { openTaskPrizes, UniPrize } from '../prize';
import { Task } from '../state';
import { openTaskActions } from '../task-editor';
import styles from './styles.module.scss';

const cx = classnames.bind(styles);

function TaskStats({ task, onDestory }: { task: Task; onDestory: () => void }) {
  const weekDakaDays = task.weekdays.filter((x) => x === 1).length;
  const diffDakaDays = (task.weekMinTimes || 7) - weekDakaDays;
  const nearbyPlans = findNearbyPlan(task);
  const prizes = useMemo(() => [...(task.prizes || [])].reverse().slice(0, 6), [task.prizes]);

  const handleOpenTaskActions = useDebounceFn(() => {
    openTaskActions({ task, onContinue: onDestory, ignoreStats: true });
  });

  const handleExpandPrizes = useDebounceFn(() => {
    if (!task.prizes?.length) {
      return;
    }
    openTaskPrizes(task);
  });

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
        <div className={cx('prize-list')} onClick={handleExpandPrizes}>
          <div className={cx('prizes')}>
            {prizes.map((x) => (
              <div className={cx('prize')} key={x}>
                <div className={cx('prize-box')}>
                  <UniPrize keycode={x} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className={cx('content')}>
        <div className={cx('task-stats-row')}>
          <div className={cx('stats-item')}>
            <div className={cx('item-value')}>{task.dakas}</div>
            <div className={cx('item-label')}>总打卡次数</div>
          </div>
          <div className={cx('stats-item')}>
            <div className={cx('item-value')}>{task.maxKeeps || 0}</div>
            <div className={cx('item-label')}>最高连续</div>
          </div>
          <div className={cx('stats-item')}>
            <div className={cx('item-value')}>{task.keeps}</div>
            <div className={cx('item-label')}>连续打卡</div>
          </div>
        </div>
        <div className={cx('task-stats-bullets')}>
          <div className={cx('score-bullet')}>
            <IconCoin className={cx('score-icon')} />
            累计获得积分 <span className={cx('strong-num')}>{task.scores}</span>
          </div>
          {diffDakaDays > 0 && (
            <div className={cx('bullet')}>
              <span className={cx('strong-num')}>{diffDakaDays}</span> 天后即可达成<span className={cx('underline')}>完美周</span>
            </div>
          )}
          {nearbyPlans.map((x) => (
            <div className={cx('bullet')} key={x.key}>
              <span className={cx('strong-num')}>{x.delta}</span> 天后即可达成<span className={cx('underline')}>{x.title}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function showStats(task: Task) {
  Portal.show({
    content: (onDestory) => (
      <div className={cx('modal')}>
        <div className={cx('mask')} onClick={onDestory}></div>
        <TaskStats onDestory={onDestory} task={task} />
      </div>
    ),
  });
}
