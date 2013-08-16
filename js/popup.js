// Google Analytics
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-20877394-1']);
_gaq.push(['_trackPageview']);
var bgPage = chrome.extension.getBackgroundPage();

function enableAll() {
  $('ul').show();
  $('hr').show();
  $("#tips").hide();
}

function showTip(tip) {
  $('ul').hide();
  $('hr').hide();
  $("#tips").show();
  //i18nReplace("tipContent", tip);

  // force resize
  /*function resize() {
    if(document.height < 100)
      return;

    document.body.style.height = "50px";
    setTimeout(resize, 100);
  }

  resize();*/
}

function init() {
  // UI
  chrome.i18n.getAcceptLanguages(function (languageList) {
    switch (window.navigator.language.substr(0, 2)) {
      case "zh":
        //document.body.style.width = "212px";
        break;
    }
  });

  // Update hot key.
  /*if (HotKey.isEnabled() && HotKey.get('clear') != '@')
    $('clear_element_sc').innerText = 'Ctrl+Alt+' + HotKey.get('clear');
  if (HotKey.isEnabled() && HotKey.get('area') != '@')
    $('capture_area_sc').innerText = 'Ctrl+Alt+' + HotKey.get('area');
  if (HotKey.isEnabled() && HotKey.get('viewport') != '@')
    $('capture_window_sc').innerText = 'Ctrl+Alt+' + HotKey.get('viewport');
  if (HotKey.isEnabled() && HotKey.get('fullpage') != '@')
    $('capture_webpage_sc').innerText = 'Ctrl+Alt+' + HotKey.get('fullpage');
  if (HotKey.isEnabled() && HotKey.get('screen') != '@')
    $('capture_screen_sc').innerText = 'Ctrl+Alt+' + HotKey.get('screen');*/

  // localization
  //i18nReplace("openApp", "openApp");

  // event listener
  $('#config').click(function() {
    _gaq.push(['_trackEvent', 'config', 'clicked']);
    chrome.tabs.create({ url:'options.html'});
    window.close();
  });
  $('#colorpicker').click(function() {
    _gaq.push(['_trackEvent', 'color picker', 'clicked']);
    bgPage.bg.activate();
    window.close();
  });

  // check is capturable
  chrome.tabs.getSelected(null, function (tab) {
    // special chrome pages
    if (tab.url.indexOf('chrome') == 0) {
      showTip("Chrome doesn't allow extensions to interact with special Chrome pages like this one.");
      return;
    }
    // chrome gallery
    else if (tab.url.indexOf('https://chrome.google.com/webstore') == 0) {
      showTip("Chrome doesn't allow extensions to interact with Chrome Web Store.");
      return;
    }
    // local pages
    else if (tab.url.indexOf('file') == 0) {
      showTip("Chrome doesn't allow extensions to interact with local pages.");
      return;
    }

    var insertScript = function () {
      // Google Analytics
      var ga = document.createElement('script');
      ga.type = 'text/javascript';
      ga.async = true;
      ga.src = 'https://ssl.google-analytics.com/ga.js';
      var s = document.getElementsByTagName('script')[0];
      s.parentNode.insertBefore(ga, s);
    }
    setTimeout(insertScript, 500);

    bgPage.bg.useTab(tab);
  });
}

$(document).ready(function() {
  init();
});