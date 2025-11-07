import { useEffect, useRef, useState } from 'react';
import { trim } from '@tinks/xeno';
import { useDebounceFn } from '@tinks/xeno/react';
import { Modal, toast } from 'app/components';
import { Checkbox } from 'app/components/checkbox';
import { DateInput } from 'app/components/date-input';
import { FlatSelector } from 'app/components/flat-selector';
import { IconCross, IconTime, IconTrash } from 'app/components/icons';
import { checkDateCode, dateCodeToDate } from 'app/utils/time';
import classnames from 'classnames/bind';
import dayjs from 'dayjs';
import GoldImg from '../../../../public/coin_gold.png';
import { MeetBy, Milestone } from '../state';
import styles from './styles.module.scss';

const cx = classnames.bind(styles);

function getTimeIconColor(x: Milestone, isDelay: boolean) {
  if (isDelay) {
    return '#990000';
  }
  if (x.isDone) {
    return '#999';
  }
  return '#009929';
}

function getMeetText(x: Milestone) {
  if (x.meetBy === MeetBy.custom) {
    return '';
  }
  if (x.meetBy === MeetBy.dakaTimes) {
    return '需要打卡 ' + x.meetValue + ' 次';
  }
  return '需要持续打卡 ' + x.meetValue + ' 天';
}

export function MilestoneItem({
  value,
  className,
  onClick,
  readonly = false,
}: {
  value: Milestone;
  className?: string;
  onClick?: (value: Milestone) => void;
  readonly?: boolean;
}) {
  const isDelay = !!value.expectedAt ? Date.now() > value.expectedAt && !value.isDone : false;
  const meetText = getMeetText(value);

  const handleClick = useDebounceFn(() => {
    if (readonly) {
      return;
    }
    onClick?.(value);
  });
  return (
    <div className={cx('milestone-item', { done: value.isDone }, className)} onClick={handleClick}>
      <div className={cx('content')}>
        <div className={cx('milestone-item-left')}>
          <Checkbox className={cx('checkbox')} checked={!!value?.isDone} />
          <div className={cx('title')}>
            {value.title}
            {!!value.expectedAt && (
              <span className={cx('time', { delay: isDelay, done: value.isDone })}>
                <IconTime className={cx('time-icon')} color={getTimeIconColor(value, isDelay)} />
                {dayjs(value.expectedAt).format('MM/DD')}
              </span>
            )}
          </div>
        </div>
        {!!value.award?.score && (
          <div className={cx('milestone-item-right')}>
            <div className={cx('score')}>
              <div className={cx('score-value')}>{value.award.score}</div>
              <img className={cx('score-icon')} src={GoldImg} alt="score" />
            </div>
          </div>
        )}
      </div>
      <div className={cx('footer')}>
        {value.meetBy !== MeetBy.custom && !!value.meetValue && !!meetText && <div className={cx('bullet')}>🎯 {meetText}</div>}
        {!!value.award?.title && <div className={cx('bullet')}>🎁 {value.award?.title}</div>}
        {!!value.doneAt && (
          <div className={cx('bullet')}>
            🎉 完成于 <span className={cx('done-time-value')}>{dayjs(value.doneAt).format('MM/DD')}</span>，用了{' '}
            <span className={cx('done-time-value')}>{dayjs(value.doneAt).diff(dayjs(value.createdAt), 'day')}</span> 天
          </div>
        )}
      </div>
    </div>
  );
}

const MeetByOptions = [
  {
    label: '自定义',
    value: MeetBy.custom,
  },
  {
    label: '打卡次数',
    value: MeetBy.dakaTimes,
  },
  {
    label: '持续打卡天数',
    value: MeetBy.keepTimes,
  },
];

function MilestoneEditor({
  value,
  onChange,
  onDestory,
  onDelete,
}: {
  value?: Milestone;
  onChange: (value: Milestone) => void;
  onDestory: () => void;
  onDelete?: () => void;
}) {
  const titleRef = useRef<HTMLInputElement>(null);
  const awardTitleRef = useRef<HTMLInputElement>(null);
  const awardScoreRef = useRef<HTMLInputElement>(null);
  const meetValueRef = useRef<HTMLInputElement>(null);
  const [meetBy, setMeetBy] = useState<MeetBy>(value?.meetBy || MeetBy.custom);
  const [dateCode, setDateCode] = useState<string>();

  const handleSave = useDebounceFn(() => {
    try {
      const title = trim(titleRef.current?.value || '');
      const meetValue = meetValueRef.current?.value ? parseInt(trim(meetValueRef.current?.value)) : 0;
      const awardTitle = awardTitleRef.current?.value ? trim(awardTitleRef.current?.value) : '';
      const awardScore = awardScoreRef.current?.value ? parseInt(trim(awardScoreRef.current?.value)) : 0;
      let expectedAt = 0;
      if (!title) {
        throw new Error('请输入里程碑标题');
      }
      if (dateCode) {
        const timeErrMsg = checkDateCode(dateCode);
        if (timeErrMsg) {
          throw new Error('截止时间: ' + timeErrMsg);
        }
        expectedAt = dateCodeToDate(dateCode);
      }

      onChange({
        ...(value || {}),
        title,
        expectedAt,
        meetBy,
        meetValue,
        award: {
          ...(value?.award || {}),
          title: awardTitle,
          score: awardScore,
        },
        createdAt: value?.createdAt || Date.now(),
      } as Milestone);
      onDestory();
    } catch (err) {
      toast.error(err);
      console.error(err);
    }
  }, 1000);

  const handleDelete = useDebounceFn(() => {
    onDelete?.();
    onDestory();
  });

  useEffect(() => {
    if (!value) return;
    if (value.title) {
      titleRef.current!.value = value.title;
    }
    if (value.award?.title) {
      awardTitleRef.current!.value = value.award.title;
    }
    if (value.award?.score) {
      awardScoreRef.current!.value = value.award.score.toString();
    }
    if (value.meetBy !== meetBy) {
      setMeetBy(value.meetBy);
    }
    if (value.meetValue) {
      meetValueRef.current!.value = value.meetValue.toString();
    }
    if (value?.expectedAt) {
      const dateCode = dayjs(value.expectedAt).format('YYMMDD');
      setDateCode(dateCode);
    }
  }, [value]);

  return (
    <div className={cx('milestone-editor')}>
      <div className={cx('header')}>
        <div>
          {!!value?.createdAt && (
            <div className={cx('del')} onClick={handleDelete}>
              <IconTrash className={cx('trash-icon')} color="#999" />
              删除里程碑
            </div>
          )}
        </div>
        <div onClick={onDestory}>
          <IconCross className={cx('close-icon')} color="#333" />
        </div>
      </div>
      <input className={cx('g-input-style', 'transparent', 'title-input')} type="text" placeholder="里程碑标题" ref={titleRef} />
      <div className={cx('section')}>
        <div className={cx('label')}>截止时间</div>
        <DateInput value={dateCode} maxLength={6} onChange={setDateCode} />
      </div>
      <div className={cx('section')}>
        <div className={cx('label')}>完成方式</div>
        <FlatSelector value={meetBy} options={MeetByOptions} onChange={setMeetBy} />
      </div>
      <div className={cx('section', { hidden: meetBy === MeetBy.custom })}>
        <div className={cx('label')}>满足值</div>
        <input ref={meetValueRef} type="number" className={cx('g-input-style', 'transparent', 'section-input')} placeholder="0" min={0} />
      </div>
      {meetBy !== MeetBy.custom && <div className={cx('tip')}>达到满足值后，里程碑自动完成</div>}
      <div className={cx('section')}>
        <div className={cx('label')}>奖励</div>
        <input
          ref={awardTitleRef}
          className={cx('g-input-style', 'transparent', 'section-input')}
          type="text"
          placeholder="写下自己的心愿"
        />
      </div>
      <div className={cx('section')}>
        <div className={cx('label')}>奖励分数</div>
        <input
          ref={awardScoreRef}
          defaultValue={1}
          type="number"
          className={cx('g-input-style', 'transparent', 'section-input')}
          placeholder="0"
          min={0}
        />
      </div>
      <div className={cx('save-btn', 'g-btn')} onClick={handleSave}>
        保存
      </div>
    </div>
  );
}

export function openMilestoneEditor({
  milestone,
  onSave,
  onDelete,
}: {
  milestone?: Milestone;
  onSave?: (value: Milestone) => void;
  onDelete?: () => void;
}) {
  const onChange = (value: Milestone) => {
    onSave?.(value);
  };

  Modal.show({
    position: 'bottom',
    content: (onDestory) => {
      return <MilestoneEditor value={milestone} onDestory={onDestory} onChange={onChange} onDelete={onDelete} />;
    },
  });
}
