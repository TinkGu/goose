import { page } from './page-loader';

export const RouteEditorAbility = page({
  path: '',
  name: '打卡',
  component: () => import('../pages/tasks'),
});

export const RouteSettings = page({
  path: 'settings',
  name: '设置',
  component: () => import('../pages/settings'),
});

export const routeConfigs = [RouteEditorAbility, RouteSettings];
