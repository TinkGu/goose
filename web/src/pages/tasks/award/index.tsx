import { useEffect, useRef, useState } from 'react';
import { getDataset, trim } from '@tinks/xeno';
import { useDebounceFn } from '@tinks/xeno/react';
import { Modal, Portal, toast } from 'app/components';
import { IconCoin, IconCross } from 'app/components/icons';
import { WarningIcon } from 'app/components/modal/warning-icon';
import classnames from 'classnames/bind';
import dayjs from 'dayjs';
import { useAtomView } from 'use-atom-view';
import { db } from '../state';
import { awardDb } from './state';
import styles from './styles.module.scss';

const cx = classnames.bind(styles);

export function TicketEditor({ onDestroy }: { onDestroy: () => void }) {
  const ticketNameRef = useRef<HTMLInputElement>(null);
  const ticketScoreRef = useRef<HTMLInputElement>(null);
  const handleOk = useDebounceFn(async () => {
    const ticketName = trim(ticketNameRef.current?.value || '');
    const ticketScore = Number(ticketScoreRef.current?.value || 0);
    if (!ticketName || ticketScore < 1) {
      toast.info('请输入正确的兑换物名称和积分');
      return;
    }
    const item = {
      name: ticketName,
      score: ticketScore,
    };
    awardDb.atom.modify((state) => {
      return {
        ...state,
        tickets: [item, ...state.tickets],
      };
    });
    await awardDb.save();
    toast.info('添加成功');
    onDestroy();
  });

  return (
    <div className={cx('ticket-editor')}>
      <div className={cx('close-btn')} onClick={onDestroy}>
        <IconCross className={cx('close-icon')} />
      </div>
      <div className={cx('section')}>
        <div className={cx('section-title')}>兑换物</div>
        <input ref={ticketNameRef} className={cx('g-input-style', 'transparent')} type="text" placeholder="输入兑换物名称，例如：咖啡券" />
      </div>
      <div className={cx('section')}>
        <div className={cx('section-title')}>积分</div>
        <input
          ref={ticketScoreRef}
          inputMode="numeric"
          min={1}
          className={cx('g-input-style', 'transparent')}
          type="number"
          placeholder="例如：10"
        />
      </div>
      <div className={cx('g-btn', 'save-btn')} onClick={handleOk}>
        添加
      </div>
    </div>
  );
}

export function AwardList({ onDestroy }: { onDestroy: () => void }) {
  const { score: totalScore } = useAtomView(db.atom);
  const { tickets = [], history = [] } = useAtomView(awardDb.atom);
  const [activeTab, setActiveTab] = useState<'tickets' | 'history'>('tickets');
  const [isEditing, setIsEditing] = useState(false);

  const toggleEditMode = () => {
    setIsEditing((x) => !x);
  };

  const handleClick = useDebounceFn(async (e) => {
    const index = getDataset(e).index;
    const ticket = tickets[index];
    if (!ticket) return;

    if (isEditing) {
      const isOk = await Modal.confirm({
        icon: <WarningIcon />,
        title: '确认删除兑换物',
        content: `确认删除「${ticket.name}」吗？删除后将无法恢复`,
      });
      if (!isOk) return;
      awardDb.atom.modify((state) => {
        return {
          ...state,
          tickets: state.tickets.filter((_, i) => i !== index),
        };
      });
      await awardDb.save();
      return;
    }

    const totalScore = db.atom.get().score;
    if (totalScore < ticket.score) {
      toast.info('积分不足');
      return;
    }
    const isOk = await Modal.confirm({
      title: '兑换确认',
      content: `确认兑换「${ticket.name}」吗？兑换后积分将扣除 ${ticket.score} 分`,
    });
    if (!isOk) return;
    const historyItem = {
      name: ticket.name,
      score: ticket.score,
      createdAt: Date.now(),
    };
    awardDb.atom.modify((state) => {
      return {
        ...state,
        history: [historyItem, ...state.history],
        tickets: state.tickets.filter((_, i) => i !== index),
      };
    });
    await awardDb.save();
    db.atom.modify((state) => {
      return {
        ...state,
        score: state.score - ticket.score,
      };
    });
    await db.save();
    toast.info('兑换成功');
  });

  const handleClearHistory = useDebounceFn(async () => {
    if (history.length === 0) {
      toast.info('没有兑换记录');
      return;
    }
    const isOk = await Modal.confirm({
      title: '清空兑换记录',
      content: '清空兑换记录后，将无法恢复',
    });
    if (!isOk) return;
    awardDb.atom.modify((state) => {
      return { ...state, history: [] };
    });
    await awardDb.save();
    toast.info('清空成功');
  });

  const handleAddTicket = useDebounceFn(() => {
    Modal.show({
      maskClosable: false,
      position: 'bottom',
      content: (onDestroy) => <TicketEditor onDestroy={onDestroy} />,
    });
  });

  useEffect(() => {
    async function init() {
      await awardDb.pull();
    }
    init();
  }, []);

  return (
    <div className={cx('award-page')}>
      <div className={cx('close-btn')} onClick={onDestroy}>
        <IconCross className={cx('close-icon')} />
      </div>
      {activeTab === 'tickets' && (
        <div className={cx('g-btn', 'add-btn')} onClick={handleAddTicket}>
          + 添加兑换物
        </div>
      )}
      <div className={cx('tabs')}>
        <div className={cx('score-tip')}>
          <IconCoin className={cx('gold-icon')} /> {totalScore}
        </div>
        <div className={cx('tab-item', { active: activeTab === 'tickets' })} onClick={() => setActiveTab('tickets')}>
          积分兑换
        </div>
        <div className={cx('tab-item', { active: activeTab === 'history' })} onClick={() => setActiveTab('history')}>
          兑换记录
        </div>
      </div>
      {activeTab === 'history' && (
        <div className={cx('action-tip')} onClick={handleClearHistory}>
          清空兑换记录
        </div>
      )}
      {activeTab === 'tickets' && (
        <div className={cx('action-tip')} onClick={toggleEditMode}>
          {isEditing ? '退出删除模式' : '进入删除模式'}
        </div>
      )}
      <div className={cx('award-list')}>
        {activeTab === 'tickets' &&
          tickets.map((ticket, index) => (
            <div className={cx('ticket-item')} data-index={index} data-index-t="number" onClick={handleClick}>
              <div className={cx('award-name')}>{ticket.name}</div>
              <div className={cx('award-score')}>
                <span className={cx('score-value')}>{ticket.score}</span> <IconCoin className={cx('score-icon')} />
              </div>
            </div>
          ))}
        {activeTab === 'history' &&
          history.map((item, index) => (
            <div className={cx('history-item')} data-index={index} data-index-t="number">
              <div className={cx('left')}>
                <div className={cx('award-score')}>
                  <IconCoin className={cx('score-icon')} /> {item.score}
                </div>
                <div className={cx('award-name')}>{item.name}</div>
              </div>
              <div className={cx('award-time')}>兑换于{dayjs(item.createdAt).format('YY-MM-DD')}</div>
            </div>
          ))}
      </div>
    </div>
  );
}

export function showAwardPage() {
  return Portal.show({
    content: (onDestory) => {
      return <AwardList onDestroy={onDestory} />;
    },
  });
}
