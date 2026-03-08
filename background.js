// StaticMind — background.js
// Listens for messages from content script and popup

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'OPEN_CHATPAGE') {
    const site = encodeURIComponent(message.site || '');
    // Replace with your deployed Vercel URL
    const chatUrl = `https://staticmind-5u0wf16c6-vaishnavisuvarnakars-projects.vercel.app/?site=${site}`;
    chrome.tabs.create({ url: chatUrl });
    sendResponse({ ok: true });
  }
  return true;
});
