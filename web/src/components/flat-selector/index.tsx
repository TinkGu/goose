import classnames from 'classnames/bind';
import styles from './styles.module.scss';

const cx = classnames.bind(styles);

export interface FlatSelectorOption {
  label: string;
  value: any;
}

export function FlatSelector({ value, onChange, options }: { value: any; onChange: (value: any) => void; options: FlatSelectorOption[] }) {
  return (
    <div className={cx('flat-selector')}>
      {options.map((option) => (
        <div className={cx('item', { active: value === option.value })} key={option.value} onClick={() => onChange(option.value)}>
          {option.label}
        </div>
      ))}
    </div>
  );
}
