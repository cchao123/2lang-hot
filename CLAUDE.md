# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a VS Code extension called "2lang-hot" that displays trending/hot content from Chinese social media platforms (WeChat Reading, Bilibili, 36Kr, Weibo, Baidu, Toutiao) in the VS Code sidebar.

## Commands

```bash
pnpm run compile      # Build with webpack (development)
pnpm run watch        # Watch mode for development
pnpm run package      # Production build for publishing
pnpm run lint         # Run ESLint
pnpm run test         # Run tests
pnpm run vsce:package # Package as .vsix file
```

## Architecture

### Provider Pattern

The extension uses VS Code's TreeDataProvider pattern. Each platform has a Provider class:

- `src/base/BaseProvider.ts` - Abstract base class with caching, loading states, and refresh logic
- `src/dashboard/*.ts` - Platform-specific providers extending `BaseHotProvider`

Each provider:
1. Fetches data from platform APIs via `src/api/index.ts`
2. Transforms responses into `HotItem` objects
3. Handles click events (webview panel or external browser)

### Key Files

- `src/extension.ts` - Extension entry point, registers commands and views
- `src/api/index.ts` - API functions for fetching hot lists
- `src/shared/constant.ts` - API endpoint URLs
- `src/shared/http.ts` - HTTP helpers using native `fetch`

### Content Display

- Most platforms open content in a VS Code webview panel
- Bilibili and Toutiao block iframe embedding, so they open in external browser instead

### Configuration

Users can enable/disable individual platform views via VS Code settings (`2langHot.*`).
