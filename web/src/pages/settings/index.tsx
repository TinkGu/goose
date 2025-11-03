import { delay } from '@tinks/xeno';
import { useDebounceFn } from '@tinks/xeno/react';
import { Modal, Portal, toast } from 'app/components';
import { getGithubToken, setGithubToken } from 'app/utils/app-services';
import classnames from 'classnames/bind';
import styles from './styles.module.scss';

const cx = classnames.bind(styles);

function SettingItem({ label, value, onClick, tip }: { label: string; value: string; onClick: () => void; tip?: string }) {
  return (
    <div className={cx('setting-item')} onClick={onClick}>
      <div className={cx('setting-item-main')}>
        <div className={cx('label')}>{label}</div>
        <div className={cx('value')}>{value}</div>
      </div>
      {!!tip && <div className={cx('tip')}>{tip}</div>}
    </div>
  );
}

function SettingsPannel({ onDestory }: { onDestory: () => void }) {
  const handleRefresh = useDebounceFn(() => {
    window.location.reload();
  });

  const handleSetGithubToken = useDebounceFn(() => {
    async function onOk() {
      const dom = document.getElementById('goose__token-input') as HTMLInputElement;
      const token = dom?.value || '';
      if (!token) {
        toast.info('请输入 Github Token');
        return;
      }
      setGithubToken(token);
      toast.info('保存成功，即将自动刷新');
      await delay(1000);
      handleRefresh();
    }

    Modal.show({
      maskClosable: true,
      title: 'Github Token',
      type: 'custom',
      content: () => (
        <div className={cx('token-modal')}>
          <input id="goose__token-input" className={cx('g-input-style', 'token-input')} type="text" placeholder="请输入 Github Token" />
          <div className={cx('ok-btn')} onClick={onOk}>
            保存
          </div>
        </div>
      ),
    });
  });

  return (
    <div className={cx('settings')}>
      <div className={cx('header')}>
        <div className={cx('actions')}>
          <div className={cx('btn', 'close')} onClick={onDestory}>
            关闭
          </div>
        </div>
      </div>
      <div className={cx('content')}>
        <div className={cx('section')}>应用</div>
        <SettingItem label="刷新" value="" onClick={handleRefresh} />
        <SettingItem
          label="Github Token"
          value={getGithubToken() ? '****' + getGithubToken().slice(-4) : '空'}
          onClick={handleSetGithubToken}
        />
      </div>
    </div>
  );
}

export function showSettings() {
  return Portal.show({
    content: (onDestory) => {
      return <SettingsPannel onDestory={onDestory} />;
    },
  });
}
