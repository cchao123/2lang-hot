import { BaseHotProvider, HotItem } from '../base/BaseProvider';
import { get36krHot } from '../api';


export class Kr36HotProvider extends BaseHotProvider {
	protected async fetchItems(): Promise<HotItem[]> {
		const root: any = await get36krHot();

		const list: any[] = root?.data ?? [];

		return list.slice(0, 50).map((it: any, idx: number) => {
			const tm = it?.templateMaterial ?? {};
			const title =
				tm.widgetTitle ??
				it.title ??
				`未命名 #${idx + 1}`;
			const author = tm.authorName ?? it.author ?? it.source;
			const stat =
				tm.statFormat ??
				(tm.statRead ? `阅读 ${tm.statRead}` : undefined);

			const itemId = tm.itemId ?? it.itemId;
			// 36氪文章常见链接格式：https://www.36kr.com/p/{itemId}
			const jumpUrl =
				it.url ??
				it.link ??
				(itemId ? `https://www.36kr.com/p/${itemId}` : undefined);

			return new HotItem(`${idx + 1}. ${title}`, author ?? stat, jumpUrl, '36kr');
		});
	}
}

