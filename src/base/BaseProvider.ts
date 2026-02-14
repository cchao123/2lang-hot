import * as vscode from 'vscode';

export class HotItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly description: string | undefined,
    public readonly url: string | undefined,
    public readonly source: string
  ) {
    super(label, vscode.TreeItemCollapsibleState.None);
    this.tooltip = url ? `${label}\n${url}` : label;
    this.description = description;
    if (url) {
      this.command = {
        command: '2lang-hot.openInWebview',
        title: '在右侧预览',
        arguments: [{ title: label, url, source }]
      };
    }
  }
}

export abstract class BaseHotProvider implements vscode.TreeDataProvider<HotItem> {
  private readonly _onDidChangeTreeData = new vscode.EventEmitter<HotItem | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<HotItem | undefined | void> = this._onDidChangeTreeData.event;

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
      return [new HotItem('加载中...', undefined, undefined, 'loading')];
    }

    if (this.cache) {
      return this.cache;
    }

    this.loading = true;
    this.lastError = null;
    this._onDidChangeTreeData.fire();

    try {
      const items = await this.fetchItems();
      this.cache = items.length ? items : [new HotItem('暂无数据', undefined, undefined, 'empty')];
      return this.cache;
    } catch (e) {
      this.lastError = String(e);
      return [new HotItem(`加载失败：${this.lastError}`, '点击刷新重试', undefined, 'error')];
    } finally {
      this.loading = false;
      this._onDidChangeTreeData.fire();
    }
  }

  protected abstract fetchItems(): Promise<HotItem[]>;
}

