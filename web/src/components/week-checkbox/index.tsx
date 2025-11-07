import classnames from 'classnames/bind';
import { Checkbox } from '../checkbox';
import styles from './styles.module.scss';

const cx = classnames.bind(styles);
const weeks = ['一', '二', '三', '四', '五', '六', '日'];

export function WeekCheckbox({ value, color }: { value: number[]; color?: string }) {
  return (
    <div className={cx('week-checkbox')}>
      {weeks.map((_, index) => (
        <div className={cx('week-item')} key={index}>
          <Checkbox className={cx('checkbox')} checked={!!value?.[index]} showIcon={false} color={color} />
        </div>
      ))}
    </div>
  );
}
