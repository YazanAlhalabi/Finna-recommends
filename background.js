chrome.runtime.onMessage.addListener(receiver);

window.word = '';

function receiver(request, sender, sendResponse) {
  word = request.text;
}

chrome.tabs.onActivated.addListener(function(activeInfo){
	const currentTabId = activeInfo.tabId;
	chrome.tabs.sendMessage(currentTabId,{'msg':'newTabisReadyToBeScanned'});
});

