import { JsonDb } from 'app/utils/json-service';
import { Atom } from 'use-atom-view';

// 积分兑换对应的物品
export interface AwardTicket {
  score: number; // 需要多少积分才能兑换
  name: string; // 物品名称
}

// 积分兑换记录
export interface AwardHistory {
  score: number; // 兑换的积分
  name: string; // 物品名称
  createdAt: number; // 兑换时间
}

export const awardDb = new JsonDb({
  repo: 'TinkGu/private-cloud',
  path: 'goose/awards',
  atom: Atom.of({
    tickets: [] as AwardTicket[],
    history: [] as AwardHistory[],
  }),
});
