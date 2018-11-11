chrome.runtime.onMessage.addListener(receiver);

window.word = '';

function receiver(request, sender, sendResponse) {
  word = request.text;
}

chrome.tabs.onActivated.addListener(function(activeInfo){
	var currentTabId = activeInfo.tabId;
	var currentWindowId = activeInfo.windowId;
	chrome.tabs.sendMessage(currentTabId,{'msg':'newTabisReadyToBeScanned'});
});

