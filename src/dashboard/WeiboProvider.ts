import { BaseHotProvider, HotItem } from '../base/BaseProvider';
import { httpGet } from '../shared/http';
import { WEIBO_HOT_API } from '../shared/constant';

export class WeiboHotProvider extends BaseHotProvider {
  protected async fetchItems(): Promise<HotItem[]> {
    // 使用微博侧边栏热搜接口
    const data: any = await httpGet(WEIBO_HOT_API, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        Referer: 'https://weibo.com/',
        Accept: 'application/json,text/plain,*/*'
      }
    });

    // 常见结构：data.realtime 为数组
    const list: any[] =
      data?.data?.realtime ??
      data?.data?.band_list ??
      data?.data ??
      [];

    return list.slice(0, 50).map((it: any, idx: number) => {
      const word = it?.word ?? it?.note ?? it?.title;
      const title = word ?? `未命名 #${idx + 1}`;
      const hot =
        it?.raw_hot ??
        it?.num ??
        it?.hot ??
        it?.heat;
      const q = encodeURIComponent(word ?? '');
      const jumpUrl =
        it?.url ??
        (it?.scheme ?? `https://s.weibo.com/weibo?q=${q}&t=31&band_rank=${idx + 1}`);
      return new HotItem(`${idx + 1}. ${title}`, hot ? String(hot) : undefined, jumpUrl, 'weibo');
    });
  }
}

