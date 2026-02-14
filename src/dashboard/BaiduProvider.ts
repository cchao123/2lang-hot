import { BaseHotProvider, HotItem } from '../base/BaseProvider';
import { getBaiduHot } from '../api';

export class BaiduHotProvider extends BaseHotProvider {
	protected async fetchItems(): Promise<HotItem[]> {
		const res = await getBaiduHot();

		const list = res.data ?? [];

		return list.slice(0, 50).map((it: any, idx: number) => {
			const title = it?.word ?? `未命名 #${idx + 1}`;
			const tag = it?.newHotName ?? it?.labelTagName;
			const jumpUrl = it?.url ?? (it?.word ? `https://www.baidu.com/s?wd=${encodeURIComponent(it.word)}` : undefined);
			return new HotItem(`${idx + 1}. ${title}`, tag, jumpUrl, 'baidu');
		});
	}
}

