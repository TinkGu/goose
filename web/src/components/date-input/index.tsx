import { useState, useRef, useEffect } from 'react';
import classnames from 'classnames/bind';
import styles from './styles.module.scss';

const cx = classnames.bind(styles);

interface DateInputProps {
  value?: string;
  onChange?: (value: string) => void;
  maxLength?: number;
}

export function DateInput({ value = '', onChange, maxLength = 6 }: DateInputProps) {
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    // 只允许数字
    const numericValue = inputValue.replace(/\D/g, '');
    // 限制长度
    const truncatedValue = numericValue.slice(0, maxLength);
    onChange?.(truncatedValue);
  };

  // 点击容器时聚焦到隐藏的 input
  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  // 处理 input 的聚焦和失焦
  const handleFocus = () => {
    setFocusedIndex(value.length);
  };

  const handleBlur = () => {
    setFocusedIndex(-1);
  };

  // 渲染每个数字框
  const renderBoxes = () => {
    const boxes: React.ReactNode[] = [];
    for (let i = 0; i < maxLength; i++) {
      const digit = value[i] || '';
      const isFocused = i === value.length && focusedIndex !== -1;

      boxes.push(
        <div
          key={i}
          className={cx('code-box', {
            'has-value': digit !== '',
            focused: isFocused,
          })}
        >
          {digit}
          {isFocused && <div className={cx('cursor')} />}
        </div>,
      );
      if (i < maxLength - 1 && (i + 1) % 2 === 0) {
        boxes.push(
          <div key={`separator-${i}`} className={cx('separator')}>
            /
          </div>,
        );
      }
    }
    return boxes;
  };

  return (
    <div className={cx('date-input')}>
      <div className={cx('code-container')} onClick={handleContainerClick}>
        {renderBoxes()}
      </div>
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={value}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={cx('hidden-input')}
        maxLength={maxLength}
      />
    </div>
  );
}
