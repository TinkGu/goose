import classnames from 'classnames/bind';
import { IconCorrect } from '../icons';
import styles from './styles.module.scss';

const cx = classnames.bind(styles);

export function Checkbox({ checked, className }: { checked: boolean; className?: string }) {
  return (
    <div className={cx('checkbox', { active: checked }, className)}>
      <IconCorrect className={cx('icon')} color="#009929" />
    </div>
  );
}
