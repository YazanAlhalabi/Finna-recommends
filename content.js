window.addEventListener('load', autoScan);
window.addEventListener('mouseup', wordSelected);
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.msg == "newTabisReadyToBeScanned"){
      autoScan();
    }
  });

function wordSelected() {
  let selectedText = window.getSelection().toString();
  if (selectedText.length > 0) {
    let message = {
      text: selectedText,
    };
    chrome.runtime.sendMessage(message);
  }
}

function autoScan() {
  let message = {
    text: getWholeWebPageText(),
  };
  chrome.runtime.sendMessage(message);
}

const getWholeWebPageText = function() {
  let wholePageText = '';
  document.querySelectorAll('*').forEach(value => {
    if (value.textContent.length > 0 && value.textContent.length < 100) {
      wholePageText += value.textContent;
    }
  });
  return wholePageText;
};
