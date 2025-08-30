# Chrome Sidepanel Extension Template

A production-ready template for creating Chrome sidepanel extensions with modern web technologies.

![Sidepanel Extension Template](https://img.shields.io/badge/Chrome-Extension-blue?style=flat-square) ![React](https://img.shields.io/badge/React-19-blue?style=flat-square) ![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=flat-square) ![Tailwind](https://img.shields.io/badge/TailwindCSS-4.0-blue?style=flat-square)

## ✨ Features

- 🚀 **WXT Framework** - Modern extension development framework
- ⚡ **React 19** - Latest React with TypeScript support
- 🎨 **Tailwind CSS 4.0** - Modern utility-first CSS framework  
- 🧩 **shadcn/ui** - Beautiful, accessible UI components
- 📱 **Chrome Sidepanel API** - Native sidepanel integration
- 🔧 **Production Ready** - Optimized build configuration
- 📦 **Easy Deployment** - Simple build and zip commands

## 🛠️ Quick Start

### Prerequisites

- Node.js (v18 or higher)
- pnpm (recommended) or npm
- Chrome browser for testing

### Installation

1. **Use this template:**
   ```bash
   git clone https://github.com/thatbeautifuldream/sidepanel-extension-template
   cd sidepanel-extension-template
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Start development:**
   ```bash
   pnpm dev
   # or 
   npm run dev
   ```

4. **Load the extension:**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `.output/chrome-mv3` folder

## 🚀 Development

### Available Scripts

```bash
# Development
pnpm dev                # Start development server
pnpm dev:firefox        # Start development for Firefox

# Building
pnpm build              # Build for production
pnpm build:firefox      # Build for Firefox
pnpm zip                # Create distribution zip
pnpm compile            # Type check without building
```

### Project Structure

```
├── entrypoints/
│   ├── background.ts          # Background script
│   └── sidepanel/
│       ├── App.tsx           # Main sidepanel component
│       ├── main.tsx          # React entry point
│       └── index.html        # Sidepanel HTML template
├── components/
│   └── ui/                   # shadcn/ui components
│       ├── button.tsx
│       └── input.tsx
├── lib/
│   └── utils.ts              # Utility functions
├── assets/                   # Static assets
├── public/                   # Public assets
├── wxt.config.ts            # WXT configuration
├── components.json          # shadcn/ui configuration
└── tsconfig.json           # TypeScript configuration
```

## 🎨 Styling

This template uses **Tailwind CSS 4.0** with **shadcn/ui** components for styling.

### Adding New UI Components

Add new shadcn/ui components:

```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dialog
```

### Customizing Theme

Edit the Tailwind configuration in your CSS files or `wxt.config.ts` for theme customization.

## 🧩 Extension Features

### Sidepanel Integration

The extension automatically registers a sidepanel that opens when the extension icon is clicked. The sidepanel behavior is configured in:

- `entrypoints/background.ts` - Background script setup
- `wxt.config.ts` - Manifest configuration

### Permissions

Currently configured permissions:
- `sidePanel` - Required for sidepanel functionality

Add more permissions in `wxt.config.ts` as needed:

```typescript
permissions: ["sidePanel", "storage", "tabs", "activeTab"]
```

## 📦 Building for Production

1. **Build the extension:**
   ```bash
   pnpm build
   ```

2. **Create distribution package:**
   ```bash
   pnpm zip
   ```

3. **Upload to Chrome Web Store:**
   - Go to the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
   - Upload the generated `.output/chrome-mv3.zip` file

## 🔧 Customization

### Extension Details

Update the following files to customize your extension:

1. **`wxt.config.ts`** - Extension manifest details:
   ```typescript
   manifest: {
     name: "Your Extension Name",
     description: "Your extension description",
     version: "1.0.0",
     // ... other manifest settings
   }
   ```

2. **`package.json`** - Package information:
   ```json
   {
     "name": "your-extension-name",
     "description": "Your extension description",
     "version": "1.0.0"
   }
   ```

3. **`entrypoints/sidepanel/App.tsx`** - Main application component

### Adding Icons

1. Add your extension icons to the `public/` directory:
   - `icon-16.png` (16x16)
   - `icon-48.png` (48x48) 
   - `icon-128.png` (128x128)

2. Update the manifest in `wxt.config.ts`:
   ```typescript
   manifest: {
     icons: {
       "16": "icon-16.png",
       "48": "icon-48.png", 
       "128": "icon-128.png"
     }
   }
   ```

## 🛠️ Advanced Configuration

### Custom Build Configuration

Modify `wxt.config.ts` for advanced build customization:

```typescript
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  manifest: {
    // Your manifest configuration
  },
  vite: () => ({
    plugins: [tailwindcss()],
    // Add more Vite configuration
  }),
})
```

### Environment Variables

Create `.env` files for different environments:

```bash
# .env.development
VITE_API_URL=http://localhost:3000

# .env.production  
VITE_API_URL=https://api.yourapp.com
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

**Extension doesn't load:**
- Ensure you're loading the `.output/chrome-mv3` folder
- Check the console for any error messages
- Verify all permissions are properly set

**Sidepanel doesn't open:**
- Check that `sidePanel` permission is included
- Verify the background script is properly configured
- Make sure Chrome supports sidepanel API (Chrome 114+)

**Build fails:**
- Check Node.js version (v18+ required)
- Clear node_modules and reinstall: `rm -rf node_modules && pnpm install`
- Check for TypeScript errors: `pnpm compile`

### Need Help?

- Check the [WXT Documentation](https://wxt.dev)
- Visit [Chrome Extension Developer Guide](https://developer.chrome.com/docs/extensions/)
- Open an issue in this repository

---

**Happy coding! 🎉**