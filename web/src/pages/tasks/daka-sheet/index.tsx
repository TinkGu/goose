import { useState } from 'react';
import { trim } from '@tinks/xeno';
import { useDebounceFn } from '@tinks/xeno/react';
import { Modal, Portal, toast } from 'app/components';
import { IconMoreCircle } from 'app/components/icons';
import { createGitFile, JsonDb } from 'app/utils/json-service';
import { isInHours } from 'app/utils/time';
import classnames from 'classnames/bind';
import { Atom } from 'use-atom-view';
import GoldCoin from '../../../../public/coin_gold.png';
import { Daka, db, Task } from '../state';
import { openTaskActions } from '../task-editor';
import styles from './styles.module.scss';

const cx = classnames.bind(styles);
const RATING_VALUES = [1, 2, 3];

function Rating({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <div className={cx('rating')}>
      {RATING_VALUES.map((x) => (
        <span key={x} className={cx('rating-value', { active: x <= value })}>
          <img src={GoldCoin} onClick={() => onChange(x)} />
        </span>
      ))}
    </div>
  );
}

function DakaSheet({ task, onDestory }: { task: Task; onDestory: () => void }) {
  const [rating, setRating] = useState(1);
  const handleSave = useDebounceFn(async () => {
    try {
      await addDaka(task, { score: rating });
      onDestory();
    } catch (err) {
      toast.error(err);
    }
  });

  const handleOpenTaskActions = useDebounceFn(() => {
    openTaskActions({ task, onContinue: onDestory });
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
      </div>
      <div className={cx('content')}>
        <div className={cx('section')}>
          <div className={cx('section-title')}>今天感觉怎么样</div>
          <Rating value={rating} onChange={setRating} />
        </div>
        <div className={cx('g-btn', 'save-btn')} onClick={handleSave}>
          提交 →
        </div>
      </div>
    </div>
  );
}

// 添加一个打卡记录
export async function addDaka(task: Task, daka: Partial<Daka>) {
  var rawDakaCount = task.dakas;
  task.dakas++;
  var dakaItem = {
    createdAt: Date.now(),
    score: daka.score || 1,
  } as Daka;
  if (daka.desc) {
    dakaItem.desc = trim(daka.desc);
  }

  // 如果上次打卡时间在 30 小时之内，则连续打卡天数加1
  if (task.lastDakaAt && isInHours(task.lastDakaAt, dakaItem.createdAt, 30)) {
    task.keeps++;
  }
  task.lastDakaAt = dakaItem.createdAt;
  task.scores += dakaItem.score;

  // 更新任务数据
  db.atom.modify((state) => {
    state.items = state.items.map((x) => (x.id === task.id ? task : x));
    state.score += dakaItem.score;
    return state;
  });
  await db.save();

  try {
    // 新建打卡仓库
    var dakaEntry = {
      repo: 'TinkGu/private-cloud',
      path: `goose/dakas/task_${task.id}`,
    };
    if (rawDakaCount <= 0) {
      await createGitFile({
        ...dakaEntry,
        content: [dakaItem],
      });
    } else {
      var dakaDb = new JsonDb({
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
