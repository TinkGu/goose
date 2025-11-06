import { useDebounceFn } from '@tinks/xeno/react';
import classnames from 'classnames/bind';
import { IconCorrect } from '../icons';
import styles from './styles.module.scss';

const cx = classnames.bind(styles);

const clrMap = {
  green: '#009929',
  blue: '#004799',
  red: '#990000',
  black: '#fff',
};

export function Checkbox({
  checked,
  color = 'green',
  className,
  showIcon = true,
  onChange,
  readonly = false,
}: {
  checked: boolean;
  className?: string;
  showIcon?: boolean;
  onChange?: (x: boolean) => void;
  readonly?: boolean;
  color?: string;
}) {
  const clr = clrMap[color || 'green'];
  const handleClick = useDebounceFn(() => {
    if (readonly) {
      return;
    }
    onChange?.(!checked);
  });

  return (
    <div className={cx('checkbox', { active: checked }, className, color)} onClick={handleClick}>
      {showIcon && <IconCorrect className={cx('icon')} color={clr} />}
    </div>
  );
}
