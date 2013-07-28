function isWindowsOrLinuxPlatform() {
  return navigator.userAgent.toLowerCase().indexOf('windows') > -1 ||
      navigator.userAgent.toLowerCase().indexOf('linux') > -1;
}

var isWindowsOrLinux = isWindowsOrLinuxPlatform();

// Google Analytics
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-20877394-1']);
_gaq.push(['_trackPageview']);

function toDo(evt) {
  var bg = chrome.extension.getBackgroundPage();

  // google analysis
  _gaq.push(['_trackEvent', evt.currentTarget.id, 'clicked']);

  switch (evt.currentTarget.id) {
    case 'clear_element':
      chrome.windows.getCurrent(function (wnd) {
        chrome.tabs.getSelected(wnd.id, function (tab) {
          chrome.tabs.sendRequest(tab.id, {command:'Block'});
          window.close();
        });
      });
      break;
    case 'capture_window':
      bg.screenshot.captureWindow();
      window.close();
      break;
    case 'capture_area':
      bg.screenshot.showSelectionArea();
      window.close();
      break;
    case 'capture_webpage':
      bg.screenshot.captureWebpage();
      showTip("capturing", true);
      break;
    case 'capture_special_page':
      bg.screenshot.captureSpecialPage();
      window.close();
      break;
    case 'capture_screen':
      bg.screenshot.captureScreen();
      window.close();
      break;
    case 'openApp':
      window.close();
      chrome.tabs.create({
        url:"http://quick-markup.com/app"
      });
      break;
    case 'openMindmap':
      window.close();
      chrome.tabs.create({
        url:"http://quick-markup.com/mindmap"
      });
      break;
  }
}

function enableAll() {
  $("clear_element").style.display = "block";
  $("capture_area").style.display = "block";
  $("capture_webpage").style.display = "block";
  $("capture_window").style.display = "block";
  $("capture_special_page").style.display = "none";

  if (isWindowsOrLinux) {
    $("capture_screen").style.display = "block";
    $('config').style.display = 'block';
    $('hRuler02').style.display = 'block';
  }
  else {
    $("capture_screen").style.display = "none";
    $('config').style.display = 'none';
    $('hRuler01').style.display = 'none';
    $('hRuler02').style.display = 'none';
  }

  $("tips").style.display = "none";
}

function enableSpecial(isChrome) {
  $("clear_element").style.display = "none";
  $("capture_area").style.display = "none";
  $("capture_webpage").style.display = "none";

  isChrome ? $("capture_special_page").style.display = "none"
              : $("capture_special_page").style.display = "block";

  $("capture_window").style.display = "none";

  if(isWindowsOrLinux) {
    $("capture_screen").style.display = "block";
    $('config').style.display = 'block';
    $('hRuler02').style.display = 'block';
  }
  else {
    $("capture_screen").style.display = "none";
  }

  $("tips").style.display = "none";
}

function showTip(tip, showIcon) {
  //
  $("clear_element").style.display = "none";
  $("capture_area").style.display = "none";
  $("capture_webpage").style.display = "none";
  $("capture_special_page").style.display = "none";
  $("capture_window").style.display = "none";
  $("capture_screen").style.display = "none";
  $("select-block").style.display = "none";
  $("config-block").style.display = "none";
  $("hRuler01").style.display = "none";
  $("hRuler02").style.display = "none";

  $("tips").style.display = "block";
  $("loadingIcon").style.display = (showIcon ? "block" : "none");
  i18nReplace("tipContent", tip);

  // force resize
  function resize() {
    if(document.height < 100)
      return;

    document.body.style.height = "50px";
    setTimeout(resize, 100);
  }

  resize();
}

function init() {
  // UI
  chrome.i18n.getAcceptLanguages(function (languageList) {
    switch (window.navigator.language.substr(0, 2)) {
      case "zh":
        document.body.style.width = "212px";
        break;
      case "fr":
        document.body.style.width = "300px";
        break;
      case "de":
        document.body.style.width = "270px";
        break;
      case "ja":
        document.body.style.width = "270px";
        break;
      case "it":
        document.body.style.width = "250px";
        break;
    }
  });

  $('config').addEventListener('click', function () {
    chrome.tabs.create({ url:'options.html'});
  }, false);

  // Update hot key.
  if (HotKey.isEnabled() && HotKey.get('clear') != '@')
    $('clear_element_sc').innerText = 'Ctrl+Alt+' + HotKey.get('clear');
  if (HotKey.isEnabled() && HotKey.get('area') != '@')
    $('capture_area_sc').innerText = 'Ctrl+Alt+' + HotKey.get('area');
  if (HotKey.isEnabled() && HotKey.get('viewport') != '@')
    $('capture_window_sc').innerText = 'Ctrl+Alt+' + HotKey.get('viewport');
  if (HotKey.isEnabled() && HotKey.get('fullpage') != '@')
    $('capture_webpage_sc').innerText = 'Ctrl+Alt+' + HotKey.get('fullpage');
  if (HotKey.isEnabled() && HotKey.get('screen') != '@')
    $('capture_screen_sc').innerText = 'Ctrl+Alt+' + HotKey.get('screen');

  // localization
  i18nReplace("openApp", "openApp");
  i18nReplace("openMindmap", "openMindmap");
  i18nReplace("capture_window_text", "capture_window");
  i18nReplace("clear_element_text", "clear_element");
  i18nReplace("capture_area_text", "capture_area");
  i18nReplace("capture_webpage_text", "capture_webpage");
  i18nReplace("capture_special_page", "capture_window");
  i18nReplace("capture_screen_text", "capture_screen");
  i18nReplace("config", "option");

  // event listener
  $('clear_element').addEventListener('click', toDo, false);
  $('capture_window').addEventListener('click', toDo, false);
  $('capture_area').addEventListener('click', toDo, false);
  $('capture_webpage').addEventListener('click', toDo, false);
  $('capture_special_page').addEventListener('click', toDo, false);
  $('capture_screen').addEventListener('click', toDo, false);
  $('openApp').addEventListener('click', toDo, false);
  $('openMindmap').addEventListener('click', toDo, false);

  // default
  enableAll();

  var isScriptLoad = false;
  // check is capturable
  chrome.tabs.getSelected(null, function (tab) {
    if (tab.url.indexOf('chrome') == 0 || tab.url.indexOf('about') == 0) {
      enableSpecial(true);
      return;
    }
    else {
      enableSpecial(false);
    }

    chrome.tabs.sendRequest(tab.id, {msg:'is_page_capturable'},
        function (response) {
          isScriptLoad = true;
          if (response.msg == 'capturable') {
            enableAll();
          } else if (response.msg == 'uncapturable') {
            enableSpecial(true);
          } else {
            showTip("loading", false);
          }
        });

    var insertScript = function () {
      if (isScriptLoad == false) {
        chrome.tabs.executeScript(null, {file:'javascripts/isLoad.js'});
        chrome.tabs.getSelected(null, function (tab) {
          if (tab.url.indexOf('chrome') == 0 ||
              tab.url.indexOf('about') == 0) {
            enableSpecial(true);
          } else {
            enableSpecial(false);
          }
        });
      }

      // Google Analytics
      (function () {
        var ga = document.createElement('script');
        ga.type = 'text/javascript';
        ga.async = true;
        ga.src = 'https://ssl.google-analytics.com/ga.js';
        var s = document.getElementsByTagName('script')[0];
        s.parentNode.insertBefore(ga, s);
      })();
    }
    setTimeout(insertScript, 500);
  });

  chrome.extension.onRequest.addListener(function (request, sender, response) {
    switch (request.msg) {
      case 'closePopup':
        //window.close();
        break;
    }
  });
}

document.addEventListener('DOMContentLoaded', function () {
  init();
});