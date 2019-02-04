/*global chrome*/

export function autoTrigger() {
    setTimeout(() => {
        navigator.mediaDevices.getUserMedia({ audio: true })
        .catch(function() {
            chrome.tabs.create({
                url: chrome.extension.getURL("options.html"),
                selected: true
            })
        });
    }, 100);
}
