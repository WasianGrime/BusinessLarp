// Clicking the toolbar icon (or pressing Alt+Shift+B) opens the terminal in
// a full tab, or switches to it if it's already open. The app is far too
// wide for a popup, and a single tab keeps one market running at a time.
const APP_URL = chrome.runtime.getURL("index.html");

chrome.action.onClicked.addListener(async () => {
  try {
    // getContexts needs no permissions and only sees this extension's own pages.
    const [existing] = await chrome.runtime.getContexts({
      contextTypes: ["TAB"],
      documentUrls: [APP_URL],
    });
    if (existing && existing.tabId >= 0) {
      await chrome.tabs.update(existing.tabId, { active: true });
      await chrome.windows.update(existing.windowId, { focused: true });
      return;
    }
  } catch {
    // Older Chrome without runtime.getContexts: fall through and open a new tab.
  }
  await chrome.tabs.create({ url: APP_URL });
});
