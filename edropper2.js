var page = {
  width: $(document).width(),
  height: $(document).height(),
  imageData: null,
  canvasBorders: 20,
  canvasData: null,
  dropperActivated: false,
  rulerActivated: false,
  magnifierActivated: false,
  hidden: false,
  rulerType: { H: 'h', V: 'v' },
  screenWidth: window.innerWidth,
  screenHeight: window.innerHeight,
  stage: null,
  stageUpper: null,
  stageLower: null,
  stageCount: 0,
  magnifier: null,
  previewRulerH: null,
  previewRulerV: null,
  themeColor: '#f00',
  layerUpper: null,
  layerLower: null,
  stage: null,

  defaults: function() {
    page.canvas = document.createElement("canvas");
    page.rects = [];
    page.screenshoting = false;
  },

  // ---------------------------------
  // MESSAGING 
  // ---------------------------------
  messageListener: function() {
    // Listen for pickup activate
    ////console.log('page activated');
    chrome.runtime.onMessage.addListener(function(req, sender, sendResponse) {
      switch(req.type) {
        case 'edropper-loaded':
          sendResponse({dropperLoaded : true});
          break;
        case 'pickup-activate':
          page.themeColor = req.options.themeColor;
          page.dropperActivate();
          break;
        case 'hruler-activate':
          page.themeColor = req.options.themeColor;
          page.rulerActivate(page.rulerType.H);
          break;
        case 'vruler-activate':
          page.themeColor = req.options.themeColor;
          page.rulerActivate(page.rulerType.V);
          break;
        case 'pickup-deactivate':
          page.dropperDeactivate();
          break;
        case 'update-image':
          ////console.log('background send me updated screenshot');
          page.imageData = req.data;
          page.capture();
          break;
        case 'cancel':
          page.onCancel();
          break;
      }
    });
  },

  sendMessage: function(message) {
    chrome.extension.connect().postMessage(message);
  },

  i18nReplace: function (id, messageid) {
    return $('#' + id).text(chrome.i18n.getMessage(messageid || id));
  },

  // ---------------------------------
  // DROPPER CONTROL 
  // ---------------------------------

  rulerActivate: function(type) {
    if(page.rulerActivated) {
      return;
    }

    page.rulerActivated = true;
    $('#designertools-c1').show();
    page.show();
    page.i18nReplace("designertools-tip", "rulerActivatedTip");
    page.i18nReplace("designertools-esc", "deactivateTip");

    page.screenChanged();
    page.magnifierActivate();

    if(type == page.rulerType.H) {
      if(!page.previewRulerH) {
        page.previewRulerH = new Kinetic.Line({
          points: [0, 0.5, page.width, 0.5],
          stroke: page.themeColor,
          strokeWidth: 1
        });
      }

      page.layerUpper.add(page.previewRulerH);

      document.addEventListener("mousemove", page.dragRulerH, false);
      document.addEventListener("click", page.setRulerH, false);
    }
    else if(type == page.rulerType.V) {
      if(!page.previewRulerV) {
        page.previewRulerV = new Kinetic.Line({
          points: [0.5, 0, 0.5, page.height],
          stroke: page.themeColor,
          strokeWidth: 1
        });
      }

      page.layerUpper.add(page.previewRulerV);

      document.addEventListener("mousemove", page.dragRulerV, false);
      document.addEventListener("click", page.setRulerV, false);
    }
  },

  rulerDeactivate: function() {
    if(!page.rulerActivated) {
      return;
    }

    page.rulerActivated = false;

    page.i18nReplace("designertools-tip", "designertoolsActivatedTip");
    page.i18nReplace("designertools-esc", "hideTip");

    if(page.previewRulerH) {
      page.previewRulerH.remove();
    }
    if(page.previewRulerV) {
      page.previewRulerV.remove();
    }

    page.magnifierDeactivate();

    document.removeEventListener("mousemove", page.dragRulerH, false);
    document.removeEventListener("click", page.setRulerH, false);
    document.removeEventListener("mousemove", page.dragRulerV, false);
    document.removeEventListener("click", page.setRulerV, false);
  },

  dropperActivate: function() {
    if (page.dropperActivated)
      return;

    page.dropperActivated = true;

    $('#designertools-c1').show();
    page.show();
    page.i18nReplace("designertools-tip", "colorpickerActivatedTip");
    page.i18nReplace("designertools-esc", "deactivateTip");

    page.screenChanged();

    page.magnifierActivate();

    // set listeners
    $(document).bind('scrollstop', page.onScrollStop);
    document.addEventListener("mousemove", page.onMouseMove, false);
    document.addEventListener("click", page.onMouseClick, false);
  },

  dropperDeactivate: function() {
    if (!page.dropperActivated)
      return;

    // reset cursor changes
    $("#designertools-overlay").css('cursor','default');

    page.dropperActivated = false;

    $('#designertools-c1').show();
    page.i18nReplace("designertools-tip", "designertoolsActivatedTip");
    page.i18nReplace("designertools-esc", "hideTip");

    page.magnifierDeactivate();

    ////console.log('deactivating page dropper');
    document.removeEventListener("mousemove", page.onMouseMove, false);
    document.removeEventListener("click", page.onMouseClick, false);
    $(document).unbind('scrollstop', page.onScrollStop);
  },

  // ---------------------------------
  // EVENT HANDLING
  // ---------------------------------

  dragRulerH: function(e) {
    if (!page.rulerActivated)
      return;

    page.previewRulerH.setPosition(0, e.pageY -page.YOffset);
  },

  setRulerH: function(e) {
    var group = new Kinetic.Group();
    group.add(new Kinetic.Line({
      points: [0, 0.5, page.width, 0.5],
      stroke: page.themeColor,
      strokeWidth: 1
    }));
    for(var i = 1; i < page.width / 10; i ++) {
      var l = 4.5;
      if(i%10 == 0) {
        l = 8.5;
      }

      group.add(new Kinetic.Line({
        points: [i*10 + 0.5, 0.5, i*10 + 0.5, l],
        stroke: page.themeColor,
        strokeWidth: 1
      }));
    }
    group.setPosition(0, e.pageY);
    page.layerLower.add(group);
    page.layerLower.batchDraw();
  },

  dragRulerV: function(e) {
    if (!page.rulerActivated)
      return;

    page.previewRulerV.setPosition(e.pageX - -page.XOffset, 0);
  },

  setRulerV: function(e) {
    var group = new Kinetic.Group();
    group.add(new Kinetic.Line({
      points: [0.5, 0, 0.5, page.height],
      stroke: page.themeColor,
      strokeWidth: 1
    }));
    for(var i = 1; i < page.height / 10; i ++) {
      var l = 4.5;
      if(i%10 == 0) {
        l = 8.5;
      }

      group.add(new Kinetic.Line({
        points: [0.5, i*10 + 0.5, l, i*10 + 0.5],
        stroke: page.themeColor,
        strokeWidth: 1
      }));
    }
    group.setPosition(e.pageX, 0);
    page.layerLower.add(group);
    page.layerLower.batchDraw();
  },

  onMouseMove: function(e) {
    if (!page.dropperActivated)
      return;

  },

  onMouseClick: function(e) {
    if (!page.dropperActivated)
      return;

    e.preventDefault();

    //page.dropperDeactivate();

    page.layerUpper.clear();


    page.setColor(e);
  },

  onScrollStop: function() {
    if (!page.dropperActivated)
     return;

    ////console.log("Scroll stop");
    page.screenChanged();
  },

  onScrollStart: function() {
    if (!page.dropperActivated)
     return;
  },

  // right click
  onContextMenu: function(e) {
    if (!page.dropperActivated)
      return;

    e.preventDefault();

    page.dropperDeactivate();
  },

  // window is resized
  onWindowResize: function() {
    if (!page.dropperActivated)
      return;

    ////console.log('window resized');

    // set defaults
    page.defaults();

    // width and height changed so we have to get new one
    page.width = $(document).width();
    page.height = $(document).height();
    page.screenWidth = $(window).width();
    page.screenHeight = $(window).height();

    // also don't forget to set overlay
    $("#designertools-overlay").css('height',page.height);

    // call screen chaned
    page.screenChanged();
  },

  // ---------------------------------
  // MISC
  // ---------------------------------

  drawColorIndicator: function(layer, centerX, centerY) {
    var color = '#' + (page.pickColor(centerX, centerY).rgbhex).toUpperCase();

    var xFactor = 1,
        yFactor = 1;

    if ( page.screenWidth - (centerX-page.XOffset) < 150 )
      xFactor = -1;
    if ((centerY-page.YOffset) < 180 )
      yFactor = -1;

    var group1 = new Kinetic.Group({
      x: centerX,
      y: centerY,
      rotation: -Math.atan(3/4 * (yFactor*xFactor)) + ((xFactor == -1) ? Math.PI : 0)
    });
    group1.add(new Kinetic.Line({
          points: [0, 0, 4, 3],
          stroke: page.themeColor,
          strokeWidth: 1
        })).add(new Kinetic.Line({
          points: [0, 0, 4, -3],
          stroke: page.themeColor,
          strokeWidth: 1
        })).add(new Kinetic.Line({
          points: [0, 0, 50, 0],
          stroke: page.themeColor,
          strokeWidth: 1
        }));

    var group2 = new Kinetic.Group({
      x: centerX + 40*xFactor,
      y: centerY - 30*yFactor
    });
    group2.add(new Kinetic.Rect({
          x: -5,
          y: -5,
          width: 10,
          height: 10,
          fill: page.themeColor
        })).add(new Kinetic.Rect({
          x: -4,
          y: -4,
          width: 8,
          height: 8,
          fill: color
        }));

    var group3 = new Kinetic.Group({
      x: centerX + 75*xFactor,
      y: centerY - 30*yFactor
    });
    group3.add(new Kinetic.Text({
          x: -24,
          y: -6,
          fontFamily: 'Arial',
          fontSize: 12,
          fill: '#ffffff',
          stroke: '#ffffff',
          strokeWidth: 2,
          text: color
        })).add(new Kinetic.Text({
          x: -24,
          y: -6,
          fontFamily: 'Arial',
          fontSize: 12,
          fill: page.themeColor,
          text: color
        }));

    layer.add(group1).add(group2).add(group3);
    layer.batchDraw();
  },

  setColor: function(e) {
    page.drawColorIndicator(page.layerLower, e.pageX, e.pageY);
  },

  magnifierActivate: function() {
    if(page.magnifierActivated) {
      return;
    }

    page.magnifierActivated = true;

    if(!page.magnifier) {
      page.magnifier = new Kinetic.Group({
        x: 0,
        y: 0
      });

      for (var x = -14; x < 15; x++) {
        for (var y = -10; y < 11; y++) {
          var rect = new Kinetic.Rect({
            x: x * 4 - 3,
            y: y * 4 - 3,
            width: 4,
            height: 4,
            fill: '#ffffff',
            id: x + '*' + y,
            name: 'colorRect'
          });
          page.magnifier.add(rect);
        }
      }

      page.magnifier.add(new Kinetic.Rect({
            x: -61,
            y: -45,
            fill: 'rgba(0,0,0,0)',
            strokeWidth: 2,
            stroke: 'rgba(0,0,0,100)',
            width: 120,
            height: 88
          })).add(new Kinetic.Rect({
            x: -60,
            y: -44,
            strokeWidth: 2,
            stroke: '#ffffff',
            width: 118,
            height: 86
          })).add(new Kinetic.Rect({
            x: -62,
            y: 43,
            fill: 'rgba(0,0,0,1)',
            width: 122,
            height: 36
          })).add(new Kinetic.Text({
            x: -54,
            y: 48,
            fontFamily: 'Arial',
            fontSize: 12,
            fill: '#ffffff',
            text: 'abc'
          })).add(new Kinetic.Text({
            x: -54,
            y: 63,
            fontFamily: 'Arial',
            textAlign: 'left',
            fontSize: 12,
            fill: '#ffffff',
            text: 'def'
          })).add(new Kinetic.Line({
            points: [-58, -1, 56, -1],
            stroke: 'rgba(76,198,255,0.9)',
            strokeWidth: 4
          })).add(new Kinetic.Line({
            points: [-1, -42, -1, 40],
            stroke: 'rgba(76,198,255,0.9)',
            strokeWidth: 4
          }));
    }

    page.layerUpper.add(page.magnifier);
    document.addEventListener("mousemove", page.dragMagnifier, false);
  },

  magnifierDeactivate: function() {
    if(!page.magnifierActivated) {
      return;
    }

    page.magnifierActivated = false;

    if(page.magnifier) {
      page.magnifier.remove();
    }

    document.removeEventListener("mousemove", page.dragMagnifier, false);
  },

  dragMagnifier: function(e) {
    if (page.screenshoting)
      return;

    var center = {x: e.pageX -page.XOffset + 65, y: e.pageY -page.YOffset + 70};

    if ( page.screenWidth - (e.pageX-page.XOffset) < 150 )
      center.x = e.pageX -page.XOffset - 60;
    if ( page.screenHeight - (e.pageY-page.YOffset) < 180 )
      center.y = e.pageY -page.YOffset - 90;

    page.magnifier.setPosition(center.x, center.y);
    var theColor = page.pickColor(e.pageX, e.pageY);
    page.magnifier.get('Text').each(function(text, n) {
      if(n == 0) {
        text.setText('#' + String(theColor.rgbhex).toUpperCase());
      }
      else if(n == 1) {
        text.setText('RGB:(' + theColor.r + ',' + theColor.g + ',' + theColor.b + ')');
      }
    });
    page.magnifier.get('.colorRect').each(function(rect, index) {
      var n = rect.getId().split('*');
      rect.setFill('#' + page.pickColor(e.pageX + Number(n[0]), e.pageY + Number(n[1])).rgbhex);
    });

    page.layerUpper.batchDraw();
  },

  // return true if rectangle A is whole in rectangle B
  rectInRect: function(A, B) {
    if ( A.x >= B.x && A.y >= B.y && (A.x+A.width) <= (B.x+B.width) && (A.y+A.height) <= (B.y+B.height) )
      return true;
    else
      return false;
  },

  // found out if two points and length overlaps
  // and merge it if needed. Helper method for
  // rectMerge
  rectMergeGeneric: function(a1, a2, length) {
    // switch them if a2 is above a1
    if ( a2 < a1 ) { tmp = a2; a2 = a1; a1 = tmp; }

    // shapes are overlaping
    if ( a2 <= a1 + length )
        return {a: a1, length: (a2-a1) + length};
    else
        return false;

  },

  // merge same x or y positioned rectangles if overlaps
  // width (or height) of B has to be equal to A
  rectMerge: function(A, B) {
    var t;

    // same x position and same width
    if ( A.x == B.x && A.width == B.width ) {
      t = page.rectMergeGeneric(A.y, B.y, A.height);

      if ( t != false ) {
        A.y = t.a;
        A.height = length;
        return A;
      }

    // same y position and same height
    } else if ( A.y == B.y && A.height == B.height ) {
      t = page.rectMergeGeneric(A.x, B.x, A.width);

      if ( t != false ) {
        A.x = t.a;
        A.width = length;
        return A;
      }
    }

    return false;
  },

  // ---------------------------------
  // COLORS
  // ---------------------------------

  pickColor: function(x, y) {
    if ( page.canvasData === null )
      return;

    var canvasIndex = (x + y * page.canvas.width) * 4;
    ////console.log(e.pageX + ' ' + e.pageY + ' ' + page.canvas.width);

    var color = {
      r: page.canvasData[canvasIndex],
      g: page.canvasData[canvasIndex+1],
      b: page.canvasData[canvasIndex+2],
      alpha: page.canvasData[canvasIndex+3]
    };

    color.rgbhex = page.rgbToHex(color.r,color.g,color.b);
    ////console.log(color.rgbhex);
    color.opposite = page.rgbToHex(255-color.r,255-color.g,255-color.b);
    return color;
  },

  // i: color channel value, integer 0-255
  // returns two character string hex representation of a color channel (00-FF)
  toHex: function(i) {
    if(i === undefined) return 'FF'; // TODO this shouldn't happen; looks like offset/x/y might be off by one
    var str = i.toString(16);
    while(str.length < 2) { str = '0' + str; }
    return str;
  },

  // r,g,b: color channel value, integer 0-255
  // returns six character string hex representation of a color
  rgbToHex: function(r,g,b) {
    return page.toHex(r)+page.toHex(g)+page.toHex(b);
  },

  // ---------------------------------
  // UPDATING SCREEN 
  // ---------------------------------

  checkCanvas: function() {
    // we have to create new canvas element 
    if ( page.canvas.width != (page.width+page.canvasBorders) || page.canvas.height != (page.height+page.canvasBorders) ) {
      ////console.log('creating new canvas');
      page.canvas = document.createElement('canvas');
      page.canvas.width = page.width + page.canvasBorders;
      page.canvas.height = page.height + page.canvasBorders;
      page.canvasContext = page.canvas.getContext('2d');
      page.rects = [];
    }
  },

  screenChanged: function(force) {
    page.YOffset = $(document).scrollTop();
    page.XOffset = $(document).scrollLeft();

    var rect = {x: page.XOffset, y: page.YOffset, width: page.screenWidth, height: page.screenHeight};

    // don't screenshot if we already have this one
    if ( !force && page.rects.length > 0 ) {
      for ( index in page.rects ) {
        if ( page.rectInRect(rect, page.rects[index]) ) {
          ////console.log('uz mame, nefotim');
          return;
        }
      }
    }

    $('#designertools-stageUpper')
    .css('top', window.scrollY + 'px')
    .css('left', window.scrollX + 'px');

    page.screenshoting = true;

    $("#designertools-overlay").css('cursor','progress')

    ////console.log('I want new screenshot');
    page.sendMessage({type: 'screenshot'}, function() {});

  },

  // capture actual Screenshot
  capture: function() {
    page.checkCanvas();
    ////console.log(page.rects);

//    var image = new Image();
    var image = document.createElement('img');

    image.onload = function() {
      /*page.screenWidth = image.width;
      page.screenHeight = image.height;*/

      var rect = {x: page.XOffset, y: page.YOffset, width: image.width, height: image.height};
      var merged = false;

      // if there are already any rectangles
      if ( page.rects.length > 0 ) {
        // try to merge shot with others
        for ( index in page.rects ) {
          var t = page.rectMerge(rect, page.rects[index]);

          if ( t != false ) {
            ////console.log('merging');
            merged = true;
            page.rects[index] = t;
          }
        }
      }

      // put rectangle in array
      if (merged == false)
        page.rects.push(rect);

      page.canvasContext.drawImage(image, page.XOffset, page.YOffset);
      page.canvasData = page.canvasContext.getImageData(0, 0, page.canvas.width, page.canvas.height).data;
      // TODO - je nutne refreshnout ctverecek a nastavit mu spravnou barvu

      page.screenshoting = false;
      $("#designertools-overlay").css('cursor','default');

      //page.sendMessage({type: 'debug-tab', image: page.canvas.toDataURL()}, function() {});
    }
    image.src = page.imageData;
  },

  show: function() {
    page.hidden = false;
    $('#designertools-overlay').show();

    page.i18nReplace("designertools-tip", "designertoolsActivatedTip");
    page.i18nReplace("designertools-esc", "hideTip");
  },

  hide: function() {
    page.hidden = true;
    $('#designertools-overlay').hide();

    page.i18nReplace("designertools-tip", "designertoolsDeactivatedTip");
    page.i18nReplace("designertools-esc", "showTip");
  },

  onCancel: function(isClick) {
    if(page.dropperActivated) {
      page.dropperDeactivate();
      page.layerUpper.draw();
      return;
    }
    else if(page.rulerActivated) {
      page.rulerDeactivate();
      page.layerUpper.draw();
      return;
    }

    if(!isClick)
      return;

    if(page.hidden) {
      page.show();
    }
    else {
      page.hide();
    }
  },

  init: function() {
    if (document.body.hasAttribute('designertools_injected')) {
      return;
    }
    document.body.setAttribute('designertools_injected', true);

    page.width = $(document).width();
    page.height = $(document).height();
    page.screenWidth = $(window).width();
    page.screenHeight = $(window).height();

    page.messageListener();

    // create overlay div
    $("body").before('<div id="designertools-c1">' +
        '<div id="designertools-c2"><div id="designertools-c3">' +
        '<span id="designertools-tip">' +
        '</span><span id="designertools-esc"></span>' +
        '</div><img id="designertools-close" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAALFJREFUeNqMkk0OAUEQhSvE2PgNzmVOYCEWbkTib2QwiMS1LIkDjNe8SiqlJV7yLebVT1dXj8hHYzADDflWC+RgqsYI3EEJdkxQdcCJsQcby4KGEroloA72LrbWLrkLbIn1jqCrRzdB5hIsZ5usqvJIn1xwvLcqpiD5saUy4kkfXP8daRBJ3oBVpKgnvL0NHDheLbK9ZSiYgCeNi9tG2zS8gaGYXyPjm3gFbw7S8PESYACUf0fkQ53xHwAAAABJRU5ErkJggg=="></div></div>')
        .before('<div id="designertools-overlay" style="height: '+page.height+'px;"><div id="designertools-stageUpper"></div><div id="designertools-stageLower"></div></div>');

    page.show();

    var handlKeyboard = function(e) {
      var keyCode = e.keyCode;

      if(keyCode == 27) {   // ESC
        return page.onCancel(false);
      }
    }

    page.stageLower = new Kinetic.Stage({
      container: 'designertools-stageLower',
      width: page.width,
      height: page.height
    });
    page.layerLower = new Kinetic.Layer();
    page.stageLower.add(page.layerLower);

    page.stageUpper = new Kinetic.Stage({
      container: 'designertools-stageUpper',
      width: page.screenWidth,
      height: page.screenHeight
    });
    page.layerUpper = new Kinetic.Layer();
    page.stageUpper.add(page.layerUpper);

    $('#designertools-esc').click(function() {
      page.onCancel(true);
    });
    $('body').keydown(handlKeyboard);

    $('#designertools-close').click(function() {
      $('#designertools-c1').hide();
    });

    page.defaults();
  }
}

page.init();

window.onresize = function() {
  page.onWindowResize();
}