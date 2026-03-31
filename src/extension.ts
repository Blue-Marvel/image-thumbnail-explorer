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
	watcher.onDidChange(() => provider.refresh());

	context.subscriptions.push(
		treeView,
		watcher,
		vscode.commands.registerCommand('imageThumbnailExplorer.refresh', () => provider.refresh()),
		vscode.commands.registerCommand('imageThumbnailExplorer.delete', async (item?: ImageItem) => {
			const target = item || treeView.selection[0];
			if (!target || !target.resourceUri) { return; }
			const label = typeof target.label === 'string' ? target.label : target.label?.label;
			const confirm = await vscode.window.showWarningMessage(
				`Are you sure you want to delete '${label}'?`,
				{ modal: true },
				'Delete'
			);
			if (confirm === 'Delete') {
				await vscode.workspace.fs.delete(target.resourceUri, { useTrash: true });
			}
		}),
		vscode.commands.registerCommand('imageThumbnailExplorer.rename', async (item?: ImageItem) => {
			const target = item || treeView.selection[0];
			if (!target || !target.resourceUri) { return; }
			const oldName = typeof target.label === 'string' ? target.label : target.label?.label || '';
			const lastDot = oldName.lastIndexOf('.');
			const newName = await vscode.window.showInputBox({
				prompt: 'Enter new name for the image',
				value: oldName,
				valueSelection: lastDot > 0 ? [0, lastDot] : undefined
			});
			if (newName && newName !== oldName) {
				const newUri = vscode.Uri.file(path.join(path.dirname(target.resourceUri.fsPath), newName));
				await vscode.workspace.fs.rename(target.resourceUri, newUri);
			}
		}),
		vscode.commands.registerCommand('imageThumbnailExplorer.copyPath', async (item?: ImageItem) => {
			const target = item || treeView.selection[0];
			if (!target || !target.resourceUri) { return; }
			await vscode.env.clipboard.writeText(target.resourceUri.fsPath);
			vscode.window.showInformationMessage('Path copied to clipboard!');
		}),
		vscode.commands.registerCommand('imageThumbnailExplorer.duplicate', async (item?: ImageItem) => {
			const target = item || treeView.selection[0];
			if (!target || !target.resourceUri) { return; }
			const ext = path.extname(target.resourceUri.fsPath);
			const base = path.basename(target.resourceUri.fsPath, ext);
			const newName = `${base} copy${ext}`;
			const newUri = vscode.Uri.file(path.join(path.dirname(target.resourceUri.fsPath), newName));
			await vscode.workspace.fs.copy(target.resourceUri, newUri);
		}),
		vscode.commands.registerCommand('imageThumbnailExplorer.add', async (item?: ImageItem) => {
			const target = item || treeView.selection[0];
			let targetPath = target?.resourceUri?.fsPath;
			if (!targetPath || target?.contextValue !== 'folder') {
				if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
					targetPath = vscode.workspace.workspaceFolders[0].uri.fsPath;
				} else {
					vscode.window.showErrorMessage('No workspace folder found to add images.');
					return;
				}
			}

			const uris = await vscode.window.showOpenDialog({
				canSelectMany: true,
				openLabel: 'Add Image(s)',
				filters: {
					'Images': ['png', 'jpg', 'jpeg', 'svg', 'gif', 'webp']
				}
			});

			if (uris && uris.length > 0) {
				for (const uri of uris) {
					const dest = vscode.Uri.file(path.join(targetPath, path.basename(uri.fsPath)));
					try {
						await vscode.workspace.fs.copy(uri, dest, { overwrite: false });
					} catch (err) {
						vscode.window.showErrorMessage(`Failed to add ${path.basename(uri.fsPath)}: It may already exist.`);
					}
				}
			}
		})
	);
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
		if (!vscode.workspace.workspaceFolders) { return []; }

		const rootPath = element?.resourceUri?.fsPath
			?? vscode.workspace.workspaceFolders[0].uri.fsPath;

		return this.getImageItems(rootPath);
	}

	private getImageItems(dirPath: string): ImageItem[] {
		const entries = fs.readdirSync(dirPath, { withFileTypes: true });
		const items: ImageItem[] = [];

		for (const entry of entries) {
			if (entry.name.startsWith('.')) { continue; }
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
				if (e.isDirectory()) { return this.directoryHasImages(path.join(dirPath, e.name)); }
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
			this.contextValue = 'image';
			// 🔑 This is what shows the thumbnail!
			this.iconPath = resourceUri;
			this.command = {
				command: 'vscode.open',
				title: 'Open Image',
				arguments: [resourceUri]
			};
		} else {
			this.contextValue = 'folder';
			this.iconPath = new vscode.ThemeIcon('folder');
		}
	}
}