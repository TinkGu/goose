import { memo } from 'react';
import cx from 'classnames';
import './styles.scss';

export const WarningIcon = memo(({ className }: { className?: string }) => {
  return <div className={cx('mg-icon-warning', className)}></div>;
});
