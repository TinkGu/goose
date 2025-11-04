import React from 'react';
import cx from 'classnames';
import { withPortal } from '../portal';
import './styles.css';

const prefix = 'mg-popup';
const noop = () => null;
const empty = {};

export interface PopupProps {
  /** 关闭浮层回调 */
  onDestroy?: () => void;
  /**
   * 浮层包裹的主体内容，仅在以 JSX 形式调用 Popup 时有效
   * @type `React.ReactNode | ((onDestroy: () => void) => React.ReactNode)`
   */
  children?: React.ReactNode | ((onDestroy: () => void) => React.ReactNode);
  /**
   * children 别名
   */
  content?: React.ReactNode | ((onDestroy: () => void) => React.ReactNode);
  /** 最外层样式，相当于覆盖 :global mg-popup */
  wrapperClassName?: string;
  /** 浮层主体样式，相当于覆盖 :global mg-popup-inner */
  className?: string;
  /**
   * jsx 形式调用时，控制显隐
   * @default true
   */
  visible?: boolean;
  /**
   * 是否展示背景蒙层
   * @default true
   */
  mask?: boolean;
  /**
   * 点击蒙层是否可以关闭
   * @default false
   */
  maskClosable?: boolean;
  style?: React.CSSProperties | undefined;
  /**
   * 是否点击穿透
   * @default false
   */
  nonePointerEvents?: boolean;
  /**
   * 弹窗展示位置
   * @default 'center'
   */
  position?: 'center' | 'bottom' | 'top';
}

/** 通用 Popup */
export function BasePopup({
  visible = true,
  onDestroy,
  wrapperClassName = '',
  className = '',
  mask = true,
  maskClosable = false,
  children = null,
  nonePointerEvents,
  style = empty,
  position = 'top',
}: PopupProps) {
  if (!visible) {
    return null;
  }
  return (
    <div
      className={cx(prefix, wrapperClassName, {
        [`${prefix}-pass`]: !!nonePointerEvents,
        [`${prefix}-center`]: position === 'center',
        [`${prefix}-bottom`]: position === 'bottom',
      })}
    >
      {!!mask && <div className={cx(`${prefix}-mask`)} onClick={maskClosable ? onDestroy : noop}></div>}
      <div className={cx(`${prefix}-inner`, className)} style={style}>
        {typeof children === 'function' ? children(onDestroy!) : children}
      </div>
    </div>
  );
}

export const Popup = withPortal<PopupProps>(BasePopup);
