import { BaseHotProvider, HotItem } from '../base/BaseProvider';
import { TOUTIAO_HOT_API } from '../shared/constant';
import { httpGet } from '../shared/http';

export class ToutiaoHotProvider extends BaseHotProvider {
  protected async fetchItems(): Promise<HotItem[]> {
    // 今日头条热榜官方接口：https://www.toutiao.com/hot-event/hot-board/?origin=toutiao_pc
    const root: any = await httpGet(TOUTIAO_HOT_API, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Referer: 'https://www.toutiao.com/'
      }
    });

    const list: any[] = root?.data ?? [];

    return list.slice(0, 50).map((it: any, idx: number) => {
      const title = it?.Title ?? it?.title ?? it?.QueryWord ?? `未命名 #${idx + 1}`;
      const hot = it?.HotValue;
      const label =
        it?.LabelDesc ??
        (it?.Label === 'interpretation'
          ? '解读'
          : it?.Label === 'new'
            ? '新'
            : it?.Label === 'refuteRumors'
              ? '辟谣'
              : it?.Label === 'forum'
                ? '热议'
                : '');
      const desc = hot ? (label ? `${label} · ${hot}` : String(hot)) : label;
      const jumpUrl = it?.Url ?? it?.url;
      return new HotItem(`${idx + 1}. ${title}`, desc, jumpUrl, 'toutiao');
    });
  }
}

