import { useEffect, useState } from 'react';
import { delay } from '@tinks/xeno';
import { useDebounceFn } from '@tinks/xeno/react';
import { Popup } from 'app/components';
import classnames from 'classnames/bind';
import GoldCoin from '../../../../public/coin_gold.png';
import PrizeSideImg from '../../../../public/prize_side.png';
import { MilestoneItem } from '../milestone';
import { plans } from '../plans';
import { MeetBy, Milestone } from '../state';
import styles from './styles.module.scss';

const cx = classnames.bind(styles);

export function Prize({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cx('prize', className)}>
      <div>
        <img className={cx('side-img')} src={PrizeSideImg} alt="" />
      </div>
      <div className={cx('main')}>{children}</div>
      <div>
        <img className={cx('side-img', 'reverse')} src={PrizeSideImg} alt="" />
      </div>
    </div>
  );
}

export function WeekPrize({ keyCode }: { keyCode: string }) {
  const [_, year, month, week] = keyCode.split('_');
  return (
    <Prize className={cx('week-prize')}>
      <div className={cx('week-number')}>{week}</div>
      <div className={cx('title')}>完美周</div>
      <div className={cx('content')}>
        -{year}年{month}月-
      </div>
    </Prize>
  );
}

export function MonthPrize({ keyCode }: { keyCode: string }) {
  const [_, year, month] = keyCode.split('_');
  return (
    <Prize className={cx('month-prize')}>
      <div className={cx('month-number')}>{month}</div>
      <div className={cx('title')}>完美月</div>
      <div className={cx('content')}>-20{year}年-</div>
    </Prize>
  );
}

export function PlanPrize({ keyCode }: { keyCode: string }) {
  const plan = plans.find((x) => x.key === keyCode);
  if (!plan) return null;
  let title = '';
  if (plan.meetBy == MeetBy.dakaTimes) {
    title = '打卡突破';
  }
  if (plan.meetBy == MeetBy.keepTimes) {
    title = '连续打卡';
  }
  return (
    <Prize className={cx('plan-prize', { sm: plan.meetValue! > 1000 })}>
      <div className={cx('plan-number')}>{plan.meetValue}</div>
      <div className={cx('title')}>{title}</div>
    </Prize>
  );
}

function PrizeModal({ milestone, onDestroy }: { milestone: Milestone; onDestroy: () => void }) {
  const [isEntering, setIsEntering] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const handleExit = useDebounceFn(async () => {
    setIsExiting(true);
    await delay(300);
    onDestroy();
  });

  useEffect(() => {
    setTimeout(() => {
      setIsEntering(true);
    }, 300);
  }, []);
  return (
    <div className={cx('prize-modal', { exiting: isExiting, entering: isEntering })}>
      <div className={cx('glow')}></div>
      <div className={cx('prize')}>
        <UniPrize keycode={milestone.key!} />
      </div>
      <div className={cx('modal-title')}>🏆 好耶ヾ(^▽^)ノ</div>
      <div className={cx('modal-desc')}>
        「 <span className={cx('prize-name')}>{milestone.title}</span>」达成！
      </div>
      {!!milestone.award?.score && (
        <div className={cx('award-btn')} onClick={handleExit}>
          领取
          <img className={cx('coin-icon')} src={GoldCoin} alt="" />
          {milestone.award?.score}
        </div>
      )}
    </div>
  );
}

// 根据 keycode，自动判断是什么类型的
function UniPrize({ keycode }: { keycode: string }) {
  const [prefix] = keycode.split('_');
  if (prefix === 'week') {
    return <WeekPrize keyCode={keycode} />;
  }
  if (prefix === 'month') {
    return <MonthPrize keyCode={keycode} />;
  }
  return <PlanPrize keyCode={keycode} />;
}

function MilestoneModal({ milestone, onDestroy }: { milestone: Milestone; onDestroy: () => void }) {
  const [isExiting, setIsExiting] = useState(false);

  const handleExit = useDebounceFn(async () => {
    setIsExiting(true);
    await delay(300);
    onDestroy();
  });

  return (
    <div className={cx('milestone-modal', { exiting: isExiting })}>
      <div className={cx('modal-title')}>🏁 达成里程碑！</div>
      <div className={cx('modal-main')}>
        <MilestoneItem className={cx('milestone-item')} value={milestone} readonly={true} />
      </div>
      <div className={cx('next-btn')} onClick={handleExit}>
        继续 →
      </div>
    </div>
  );
}

/** 展示各种成就 */
function innerGainPrizes(milestones: Milestone[], onEnd: () => void) {
  if (!milestones?.length) return onEnd();
  const ms = milestones.shift();
  if (!ms) return onEnd();

  Popup.show({
    position: 'center',
    mask: true,
    maskClosable: false,
    content: (onDestroy) => {
      const onNext = () => {
        onDestroy();
        innerGainPrizes(milestones, onEnd);
      };
      if (ms.key) {
        return <PrizeModal milestone={ms} onDestroy={onNext} />;
      }
      return <MilestoneModal milestone={ms} onDestroy={onNext} />;
    },
  });
}

export function gainPrizes(milestones: Milestone[]) {
  return new Promise<void>((resolve) => {
    innerGainPrizes(milestones, resolve);
  });
}
