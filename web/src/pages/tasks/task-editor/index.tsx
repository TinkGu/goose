import { useEffect, useRef, useState } from 'react';
import { trim } from '@tinks/xeno';
import { useDebounceFn } from '@tinks/xeno/react';
import { Modal, Portal, toast } from 'app/components';
import { Checkbox } from 'app/components/checkbox';
import { openEmojiPicker } from 'app/components/emoji-picker';
import { IconCross, IconFlag, IconLoop } from 'app/components/icons';
import classnames from 'classnames/bind';
import { MilestoneItem, openMilestoneEditor } from '../milestone';
import { db, Milestone, Task, TaskStatus } from '../state';
import styles from './styles.module.scss';

const cx = classnames.bind(styles);

export function addTask() {
  const onSave = async (value: Task) => {
    var finalTask = {
      ...value,
      id: db.uuid(),
      createdAt: Date.now(),
      status: TaskStatus.doing,
      keeps: 0,
      scores: 0,
      dakas: 0,
    } as Task;
    db.atom.modify((x) => ({
      ...x,
      items: [finalTask, ...x.items],
    }));
    await db.save();
  };

  Modal.show({
    wrapperClassName: cx('task-editor-modal'),
    position: 'bottom',
    content: (onDestory) => (
      <div className={cx('modal')}>
        <TaskEditor onDestory={onDestory} onSave={onSave} />
      </div>
    ),
  });
}

export function editTask(rawTask: Task) {
  const onSave = async (value: Task) => {
    db.atom.modify((x) => ({
      ...x,
      items: x.items.map((x) => (x.id === value.id ? value : x)),
    }));
    await db.save();
  };

  Modal.show({
    wrapperClassName: cx('task-editor-modal'),
    position: 'bottom',
    content: (onDestory) => (
      <div className={cx('modal')}>
        <TaskEditor value={rawTask} onDestory={onDestory} onSave={onSave} />
      </div>
    ),
  });
}

function MoreMenu({ task, onDestory, onHide }: { task: Task; onDestory: () => void; onHide: () => void }) {
  // 删除任务
  const handleDelete = useDebounceFn(async () => {
    try {
      const isOk = await Modal.confirm({
        type: 'confirm',
        content: '确定删除吗',
      });
      if (!isOk) return;
      await db.atom.modify((x) => ({
        ...x,
        items: x.items.filter((x) => x.id !== task.id),
      }));
      await db.save();
      onDestory();
    } catch (err) {
      console.error(err);
      toast.error(err);
    }
  });

  const handleEdit = useDebounceFn(() => {
    editTask(task);
    onDestory();
  });

  const handlePause = useDebounceFn(async () => {
    try {
      task.status = task.status === TaskStatus.paused ? TaskStatus.doing : TaskStatus.paused;
      await db.atom.modify((x) => ({
        ...x,
        items: x.items.map((x) => (x.id === task.id ? task : x)),
      }));
      await db.save();
      onDestory();
      toast.info(task.status === TaskStatus.paused ? '已恢复' : '已暂停');
    } catch (err) {
      toast.error(err);
      console.error(err);
    }
  });

  return (
    <div className={cx('more-menu-modal')}>
      <div className={cx('mask')} onClick={onHide}></div>
      <div className={cx('more-menu')}>
        <div className={cx('menu-item')} onClick={handleEdit}>
          编辑
        </div>
        <div className={cx('menu-item')} onClick={handlePause}>
          {task.status === TaskStatus.paused ? '恢复' : '暂停'}
        </div>
        <div className={cx('menu-item')} onClick={handleDelete}>
          删除
        </div>
      </div>
    </div>
  );
}

export function openTaskActions({ task, onContinue }: { task: Task; onContinue: () => void }) {
  Portal.show({
    content: (onClose) => {
      const onDestory = () => {
        onClose();
        onContinue();
      };
      return <MoreMenu task={task} onDestory={onDestory} onHide={onClose} />;
    },
  });
}

function checkTask(value: Partial<Task>) {
  if (!value.title) {
    throw new Error('请输入标题');
  }
  if (!value.icon) {
    throw new Error('请选择图标');
  }
  return {
    ...(value as Task),
    desc: value.desc || '',
    icon: value.icon || '',
    avgTime: value.avgTime || 0,
  } as Task;
}

function TaskEditor({ value, onSave, onDestory }: { value?: Task; onSave: (x: Task) => void; onDestory: () => void }) {
  const nameRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);
  const weekMinTimesRef = useRef<HTMLInputElement>(null);
  const [isCycle, setIsCycle] = useState<boolean>(false);
  const [icon, setIcon] = useState<string>('');
  const [milestones, setMilestones] = useState<Milestone[]>([]);

  const handleSave = useDebounceFn(async () => {
    try {
      const title = trim(nameRef.current?.value || '');
      const desc = trim(descRef.current?.value || '');
      const weekMinTimes = weekMinTimesRef.current?.value ? parseInt(weekMinTimesRef.current?.value) : 0;

      const task = checkTask({
        ...(value || {}),
        title,
        desc,
        icon,
        milestones,
        isCycle,
        weekMinTimes,
      });
      await onSave(task);
      onDestory();
    } catch (err) {
      console.error(err);
      toast.error(err);
    }
  });

  const adjustHeight = () => {
    if (descRef.current) {
      descRef.current.style.height = 'auto'; // 先重置高度，以便减少内容时能正确缩小
      descRef.current.style.height = `${descRef.current.scrollHeight}px`; // 然后设置高度为滚动高度
    }
  };

  const handleEmojiInput = useDebounceFn(() => {
    openEmojiPicker({
      onChange: (emoji: string) => {
        setIcon(emoji);
      },
    });
  });

  const handleAddMilestone = useDebounceFn(() => {
    openMilestoneEditor({
      onSave: (ms: Milestone) => {
        setMilestones([...milestones, ms]);
      },
    });
  });

  const handleEditMilestone = useDebounceFn((ms: Milestone) => {
    var index = milestones.findIndex((x) => x === ms);
    openMilestoneEditor({
      milestone: ms,
      onSave: (ms: Milestone) => {
        milestones[index] = ms;
        setMilestones([...milestones]);
      },
      onDelete: () => {
        setMilestones((list) => list.filter((x) => x !== ms));
      },
    });
  });

  useEffect(() => {
    if (!value) return;
    if (value.title) {
      nameRef.current!.value = value.title;
    }
    if (value.desc) {
      descRef.current!.value = value.desc;
      adjustHeight();
    }
    if (value.icon) {
      setIcon(value.icon);
    }
    if (value.milestones) {
      setMilestones(value.milestones);
    }
    if (value.isCycle) {
      setIsCycle(value.isCycle);
    }
    if (value.weekMinTimes) {
      weekMinTimesRef.current!.value = value.weekMinTimes.toString();
    }
  }, [value]);

  return (
    <div className={cx('task-editor')}>
      <div className={cx('emoji-input', { empty: !icon })} onClick={handleEmojiInput}>
        {icon}
      </div>
      <div className={cx('editor-actions')}>
        <div></div>
        <div className={cx('btn')} onClick={onDestory}>
          <IconCross className={cx('close-icon')} />
        </div>
      </div>
      <div className={cx('title-input')}>
        <input ref={nameRef} className={cx('g-input-style', 'transparent')} placeholder="标题" />
      </div>
      <textarea
        ref={descRef}
        className={cx('g-input-style', 'transparent', 'desc-input')}
        placeholder="描述"
        onInput={adjustHeight}
        rows={1}
      />
      <div className={cx('section')}>
        <div className={cx('section-title')}>
          <div className={cx('label')}>
            <IconLoop className={cx('label-icon')} color="#666" />
            周期挑战
          </div>
        </div>
        <div className={cx('cycle-editor')}>
          <div className={cx('input-row', 'cycle-checkbox')}>
            <Checkbox className={cx('checkbox')} checked={isCycle} color="black" onChange={setIsCycle} />
            自动生成月度挑战
          </div>
          <div className={cx('input-row')}>
            每周仅需完成
            <input ref={weekMinTimesRef} type="number" className={cx('g-input-style', 'transparent', 'weekmin-input')} placeholder="输入" />
            次
          </div>
        </div>
      </div>
      <div className={cx('section', 'milestone-area')}>
        <div className={cx('section-title')}>
          <div className={cx('label')}>
            <IconFlag className={cx('label-icon')} color="#666" />
            里程碑
          </div>
          <div className={cx('add-btn')} onClick={handleAddMilestone}>
            + 添加里程碑
          </div>
        </div>
        {milestones.map((ms) => (
          <MilestoneItem key={ms.createdAt} value={ms} onClick={handleEditMilestone} />
        ))}
      </div>
      <div className={cx('g-btn', 'save-btn')} onClick={handleSave}>
        保存
      </div>
    </div>
  );
}
