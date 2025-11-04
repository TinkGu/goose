import { useRef } from 'react';
import { getDataset } from '@tinks/xeno';
import { useDebounceFn } from '@tinks/xeno/react';
import classnames from 'classnames/bind';
import { Modal } from '../modal';
import { toast } from '../toast';
import styles from './styles.module.scss';

const cx = classnames.bind(styles);
const emojis = [
  {
    name: '常用',
    icons: ['🎣', '🎯', '🤺', '🎮', '🎲', '💡', '📌', '🤔', '🧠', '🎨', '🎬', '🎧', '🎵', '🎶', '🎹', '🎼', '🚀', '🤖', '📈', '💻'],
  },
  {
    name: '运动1',
    icons: ['⚽️', '🏀', '🏈', '⚾️', '🥎', '🎾', '🏐', '🏉', '🏓', '🏸', '🎳', '🏒', '🏑', '🥍', '🏏'],
  },
  {
    name: '运动2',
    icons: ['🏃‍➡️', '🚶‍➡️', '🏋️‍♂️', '🤸‍♂️', '🤾‍♂️', '🧘‍♂️', '🤽‍♂️', '🏊‍♂️', '🏄‍♂️', '🚣‍♂️', '🏂', '⛷️', '🎿', '⛸️', '🥌', '🥊', '🥋', '🤺', '🚴'],
  },
];

export function EmojiPicker({ onDestory, onChange }: { onDestory: () => void; onChange: (emoji: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const handleClickEmoji = useDebounceFn((e) => {
    const emoji = getDataset(e).emoji;
    onChange(emoji);
    onDestory();
  });

  const handleSaveEmoji = useDebounceFn(() => {
    const emoji = inputRef.current?.value;
    if (emoji) {
      onChange(emoji);
      onDestory();
    } else {
      toast.info('请输入表情');
    }
  });

  return (
    <div className={cx('emoji-picker')}>
      <div className={cx('header')}>
        <div className={cx('emoji-input')}>
          <input ref={inputRef} type="text" placeholder="自行输入你想要的表情" className={cx('g-input-style', 'transparent')} />
        </div>
        <div className={cx('g-btn', 'save-btn')} onClick={handleSaveEmoji}>
          选好了
        </div>
      </div>
      <div className={cx('emoji-picker-inner')}>
        {emojis.map((x) => (
          <div className={cx('section')} key={x.name}>
            <div className={cx('section-title')}>{x.name}</div>
            <div className={cx('icons')}>
              {x.icons.map((y) => (
                <div className={cx('emoji-picker-item')} data-emoji={y} key={y} onClick={handleClickEmoji}>
                  {y}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function openEmojiPicker({ onChange }: { onChange: (emoji: string) => void }) {
  Modal.show({
    position: 'bottom',
    maskClosable: true,
    content: (onDestory) => <EmojiPicker onDestory={onDestory} onChange={onChange} />,
  });
}
