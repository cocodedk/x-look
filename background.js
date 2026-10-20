// The toolbar icon switches X Look on and off in every x.com tab: the content
// script follows chrome.storage, and the badge says "off" while it is off.

const badge = (off) => chrome.action.setBadgeText({ text: off ? "off" : "" });
const stored = async () => (await chrome.storage.local.get("off")).off;

chrome.action.onClicked.addListener(async () => {
  const off = !(await stored());
  await chrome.storage.local.set({ off });
  badge(off);
});

// Badges do not survive a browser restart or the extension being reloaded or
// re-enabled; every one of those starts this worker, so set it here.
chrome.action.setBadgeBackgroundColor({ color: "#808080" });
stored().then(badge);
