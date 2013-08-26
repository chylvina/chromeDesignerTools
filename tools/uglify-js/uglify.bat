call handlebars ../../hbs/app.hbs -f ../../hbs/app.tpl.js
call handlebars ../../hbs/app-sub-page.hbs -f ../../hbs/app-sub-page.tpl.js
call handlebars ../../hbs/app-header.hbs -p -f ../../hbs/app-header.tpl.js
call handlebars ../../hbs/app-nav.hbs -p -f ../../hbs/app-nav.tpl.js
call handlebars ../../hbs/app-newslist.hbs -f ../../hbs/app-newslist.tpl.js
call handlebars ../../hbs/app-productlist.hbs -f ../../hbs/app-productlist.tpl.js
call handlebars ../../hbs/app-productlist2.hbs -f ../../hbs/app-productlist2.tpl.js
call handlebars ../../hbs/app-slider.hbs -f ../../hbs/app-slider.tpl.js

call handlebars ../../hbs/app-content.hbs -f ../../hbs/app-content.tpl.js
call handlebars ../../hbs/app-title.hbs -f ../../hbs/app-title.tpl.js
call handlebars ../../hbs/app-subtitle.hbs -f ../../hbs/app-subtitle.tpl.js
call handlebars ../../hbs/app-divider.hbs -f ../../hbs/app-divider.tpl.js
call handlebars ../../hbs/app-image.hbs -f ../../hbs/app-image.tpl.js
call handlebars ../../hbs/app-text.hbs -f ../../hbs/app-text.tpl.js
call handlebars ../../hbs/app-link.hbs -f ../../hbs/app-link.tpl.js
call handlebars ../../hbs/app-phone.hbs -f ../../hbs/app-phone.tpl.js

call handlebars ../../hbs/doc-header.hbs -f ../../hbs/doc-header.tpl.js

call uglifyjs ../../hbs/app.tpl.js ../../hbs/app-header.tpl.js ../../hbs/app-nav.tpl.js ../../hbs/app-newslist.tpl.js ../../hbs/app-productlist.tpl.js ../../hbs/app-productlist2.tpl.js ../../hbs/app-slider.tpl.js ../../hbs/app-sub-page.tpl.js ../../hbs/doc-header.tpl.js ../../hbs/app-content.tpl.js ../../hbs/app-title.tpl.js ../../hbs/app-subtitle.tpl.js ../../hbs/app-divider.tpl.js ../../hbs/app-image.tpl.js ../../hbs/app-text.tpl.js ../../hbs/app-link.tpl.js ../../hbs/app-phone.tpl.js -o ../../js/tpl.js

call uglifyjs ../../js/add2home.js ../../js/vendor/handlebars.runtime-1.0.0.js ../../js/handlebars-extend-1.0.0.js ../../js/helper.js ../../js/iscroll4.js ../../js/plugins.js ../../js/tpl.js ../../js/app.js ../../js/app-hbs.js ../../js/app-remote.js -o ../../js/main.min.js -c -m
call uglifyjs ../../js/add2home.js ../../js/vendor/handlebars.runtime-1.0.0.js ../../js/handlebars-extend-1.0.0.js ../../js/helper.js ../../js/iscroll4.js ../../js/plugins.js ../../js/tpl.js ../../js/app.js ../../js/app-hbs.js ../../js/app-remote.js -o ../../js/main.js