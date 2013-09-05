function $(id) {
	return document.getElementById(id);
}
function i18nReplace(id, messageKey) {
	return $(id).innerText = chrome.i18n.getMessage(messageKey);
}
function getLanguage() {
	var lang = (navigator.language || navigator.browserLanguage).toLowerCase().substr(0 , 2);
	//return (lang == "zh") ? "cn" : "en";
	return lang;
}