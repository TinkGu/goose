import { memo, useMemo } from 'react';
import cx from 'classnames';
import './styles.scss';

const prefix = 'mg-circle-loading';

export interface CircleLoadingProps {
  className?: string;
  /** 圆环颜色，如 #fff */
  color?: string;
  /** 图标尺寸 */
  size?: 'small' | 'default' | 'large';
  /** 图标颜色主题，默认 dark */
  theme?: 'light' | 'dark';
}

/** loading 圆圈 */
export const CircleLoading = memo(({ className, size, theme, color }: CircleLoadingProps) => {
  const circleSyl = useMemo(() => ({ stroke: color || '' }), [color]);
  return (
    <div className={cx(prefix, size, theme, className)}>
      <svg className={cx(`${prefix}-svg`)} viewBox="0 0 32 32">
        <circle className={`${prefix}-c`} cx="16" cy="16" r="15" style={circleSyl} />
      </svg>
    </div>
  );
});
