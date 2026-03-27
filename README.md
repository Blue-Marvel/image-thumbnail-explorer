# 🖼️ Image Thumbnail Explorer

> **See your images before you click them.** A VS Code extension that renders live thumbnails of `.png`, `.jpg`, `.jpeg`, `.svg`, and `.gif` files directly in your Explorer sidebar.

![VS Code](https://img.shields.io/badge/VS%20Code-^1.85.0-007ACC?style=flat&logo=visual-studio-code)
![License](https://img.shields.io/badge/license-MIT-green?style=flat)
![Version](https://img.shields.io/badge/version-0.0.1-blue?style=flat)

---

## ✨ What it does

No more clicking through files blindly. Image Thumbnail Explorer adds a dedicated **Image Thumbnails** panel to your Explorer sidebar — every image file in your workspace is shown with a live thumbnail preview, right next to its filename.

Perfect for:

- 🎨 **Designers** managing asset libraries
- 📱 **App developers** working with icon sets
- 🗂️ **Anyone** tired of opening images one by one just to find the right one

---

## 📸 Preview

```
📁 Image Thumbnails
├── 🖼 about.png
├── 🖼 add_image.png
├── 🖼 background.png
├── 📁 icons/
│   ├── 🖼 bolt.svg
│   ├── 🖼 calendar.svg
│   └── 🖼 add.png
└── 🖼 splash.jpg
```

Each file shows its actual image content as a small icon — not a generic file icon.

---

## 🚀 Installation

### From the VS Code Marketplace

1. Open VS Code
2. Press `Ctrl+Shift+X` (or `Cmd+Shift+X` on Mac) to open Extensions
3. Search for **Image Thumbnail Explorer**
4. Click **Install**

### From a `.vsix` file,

- Download it from marketplace [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=marvel-dev.image-thumbnail-explorer) or [Open VSX Registry](https://open-vsx.org/extension/marvel-dev/image-thumbnail-explorer).
- `cd` To the directory on your terminal and run the following commands.

### Visual Studio Code

```bash
code --install-extension image-thumbnail-explorer-0.0.*.vsix
```

### Antigravity

```bash
anitgravity --install-extension image-thumbnail-explorer-0.0.*.vsix
```

### Cursor

```bash
cursor --install-extension image-thumbnail-explorer-0.0.*.vsix
```

### Note: Make sure to replace the `*` with the current version

---

## 🧭 How to use

1. Open any folder or workspace in VS Code
2. Look for the **Image Thumbnails** panel in the Explorer sidebar (below your file tree)
3. If it's not visible, press `Ctrl+Shift+P` and search for **Image Thumbnails** to bring it into focus
4. Click any image to open it in the editor

That's it — thumbnails load automatically. No configuration needed.

---

## ⚙️ Supported file types

| Format | Extension       |
| ------ | --------------- |
| PNG    | `.png`          |
| JPEG   | `.jpg`, `.jpeg` |
| SVG    | `.svg`          |
| GIF    | `.gif`          |
| WebP   | `.webp`         |

---

## 🔄 Auto-refresh

The panel automatically updates when you:

- Add new image files to your workspace
- Delete image files
- Rename or move files

No manual refresh needed.

---

## 🛠️ Extension Settings

This extension works out of the box with no required configuration. Future versions will add settings for:

- Filtering by file type
- Custom thumbnail size
- Exclude folders (e.g. `node_modules`)

---

## 💡 Tips

- **Collapse folders** that don't have images — the panel only shows folders containing at least one image, keeping things clean
- **Click to open** — clicking any thumbnail opens the full image in the VS Code image viewer
- **Use the refresh button** in the panel title bar if thumbnails ever get out of sync

---

## 🐛 Known Issues

- Very large workspaces with thousands of images may take a moment to load on first open
- Animated GIFs show a static thumbnail (the first frame)

Found a bug? [Open an issue on GitHub](https://github.com/Blue-Marvel/image-thumbnail-explorer/issues)

---

## 📦 Release Notes

### 0.0.1 — Initial Release

- Live thumbnails for `.png`, `.jpg`, `.jpeg`, `.svg`, `.gif`, `.webp`
- Auto-refreshes on file system changes
- Folders without images are automatically hidden
- Click-to-open support

---

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push and open a Pull Request

---

## 📄 License

MIT © [Marvel](https://github.com/Blue-Marvel)

---

<p align="center">Made with ❤️ for developers who think visually</p>
