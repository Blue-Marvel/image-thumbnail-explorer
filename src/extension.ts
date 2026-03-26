import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.svg', '.gif', '.webp'];

export function activate(context: vscode.ExtensionContext) {
	const provider = new ImageTreeProvider(context);

	// Register the custom tree view
	const treeView = vscode.window.createTreeView('imageThumbnailExplorer', {
		treeDataProvider: provider,
		showCollapseAll: true,
	});

	// Refresh when workspace files change
	const watcher = vscode.workspace.createFileSystemWatcher('**/*.{png,jpg,jpeg,svg,gif,webp}');
	watcher.onDidCreate(() => provider.refresh());
	watcher.onDidDelete(() => provider.refresh());

	context.subscriptions.push(treeView, watcher);
}

class ImageTreeProvider implements vscode.TreeDataProvider<ImageItem> {
	private _onDidChangeTreeData = new vscode.EventEmitter<ImageItem | undefined>();
	readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

	constructor(private context: vscode.ExtensionContext) { }

	refresh() {
		this._onDidChangeTreeData.fire(undefined);
	}

	getTreeItem(element: ImageItem): vscode.TreeItem {
		return element;
	}

	async getChildren(element?: ImageItem): Promise<ImageItem[]> {
		if (!vscode.workspace.workspaceFolders) return [];

		const rootPath = element?.resourceUri?.fsPath
			?? vscode.workspace.workspaceFolders[0].uri.fsPath;

		return this.getImageItems(rootPath);
	}

	private getImageItems(dirPath: string): ImageItem[] {
		const entries = fs.readdirSync(dirPath, { withFileTypes: true });
		const items: ImageItem[] = [];

		for (const entry of entries) {
			if (entry.name.startsWith('.')) continue;
			const fullPath = path.join(dirPath, entry.name);
			const uri = vscode.Uri.file(fullPath);

			if (entry.isDirectory()) {
				const hasImages = this.directoryHasImages(fullPath);
				if (hasImages) {
					items.push(new ImageItem(
						entry.name,
						uri,
						vscode.TreeItemCollapsibleState.Collapsed,
						'folder'
					));
				}
			} else {
				const ext = path.extname(entry.name).toLowerCase();
				if (IMAGE_EXTENSIONS.includes(ext)) {
					items.push(new ImageItem(
						entry.name,
						uri,
						vscode.TreeItemCollapsibleState.None,
						'image'
					));
				}
			}
		}
		return items;
	}

	private directoryHasImages(dirPath: string): boolean {
		try {
			const entries = fs.readdirSync(dirPath, { withFileTypes: true });
			return entries.some(e => {
				if (e.isDirectory()) return this.directoryHasImages(path.join(dirPath, e.name));
				return IMAGE_EXTENSIONS.includes(path.extname(e.name).toLowerCase());
			});
		} catch { return false; }
	}
}

class ImageItem extends vscode.TreeItem {
	constructor(
		label: string,
		public readonly resourceUri: vscode.Uri,
		collapsibleState: vscode.TreeItemCollapsibleState,
		type: 'image' | 'folder'
	) {
		super(label, collapsibleState);
		this.tooltip = resourceUri.fsPath;

		if (type === 'image') {
			// 🔑 This is what shows the thumbnail!
			this.iconPath = resourceUri;
			this.command = {
				command: 'vscode.open',
				title: 'Open Image',
				arguments: [resourceUri]
			};
		} else {
			this.iconPath = new vscode.ThemeIcon('folder');
		}
	}
}