// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "2lang-hot" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('2lang-hot.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from 2lang-hot!');
	});

	const weixinProvider = new WeixinHotProvider();
	const bilibiliProvider = new BilibiliHotProvider();
	const douyinProvider = new DouyinHotProvider();
	const kuaishouProvider = new KuaishouHotProvider();
	const kr36Provider = new Kr36HotProvider();
	const smzdmProvider = new SmzdmHotProvider();
	const xhsProvider = new XhsHotProvider();
	const weiboProvider = new WeiboHotProvider();

	context.subscriptions.push(
		vscode.window.registerTreeDataProvider('2lang-hot.weixinView', weixinProvider),
		vscode.window.registerTreeDataProvider('2lang-hot.bilibiliView', bilibiliProvider),
		vscode.window.registerTreeDataProvider('2lang-hot.douyinView', douyinProvider),
		vscode.window.registerTreeDataProvider('2lang-hot.kuaishouView', kuaishouProvider),
		vscode.window.registerTreeDataProvider('2lang-hot.36krView', kr36Provider),
		vscode.window.registerTreeDataProvider('2lang-hot.smzdmView', smzdmProvider),
		vscode.window.registerTreeDataProvider('2lang-hot.xhsView', xhsProvider),
		vscode.window.registerTreeDataProvider('2lang-hot.weiboView', weiboProvider),
		vscode.commands.registerCommand('2lang-hot.refreshWeixin', () => weixinProvider.refresh()),
		vscode.commands.registerCommand('2lang-hot.refreshBilibili', () => bilibiliProvider.refresh()),
		vscode.commands.registerCommand('2lang-hot.refreshDouyin', () => douyinProvider.refresh()),
		vscode.commands.registerCommand('2lang-hot.refreshKuaishou', () => kuaishouProvider.refresh()),
		vscode.commands.registerCommand('2lang-hot.refresh36kr', () => kr36Provider.refresh()),
		vscode.commands.registerCommand('2lang-hot.refreshSmzdm', () => smzdmProvider.refresh()),
		vscode.commands.registerCommand('2lang-hot.refreshXhs', () => xhsProvider.refresh()),
		vscode.commands.registerCommand('2lang-hot.refreshWeibo', () => weiboProvider.refresh()),
		vscode.commands.registerCommand(
			'2lang-hot.openInWebview',
			async (payload: { title?: string; url: string }) => {
				const title = payload?.title?.trim() || '2lang-hot 预览';
				const url = payload?.url;
				if (!url) return;

				const panel = vscode.window.createWebviewPanel(
					'2langHotPreview',
					title,
					{ viewColumn: vscode.ViewColumn.Beside, preserveFocus: true },
					{
						enableScripts: true,
						retainContextWhenHidden: true
					}
				);

				panel.webview.html = getPreviewHtml(panel.webview, title, url);
			}
		),
		vscode.commands.registerCommand('2lang-hot.openExternal', async (url: string) => {
			try {
				await vscode.env.openExternal(vscode.Uri.parse(url));
			} catch (e) {
				vscode.window.showErrorMessage(`打开链接失败：${String(e)}`);
			}
		})
	);

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}

class HotItem extends vscode.TreeItem {
	constructor(
		public readonly label: string,
		public readonly description: string | undefined,
		public readonly url: string | undefined
	) {
		super(label, vscode.TreeItemCollapsibleState.None);
		this.tooltip = url ? `${label}\n${url}` : label;
		this.description = description;
		if (url) {
			this.command = {
				command: '2lang-hot.openInWebview',
				title: '在右侧预览',
				arguments: [{ title: label, url }]
			};
		}
	}
}

abstract class BaseHotProvider implements vscode.TreeDataProvider<HotItem> {
	private readonly _onDidChangeTreeData = new vscode.EventEmitter<HotItem | undefined | void>();
	readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

	private loading = false;
	private cache: HotItem[] | null = null;
	private lastError: string | null = null;

	refresh(): void {
		this.cache = null;
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(element: HotItem): vscode.TreeItem {
		return element;
	}

	async getChildren(): Promise<HotItem[]> {
		if (this.loading) {
			return [new HotItem('加载中...', undefined, undefined)];
		}

		if (this.cache) {
			return this.cache;
		}

		this.loading = true;
		this.lastError = null;
		this._onDidChangeTreeData.fire();

		try {
			const items = await this.fetchItems();
			this.cache = items.length ? items : [new HotItem('暂无数据', undefined, undefined)];
			return this.cache;
		} catch (e) {
			this.lastError = String(e);
			return [new HotItem(`加载失败：${this.lastError}`, '点击刷新重试', undefined)];
		} finally {
			this.loading = false;
			this._onDidChangeTreeData.fire();
		}
	}

	protected abstract fetchItems(): Promise<HotItem[]>;
}

class WeixinHotProvider extends BaseHotProvider {
	protected async fetchItems(): Promise<HotItem[]> {
		const url = 'https://weread.qq.com/web/bookListInCategory/rising?rank=1';
		const res = await fetch(url, {
			headers: {
				'User-Agent': 'Mozilla/5.0'
			}
		});
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		const data: any = await res.json();

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
			return new HotItem(`${idx + 1}. ${title}`, author, jumpUrl);
		});
	}
}

class BilibiliHotProvider extends BaseHotProvider {
	protected async fetchItems(): Promise<HotItem[]> {
		// 该接口需要带参数，否则经常返回空列表
		// rid=0 表示全站；type=all 表示全站综合
		const url = 'https://api.bilibili.com/x/web-interface/ranking/v2?rid=0&type=all';
		const res = await fetch(url, {
			headers: {
				'User-Agent': 'Mozilla/5.0',
				Referer: 'https://www.bilibili.com/'
			}
		});
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		const data: any = await res.json();

		const list: any[] =
			data?.data?.list ??
			data?.data?.result?.list ??
			data?.data?.items ??
			[];

		return list.slice(0, 50).map((it: any, idx: number) => {
			const title = it?.title ?? `未命名 #${idx + 1}`;
			const up = it?.owner?.name ?? it?.author ?? it?.up_name;
			const bvid = it?.bvid;
			const aid = it?.aid;
			const jumpUrl = bvid
				? `https://www.bilibili.com/video/${bvid}`
				: aid
					? `https://www.bilibili.com/video/av${aid}`
					: undefined;
			return new HotItem(`${idx + 1}. ${title}`, up, jumpUrl);
		});
	}
}

class DouyinHotProvider extends BaseHotProvider {
	protected async fetchItems(): Promise<HotItem[]> {
		const url = 'https://www.tianchenw.com/hot/douyin';
		const res = await fetch(url, {
			headers: {
				'User-Agent': 'Mozilla/5.0'
			}
		});
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		const data: any = await res.json();

		const list: any[] =
			data?.data ??
			data?.list ??
			data?.result ??
			[];

		return list.slice(0, 50).map((it: any, idx: number) => {
			const title = it?.title ?? it?.name ?? `未命名 #${idx + 1}`;
			const hot = it?.hot ?? it?.heat ?? it?.hotValue;
			const jumpUrl = it?.url ?? it?.link;
			return new HotItem(`${idx + 1}. ${title}`, hot, jumpUrl);
		});
	}
}

class KuaishouHotProvider extends BaseHotProvider {
	protected async fetchItems(): Promise<HotItem[]> {
		const url = 'https://www.tianchenw.com/hot/kuaishou';
		const res = await fetch(url, {
			headers: {
				'User-Agent': 'Mozilla/5.0'
			}
		});
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		const data: any = await res.json();

		const list: any[] =
			data?.data ??
			data?.list ??
			data?.result ??
			[];

		return list.slice(0, 50).map((it: any, idx: number) => {
			const title = it?.title ?? it?.name ?? `未命名 #${idx + 1}`;
			const hot = it?.hot ?? it?.heat ?? it?.hotValue;
			const jumpUrl = it?.url ?? it?.link;
			return new HotItem(`${idx + 1}. ${title}`, hot, jumpUrl);
		});
	}
}

class Kr36HotProvider extends BaseHotProvider {
	protected async fetchItems(): Promise<HotItem[]> {
		const url = 'https://v2.xxapi.cn/api/hot36kr';
		const res = await fetch(url, {
			headers: {
				'User-Agent': 'Mozilla/5.0'
			}
		});
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		const root: any = await res.json();

		// hot36kr 接口示例结构：
		// { code: 200, msg: '数据请求成功', data: [ { itemId, route, templateMaterial: { widgetTitle, authorName, statRead, ... } } ] }
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

			return new HotItem(`${idx + 1}. ${title}`, author ?? stat, jumpUrl);
		});
	}
}

class SmzdmHotProvider extends BaseHotProvider {
	protected async fetchItems(): Promise<HotItem[]> {
		// 官方开放平台需要授权，这里暂时只给一个占位提示
		return [
			new HotItem(
				'暂未接入什么值得买官方 API',
				'后续可通过 openapi.zhidemai.com 接入',
				undefined
			)
		];
	}
}

class XhsHotProvider extends BaseHotProvider {
	protected async fetchItems(): Promise<HotItem[]> {
		const url = 'https://api.itapi.cn/api/hotnews/xiaohongshu';
		const res = await fetch(url, {
			headers: {
				'User-Agent': 'Mozilla/5.0'
			}
		});
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		const data: any = await res.json();

		const list: any[] =
			data?.data ??
			data?.list ??
			data?.result ??
			[];

		return list.slice(0, 50).map((it: any, idx: number) => {
			const title = it?.title ?? it?.name ?? it?.word ?? `未命名 #${idx + 1}`;
			const hot = it?.hot ?? it?.heat ?? it?.read ?? it?.pv;
			const jumpUrl = it?.url ?? it?.link;
			return new HotItem(`${idx + 1}. ${title}`, hot, jumpUrl);
		});
	}
}

class WeiboHotProvider extends BaseHotProvider {
	protected async fetchItems(): Promise<HotItem[]> {
		// 使用微博侧边栏热搜接口
		const url = 'https://weibo.com/ajax/side/hotSearch';
		const res = await fetch(url, {
			headers: {
				'User-Agent': 'Mozilla/5.0',
				Referer: 'https://weibo.com/',
				'Accept': 'application/json,text/plain,*/*'
			}
		});
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		const data: any = await res.json();

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
			return new HotItem(`${idx + 1}. ${title}`, hot ? String(hot) : undefined, jumpUrl);
		});
	}
}

function getPreviewHtml(webview: vscode.Webview, title: string, url: string): string {
	const nonce = getNonce();
	// 注意：有些站点会通过 X-Frame-Options / CSP 禁止 iframe，这种情况下 iframe 会空白
	// 我们保留一个“用浏览器打开”的按钮作为兜底
	const escapedTitle = escapeHtml(title);
	const escapedUrl = escapeHtml(url);

	return /* html */ `<!doctype html>
  <html lang="zh-CN">
    <head>
      <meta charset="UTF-8" />
      <meta http-equiv="Content-Security-Policy"
        content="default-src 'none';
                 img-src ${webview.cspSource} https: data:;
                 style-src ${webview.cspSource} 'unsafe-inline';
                 script-src 'nonce-${nonce}';
                 frame-src https:;">
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${escapedTitle}</title>
      <style>
        body { margin: 0; font-family: system-ui, -apple-system, 'Segoe UI', sans-serif; color: #e5e7eb; background: #020617; }
        .bar { display:flex; align-items:center; gap:8px; padding:8px 10px; border-bottom: 1px solid #1e293b; }
        .title { font-size: 12px; font-weight: 600; flex: 1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .btn { border:1px solid #1e293b; background:#0b1226; color:#e5e7eb; border-radius:6px; padding:4px 8px; font-size: 11px; cursor:pointer; }
        .btn:hover { background:#0f172a; }
        .hint { padding:10px; font-size: 12px; color:#94a3b8; }
        iframe { width: 100%; height: calc(100vh - 40px); border: 0; background: #0b1226; }
        a { color: #38bdf8; }
      </style>
    </head>
    <body>
      <div class="bar">
        <div class="title">${escapedTitle}</div>
        <button class="btn" id="openExternal">用浏览器打开</button>
      </div>
      <iframe src="${escapedUrl}" referrerpolicy="no-referrer"></iframe>
      <div class="hint">
        如果上方预览空白，通常是目标站点禁止 iframe。你仍然可以点击“用浏览器打开”。
      </div>
      <script nonce="${nonce}">
        const url = ${JSON.stringify(url)};
        const btn = document.getElementById('openExternal');
        btn?.addEventListener('click', () => {
          window.location.href = 'command:2lang-hot.openExternal?' + encodeURIComponent(JSON.stringify([url]));
        });
      </script>
    </body>
  </html>`;
}

function escapeHtml(s: string): string {
	return s
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;');
}

function getNonce(): string {
	let text = '';
	const possible =
		'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}
