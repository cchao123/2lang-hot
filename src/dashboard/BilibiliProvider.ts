import { BaseHotProvider, HotItem } from '../base/BaseProvider';
import { getBilibiliHot } from '../api';
import type { BilibiliVideoItem } from '../types/bilibili';

export class BilibiliHotProvider extends BaseHotProvider {
  protected async fetchItems(): Promise<HotItem[]> {
    const res = await getBilibiliHot();

    const list = res.data ?? [];

    return list.slice(0, 50).map((it: BilibiliVideoItem, idx: number) => {
      const title = it?.title ?? `未命名 #${idx + 1}`;
      const up = it?.owner?.name ?? it?.tname ?? '未知分区';
      const bvid = it.bvid;
      const aid = it?.aid;
      const jumpUrl = bvid
        ? `https://www.bilibili.com/video/${bvid}`
        : aid
          ? `https://www.bilibili.com/video/av${aid}`
          : undefined;
      return new HotItem(`${idx + 1}. ${title}`, up, jumpUrl, 'bilibili');
    });
  }
}

