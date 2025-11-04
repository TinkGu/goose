import { memo, ReactNode, useCallback, useState } from 'react';
import { useDebounceImmediateFn } from '@tinks/xeno/react';
import cx from 'classnames';
import { CircleLoading } from '../loading';
import { BasePopup, PopupProps } from '../popup';
import { PortalLike, withPortal } from '../portal';
import { WarningIcon } from './warning-icon';
import './styles.scss';

const prefix = 'mg-modal';

function getBtnText(type?: string, ok?: string, cancel?: string) {
  let okText;
  let cancelText;
  if (type === 'info') {
    okText = '我知道了';
  }
  if (type === 'confirm') {
    okText = '确定';
    cancelText = '取消';
  }
  okText = ok || okText;
  cancelText = cancel || cancelText;
  return [okText, cancelText];
}

export interface ModalProps extends PopupProps {
  /**
   * 弹窗外层 class，相当于覆盖 `mg-modal`
   */
  wrapperClassName?: string;
  /**
   * 弹窗的 class，相当于覆盖 `mg-modal-inner`
   */
  className?: string;
  /**
   * 弹窗类型，决定了底部默认展示什么按钮
   *
   * - `默认`：空，什么也不展示
   * - `info`：只展示确认按钮
   * - `confirm`：展示确认和取消按钮
   */
  type?: 'info' | 'confirm';
  /**
   * 弹窗标题
   */
  title?: ReactNode;
  /** 顶部 Icon */
  icon?: ReactNode;
  /**
   * 顶部展示 warning Icon，若同时设置 icon 属性，warning 将不生效
   * @default false
   */
  warning?: boolean;
  /**
   * 确认按钮文案
   */
  okText?: string;
  /**
   * 确定按钮事件。若返回 promise 时 resolve 为正常关闭, reject 为不关闭
   */
  onOk?: () => any;
  /**
   * 确认按钮是否禁用
   * @default false
   */
  disabled?: boolean;
  /**
   * 取消按钮文案
   */
  cancelText?: string;
  /**
   * 关闭按钮事件
   */
  onCancel?: () => void;
  /**
   * 确认按钮的防抖延迟时间，默认 1000
   * @default 1000
   */
  debounceWait?: number;
  /**
   * 确认按钮的防抖设置, 是否需要首次事件立即执行
   * @default true
   */
  debounceImmediate?: boolean;
}

export const BaseModal = memo(function BaseModalInner({
  className,
  type,
  title,
  children,
  okText: propOkText,
  cancelText: propCancelText,
  onOk,
  onCancel,
  onDestroy,
  warning,
  position = 'center',
  wrapperClassName,
  icon,
  disabled,
  debounceWait,
  debounceImmediate = true,
  ...popupProps
}: ModalProps) {
  const [okBtnLoading, setOkBtnLoading] = useState(false);
  const [okText, cancelText] = getBtnText(type, propOkText, propCancelText);
  const hasFooter = !!(okText || cancelText);

  const handleOk = useDebounceImmediateFn(
    async () => {
      try {
        if (okBtnLoading || disabled) return;
        const res = onOk?.();
        if (res?.then && typeof res.then === 'function') {
          setOkBtnLoading(true);
          await res;
          setOkBtnLoading(false);
        }
        onDestroy?.();
      } catch (e) {
        console.error(e);
        setOkBtnLoading(false);
      }
    },
    debounceWait,
    debounceImmediate,
  );

  const handleCancel = useCallback(() => {
    onCancel?.();
    onDestroy?.();
  }, [onCancel, onDestroy]);

  return (
    <BasePopup
      wrapperClassName={cx(prefix, { [`${prefix}-halfscreen`]: position === 'bottom' }, wrapperClassName)}
      position={position}
      onDestroy={onDestroy}
      {...popupProps}
    >
      <div className={cx(`${prefix}-wrapper`)}>
        <div className={cx(`${prefix}-body`)}>
          {!!warning && !icon && <WarningIcon />}
          {!!icon && icon}
          {!!title && <div className={`${prefix}-title`}>{title}</div>}
          {!!children && (
            <div className={cx(`${prefix}-inner`, className)}>{typeof children === 'function' ? children(onDestroy!) : children}</div>
          )}
        </div>
        {hasFooter && (
          <div className={cx(`${prefix}-bottom`, { [`${prefix}-btns-both`]: !!(okText && cancelText) })}>
            {!!cancelText && (
              <div className={cx(`${prefix}-btn`, `${prefix}-btn-cancel`)} onClick={handleCancel}>
                {cancelText}
              </div>
            )}
            {!!okText && (
              <div
                className={cx(`${prefix}-btn`, `${prefix}-btn-ok`, {
                  [`${prefix}-btn-disabled`]: okBtnLoading || disabled,
                })}
                onClick={handleOk}
              >
                {okBtnLoading ? <CircleLoading className={`${prefix}-btn-loading`} /> : null}
                {okText}
              </div>
            )}
          </div>
        )}
      </div>
    </BasePopup>
  );
});

interface ModalLike extends PortalLike<ModalProps> {
  confirm: (props: ModalProps) => Promise<boolean>;
}

/**
 * 对话框
 */
export const Modal = withPortal<ModalProps>(BaseModal) as ModalLike;

/** 返回一个异步的确认弹窗 */
Modal.confirm = (props: ModalProps) =>
  new Promise((resolve) => {
    Modal.show({
      type: 'confirm',
      ...props,
      onOk: () => resolve(true),
      onCancel: () => resolve(false),
    });
  });
