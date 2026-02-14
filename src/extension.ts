// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { BaseHotProvider, HotItem } from './base/BaseProvider';

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
	const kr36Provider = new Kr36HotProvider();
	const weiboProvider = new WeiboHotProvider();
	const baiduProvider = new BaiduHotProvider();
	const toutiaoProvider = new ToutiaoHotProvider();
	const settingsProvider = new SettingsProvider();

	// 按渠道维护预览面板，每个渠道一个 tab
	const previewPanels: Record<string, vscode.WebviewPanel | undefined> = {};

	context.subscriptions.push(
		vscode.window.registerTreeDataProvider('2lang-hot.weixinView', weixinProvider),
		vscode.window.registerTreeDataProvider('2lang-hot.baiduView', baiduProvider),
		vscode.window.registerTreeDataProvider('2lang-hot.bilibiliView', bilibiliProvider),
		vscode.window.registerTreeDataProvider('2lang-hot.36krView', kr36Provider),
		vscode.window.registerTreeDataProvider('2lang-hot.weiboView', weiboProvider),
		vscode.window.registerTreeDataProvider('2lang-hot.toutiaoView', toutiaoProvider),
		vscode.window.registerTreeDataProvider('2lang-hot.settingsView', settingsProvider),
		vscode.commands.registerCommand('2lang-hot.refreshWeixin', () => weixinProvider.refresh()),
		vscode.commands.registerCommand('2lang-hot.refreshBaidu', () => baiduProvider.refresh()),
		vscode.commands.registerCommand('2lang-hot.refreshBilibili', () => bilibiliProvider.refresh()),
		vscode.commands.registerCommand('2lang-hot.refresh36kr', () => kr36Provider.refresh()),
		vscode.commands.registerCommand('2lang-hot.refreshWeibo', () => weiboProvider.refresh()),
		vscode.commands.registerCommand('2lang-hot.refreshToutiao', () => toutiaoProvider.refresh()),
		vscode.commands.registerCommand('2lang-hot.openInWebview', (payload: { title?: string; url: string; source?: string }) => {
			const title = payload?.title?.trim() || '2lang-hot 预览';
			const url = payload?.url;
			if (!url) {
				return;
			}

			// 部分网站（如 bilibili、今日头条）会禁止 iframe 内嵌，这里直接用外部浏览器打开
			try {
				const u = new URL(url);
				if (u.hostname.includes('bilibili.com') || u.hostname.includes('toutiao.com')) {
					void vscode.env.openExternal(vscode.Uri.parse(url));
					return;
				}
			} catch {
				// ignore URL parse error, fall back to webview
			}

			const sourceKey = payload?.source ?? 'default';
			let panel = previewPanels[sourceKey];

			// 已有该渠道预览面板时重用它，并覆盖内容
			if (panel) {
				panel.title = title;
				panel.webview.html = getPreviewHtml(panel.webview, title, url);
				panel.reveal(vscode.ViewColumn.Active, false);
				return;
			}

			panel = vscode.window.createWebviewPanel(
				'2langHotPreview',
				title,
				{ viewColumn: vscode.ViewColumn.Active, preserveFocus: false },
				{
					enableScripts: true,
					retainContextWhenHidden: true
				}
			);

			panel.webview.html = getPreviewHtml(panel.webview, title, url);
			previewPanels[sourceKey] = panel;

			panel.onDidDispose(
				() => {
					if (previewPanels[sourceKey] === panel) {
						previewPanels[sourceKey] = undefined;
					}
				},
				null,
				context.subscriptions
			);
		}),
		vscode.commands.registerCommand('2lang-hot.openChannelSettings', () => {
			void vscode.commands.executeCommand('workbench.action.openSettings', '2lang-hot.');
		}),
		vscode.commands.registerCommand('2lang-hot.openExtensionSettings', () => {
			void vscode.commands.executeCommand('workbench.action.openSettings', '@ext:2lang-hot');
		}),
		vscode.commands.registerCommand('2lang-hot.openReadme', async () => {
			try {
				const ext = vscode.extensions.getExtension('2lang-hot');
				if (!ext) {
					throw new Error('extension not found');
				}
				const uri = vscode.Uri.joinPath(ext.extensionUri, 'README.md');
				await vscode.commands.executeCommand('markdown.showPreview', uri);
			} catch {
				void vscode.window.showInformationMessage('可以在扩展根目录的 README.md 中查看使用说明。');
			}
		}),
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

class SettingsProvider implements vscode.TreeDataProvider<HotItem> {
	private readonly _onDidChangeTreeData = new vscode.EventEmitter<HotItem | undefined | void>();
	readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

	getTreeItem(element: HotItem): vscode.TreeItem {
		return element;
	}

	getChildren(): Thenable<HotItem[]> {
		const items: HotItem[] = [
			new HotItem('渠道选择', '勾选要显示的平台', undefined, 'settings-channel'),
			new HotItem('插件设置', '打开 VS Code 扩展设置', undefined, 'settings-extension'),
			new HotItem('使用文档', '查看 README 说明', undefined, 'settings-docs')
		];

		// 为不同按钮绑定不同命令
		items[0].command = {
			command: '2lang-hot.openChannelSettings',
			title: '渠道选择',
			arguments: []
		};
		items[1].command = {
			command: '2lang-hot.openExtensionSettings',
			title: '插件设置',
			arguments: []
		};
		items[2].command = {
			command: '2lang-hot.openReadme',
			title: '使用文档',
			arguments: []
		};

		return Promise.resolve(items);
	}
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
			return new HotItem(`${idx + 1}. ${title}`, author, jumpUrl, 'weixin');
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
			return new HotItem(`${idx + 1}. ${title}`, up, jumpUrl, 'bilibili');
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

			return new HotItem(`${idx + 1}. ${title}`, author ?? stat, jumpUrl, '36kr');
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
			return new HotItem(`${idx + 1}. ${title}`, hot ? String(hot) : undefined, jumpUrl, 'weibo');
		});
	}
}

class BaiduHotProvider extends BaseHotProvider {
	protected async fetchItems(): Promise<HotItem[]> {
		// 百度热搜官方接口：https://top.baidu.com/api/board?platform=wise&tab=realtime
		const url = 'https://top.baidu.com/api/board?platform=wise&tab=realtime';
		const res = await fetch(url, {
			headers: {
				'User-Agent': 'Mozilla/5.0',
				Referer: 'https://top.baidu.com/'
			}
		});
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		const root: any = await res.json();
		if (!root?.success || !root?.data?.cards) {
			throw new Error('接口返回格式异常');
		}

		// 结构：data.cards[] 中 component === 'tabTextList' 的 content[0].content 为热搜列表
		const card = root.data.cards.find((c: any) => c?.component === 'tabTextList');
		const list: any[] =
			card?.content?.[0]?.content ??
			[];

		return list.slice(0, 50).map((it: any, idx: number) => {
			const title = it?.word ?? `未命名 #${idx + 1}`;
			const tag = it?.newHotName ?? it?.labelTagName;
			const jumpUrl = it?.url ?? (it?.word ? `https://www.baidu.com/s?wd=${encodeURIComponent(it.word)}` : undefined);
			return new HotItem(`${idx + 1}. ${title}`, tag, jumpUrl, 'baidu');
		});
	}
}

class ToutiaoHotProvider extends BaseHotProvider {
	protected async fetchItems(): Promise<HotItem[]> {
		// 今日头条热榜官方接口：https://www.toutiao.com/hot-event/hot-board/?origin=toutiao_pc
		const url = 'https://www.toutiao.com/hot-event/hot-board/?origin=toutiao_pc';
		const res = await fetch(url, {
			headers: {
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
				Referer: 'https://www.toutiao.com/'
			}
		});
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		const root: any = await res.json();

		const list: any[] = root?.data ?? [];

		return list.slice(0, 50).map((it: any, idx: number) => {
			const title = it?.Title ?? it?.title ?? it?.QueryWord ?? `未命名 #${idx + 1}`;
			const hot = it?.HotValue;
			const label = it?.LabelDesc ?? (it?.Label === 'interpretation' ? '解读' : it?.Label === 'new' ? '新' : it?.Label === 'refuteRumors' ? '辟谣' : it?.Label === 'forum' ? '热议' : '');
			const desc = hot ? (label ? `${label} · ${hot}` : String(hot)) : label;
			const jumpUrl = it?.Url ?? it?.url;
			return new HotItem(`${idx + 1}. ${title}`, desc, jumpUrl, 'toutiao');
		});
	}
}

function getPreviewHtml(webview: vscode.Webview, title: string, url: string): string {
	const nonce = getNonce();
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
        body { margin: 0; background: #020617; }
        iframe { width: 100%; height: 100vh; border: 0; background: #0b1226; }
      </style>
    </head>
    <body>
      <iframe src="${escapedUrl}" referrerpolicy="no-referrer"></iframe>
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
