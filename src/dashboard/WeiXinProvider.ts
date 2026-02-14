import { BaseHotProvider, HotItem } from '../base/BaseProvider';
import { httpGet } from '../shared/http';
import { WEIXIN_HOT_API } from '../shared/constant';

export class WeixinHotProvider extends BaseHotProvider {
	protected async fetchItems(): Promise<HotItem[]> {
		const data: any = await httpGet(WEIXIN_HOT_API, {
			headers: {
				'User-Agent': 'Mozilla/5.0'
			}
		});

		// 尽量兼容不同字段结构
		const books: any[] =
			data?.books ??
			data?.bookList ??
			data?.data?.books ??
			data?.data?.bookList ??
			[];

		return books.slice(0, 50).map((b: any, idx: number) => {
			const title =
				b?.book?.title ??
				b?.title ??
				b?.bookInfo?.title ??
				`未命名 #${idx + 1}`;
			const author = b?.book?.author ?? b?.author ?? b?.bookInfo?.author;
			const bookId = b?.book?.bookId ?? b?.bookId ?? b?.bookInfo?.bookId;
			const jumpUrl = bookId ? `https://weread.qq.com/web/book/${bookId}` : undefined;
			return new HotItem(`${idx + 1}. ${title}`, author, jumpUrl, 'weixin');
		});
	}
}

