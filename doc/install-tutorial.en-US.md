# Install tutorial
This tutorial will help you install Bilibili-Evolved in your browser.

## 1. Before install
Please check your browser, Bilibili-Evolved must run with the **latest** Chrome / Firefox / Safari.

> You can also use the new [Chromium-based Edge](https://www.microsoftedgeinsider.com/en-us/), while UWP Edge (Windows 10 built-in) is **not** supported.

In this tutorial, I'll use Chrome as an example:

<img height="300" alt="Chrome" src="../images/compressed/chrome.en-US.jpg">

## 2. Get a user script manager
> If you already have one, skip this step.

Bilibili-Evolved is delivered as JavaScript code snippets, a user script manager is required to help you execute the code every time you visit bilibili and keep your personal settings.

Supported managers: [Tampermonkey](https://tampermonkey.net/), [Violentmonkey](https://violentmonkey.github.io/).

Choose the one you like and click the link to visit its homepage, or get it in your browser's extension store.
> You may know another manager called Greasemonkey, unfortunately, it's not supported.

e.g. Install Tampermonkey from Chrome Web Store

<img height="300" alt="Install from Chrome Web Store" src="../images/compressed/tampermonkey.en-US.jpg">

## 3. Install
Having at least one user script manager installed, you can now select a version of Bilibili-Evolved to install. (Click the name to install)

| [Stable](https://cdn.jsdelivr.net/gh/the1812/Bilibili-Evolved@master/bilibili-evolved.user.js) | [Preview](https://cdn.jsdelivr.net/gh/the1812/Bilibili-Evolved@preview/bilibili-evolved.preview.user.js) | [Offline](https://cdn.jsdelivr.net/gh/the1812/Bilibili-Evolved@master/bilibili-evolved.offline.user.js) | [Preview Offline](https://cdn.jsdelivr.net/gh/the1812/Bilibili-Evolved@preview/bilibili-evolved.preview-offline.user.js) |
| ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Provides stable features, but not frequently updated.                                     | New features got tested here, updated more frequently.                                              | Inlined all dependencies to avoid GitHub server problems.                                          | As the name says, Preview + Offline.                                                                                |

> ⚠ Sometimes the breaking changes will cause old version not work at all, please update the script in time.

e.g. Install the Offline version

<img height="350" alt="Install Offline version" src="../images/compressed/install-script.zh-CN.jpg">

## 4. Change the display language (Optional)
> Language should be automatically set to your browser's default language. If not, you can follow this step to change the display language.

Visit bilibili, there should be 2 icons (Add-ons and settings) on the left side of the page. Open settings by clicking the icon.

Assuming the current language is Simplified Chinese (default fallback language), unfold `工具` (tools) category and find `界面翻译` (UI translation).

Enable it and select a target language you want to see, then refresh the page.

e.g. Select English as the target language

<img height="500" alt="Open settings" src="../images/compressed/settings-icon.en-US.jpg">
<img height="500" alt="Change settings" src="../images/compressed/settings.en-US.jpg">

## 5. Enjoy
You are all set! Explore settings and add-ons to discover interesting features, and feel free to suggest a new feature or report a bug on my GitHub repo.
