var shortcutKey = {

  init: function() {
    document.body.addEventListener('keydown', shortcutKey.handleShortcut, false);

    chrome.runtime.onMessage.addListener(function(request, sender, response) {
      if (request.msg == 'is_helper_load') {
        response({msg: 'helper_loaded'});
      }
    });
  },

  isThisPlatform: function(operationSystem) {
    return navigator.userAgent.toLowerCase().indexOf(operationSystem) > -1;
  },

  handleShortcut: function (event) {
    var isMac = shortcutKey.isThisPlatform('mac');
    var keyCode = event.keyCode;
    // Send compose key like Ctrl + Alt + alphabetical-key to background.
    if ((event.ctrlKey && event.altKey && !isMac ||
    event.metaKey && event.altKey && isMac) &&
    keyCode > 64 && keyCode < 91) {
      chrome.runtime.sendMessage({
        type: 'designertools_hot_key',
        keyCode: keyCode
      });
    }
  },

  sendMessage: function(message) {
    chrome.extension.sendRequest(message);
  }
};

shortcutKey.init();