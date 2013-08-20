var EDROPPER_VERSION=8;

var page = {
  width: $(document).width(),
  height: $(document).height(),
  imageData: null,
  canvasBorders: 20,
  canvasData: null,
  dropperActivated: false,
  rulerActivated: false,
  rulerType: { H: 'h', V: 'v' },
  screenWidth: window.innerWidth,
  screenHeight: window.innerHeight,
  themeColor: '#f00',
  canvasUpper: null,
  canvasLower: null,
  options: {cursor: 'default', enableColorToolbox: true, enableColorTooltip: true, enableRightClickDeactivate: true},

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
          sendResponse({version: EDROPPER_VERSION});
          break;
        case 'pickup-activate':
          page.options = req.options;
          page.dropperActivate();
          break;
        case 'hruler-activate':
          page.rulerActivate(page.rulerType.H);
          break;
        case 'vruler-activate':
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
      }
    });
  },

  sendMessage: function(message) {
    chrome.extension.connect().postMessage(message);
  },

  // ---------------------------------
  // DROPPER CONTROL 
  // ---------------------------------

  rulerActivate: function(type) {
    if(page.rulerActivated) {
      return;
    }

    page.rulerActivated = true;

    if(type == page.rulerType.H) {
      document.addEventListener("mousemove", page.dragRulerH, false);
      document.addEventListener("click", page.setRulerH, false);
    }
    else if(type == page.rulerType.V) {
      document.addEventListener("mousemove", page.dragRulerV, false);
      document.addEventListener("click", page.setRulerV, false);
    }

  },

  dropperActivate: function() {
    if (page.dropperActivated)
      return;

    ////console.log('activating page dropper');
    page.defaults();

    page.dropperActivated = true;
    page.screenChanged();

    // set listeners
    $(document).bind('scrollstop', page.onScrollStop);
    document.addEventListener("mousemove", page.onMouseMove, false);
    document.addEventListener("click", page.onMouseClick, false);
    if ( page.options.enableRightClickDeactivate === true ) {
      document.addEventListener("contextmenu", page.onContextMenu, false);
    }
    // enable keyboard shortcuts
    page.shortcuts(true);
  },

  dropperDeactivate: function() {
    if (!page.dropperActivated)
      return;

    // disable keyboard shortcuts
    page.shortcuts(false);

    // reset cursor changes
    $("#eye-dropper-overlay").css('cursor','default');

    page.dropperActivated = false;

    ////console.log('deactivating page dropper');
    document.removeEventListener("mousemove", page.onMouseMove, false);
    document.removeEventListener("click", page.onMouseClick, false);
    if ( page.options.enableRightClickDeactivate === true ) {
      document.removeEventListener("contextmenu", page.onContextMenu, false);
    }
    $(document).unbind('scrollstop', page.onScrollStop);

    //$("#eye-dropper-overlay").remove();
  },

  // ---------------------------------
  // EVENT HANDLING
  // ---------------------------------

  dragRulerH: function(e) {
    if (!page.rulerActivated)
      return;

    page.drawRuler(page.canvasUpper, e.pageX, e.pageY, page.rulerType.H, false);
  },

  setRulerH: function(e) {
    page.canvasUpper.dispose();
    page.drawRuler(page.canvasLower, e.pageX, e.pageY, page.rulerType.H, true);
  },

  dragRulerV: function(e) {
    if (!page.rulerActivated)
      return;

    page.drawRuler(page.canvasUpper, e.pageX, e.pageY, page.rulerType.V, false);
  },

  setRulerV: function(e) {

  },

  onMouseMove: function(e) {
    if (!page.dropperActivated)
      return;

    page.magnifier(e);
  },

  onMouseClick: function(e) {
    if (!page.dropperActivated)
      return;

    e.preventDefault();

    //page.dropperDeactivate();


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

  // keyboard shortcuts
  // enable with argument as true, disable with false
  shortcuts: function(start) {
    // enable shortcuts
    if ( start == true ) {
      shortcut.add('Esc', function(evt) { page.dropperDeactivate(); });
      shortcut.add('U', function(evt) { page.screenChanged(true); });

    // disable shortcuts
    } else {
      shortcut.remove('U');
      shortcut.remove('Esc');
    }
  },


  // right click
  onContextMenu: function(e) {
    if (!page.dropperActivated)
      return;

    e.preventDefault();

    page.dropperDeactivate();
  },

  // window is resized
  onWindowResize: function(e) {
    if (!page.dropperActivated)
      return;

    ////console.log('window resized');

    // set defaults
    page.defaults();

    // width and height changed so we have to get new one
    page.width = $(document).width();
    page.height = $(document).height();
    page.screenWidth = window.innerWidth;
    page.screenHeight = window.innerHeight;

    // also don't forget to set overlay
    $("#eye-dropper-overlay").css('width',page.width).css('height',page.height);

    // call screen chaned
    page.screenChanged();
  },

  // ---------------------------------
  // MISC
  // ---------------------------------

  drawRuler: function(canvas, x, y, type, showdetail) {
    if(type == page.rulerType.H) {
      canvas.dispose();
      var path = new fabric.Path('M 0 ' + y + ' L ' + page.screenWidth + ' ' + y + ' z', {
        left: 0,
        top: 0,
        stroke: page.themeColor,
        strokeWidth: 1,
        fill: false
      });

      canvas.add(path);

      if(showdetail == true) {
        for(var i = 1; i < page.screenWidth / 10; i ++) {
          var path = new fabric.Path('M ' + i * 10 + ' ' + y + ' L ' + i * 10 + ' ' + (y + 5) + ' z', {
            left: 0,
            top: 0,
            stroke: page.themeColor,
            strokeWidth: 1,
            fill: false
          });
          canvas.add(path);
        }
      }

      canvas.renderAll();
    }
    else if(type == page.rulerType.V) {

    }
  },

  drawColorIndicator: function(canvas, centerX, centerY) {
    var rect = new fabric.Rect({
      width: 2,
      height: 2,
      left: centerX -1,
      top: centerY - 1,
      stroke: page.themeColor,
      fill: false,
      selectable: false,
      originX: 'left',
      originY: 'top'
    });
    canvas.add(rect);

    var path = new fabric.Path('M 0 0 L 20 20 z', {
      left: centerX,
      top: centerY,
      stroke: page.themeColor,
      strokeWidth: 1,
      fill: false
    });

    canvas.add(path);
  },

  setColor: function(e) {
    var canvas = page.canvasLower;

    page.drawColorIndicator(canvas, e.pageX, e.pageY);

    canvas.renderAll();
  },

  magnifier: function(e) {
    if (!page.dropperActivated || page.screenshoting)
      return;

    var canvas = page.canvasUpper;
    canvas.dispose();
    var center = {x: e.pageX + 65, y: e.pageY + 70};

    if ( page.screenWidth - (e.pageX-page.XOffset) < 150 )
      center.x = e.pageX - 60;
    if ( page.screenHeight - (e.pageY-page.YOffset) < 180 )
      center.y = e.pageY - 90;

    for(var x = -14; x < 15; x++) {
      for(var y = -10; y < 11; y++) {
        var color = page.pickColor(e.pageX + x, e.pageY + y);
        var rect = new fabric.Rect({
          left: center.x + x * 4,
          top: center.y + y * 4,
          fill: '#'+color.rgbhex,
          width: 4,
          height: 4
        });
        canvas.add(rect);
      }
    }

    var rect = new fabric.Rect({
      left: center.x,
      top: center.y,
      fill: 'rgba(0,0,0,0)',
      strokeWidth: 2,
      stroke: '#ffffff',
      width: 116,
      height: 84
    });
    canvas.add(rect);

    var rect = new fabric.Rect({
      left: center.x - 60,
      top: center.y - 44,
      fill: 'rgba(0,0,0,0)',
      strokeWidth: 1,
      stroke: 'rgba(0,0,0,100)',
      width: 119,
      height: 87,
      originX: 'left',
      originY: 'top'
    });
    canvas.add(rect);

    var rect = new fabric.Rect({
      left: center.x,
      top: center.y + 60,
      fill: 'rgba(0,0,0,1)',
      stroke: false,
      width: 120,
      height: 35
    });
    canvas.add(rect);

    var path = new fabric.Path('M -56 0 L 56 0 M 0 -40 L 0 40 z', {
      left: center.x,
      top: center.y,
      stroke: 'rgba(76,198,255,0.9)',
      strokeWidth: 4
    });
    canvas.add(path);

    var theColor = page.pickColor(e.pageX, e.pageY);
    var text1 = new fabric.Text('#' + String(theColor.rgbhex).toUpperCase(), {
      left: center.x,
      top: center.y + 53,
      fontFamily: 'Arial',
      fontSize: 12,
      fill: '#ffffff'
    });
    canvas.add(text1);
    var text2 = new fabric.Text(
        'RGB:(' + theColor.r + ',' + theColor.g + ',' + theColor.b + ')',
        {
          left: center.x,
          top: center.y + 68,
          fontFamily: 'Arial',
          textAlign: 'left',
          fontSize: 12,
          fill: '#ffffff'
        });
    canvas.add(text2);


    canvas.renderAll();
  },

  tooltip: function(e) {
    if (!page.dropperActivated || page.screenshoting)
      return;

    var color = page.pickColor(e.pageX, e.pageY);
    var fromTop = -15;
    var fromLeft = 10;

    if ( (e.pageX-page.XOffset) > page.screenWidth/2 )
      fromLeft = -20;
    if ( (e.pageY-page.YOffset) < page.screenHeight/2 )
      fromTop = 15;
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
    if (!page.dropperActivated)
      return;

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

    page.screenshoting = true;

    $("#eye-dropper-overlay").css('cursor','progress')

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
      page.screenWidth = image.width;
      page.screenHeight = image.height;

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
      $("#eye-dropper-overlay").css('cursor',page.options.cursor);

      //page.sendMessage({type: 'debug-tab', image: page.canvas.toDataURL()}, function() {});
    }
    image.src = page.imageData;
  },

  init: function() {
    page.messageListener();

    // create overlay div
    $("body").before('<div id="eye-dropper-overlay" style="position: absolute; width: '+page.width+'px; height: '+page.height+'px; opacity: 1; background: none; border: none; z-index: 5000;"><canvas id="c" style="position: absolute;" width="' + page.width + 'px" height="' + page.height + 'px"></canvas><canvas id="d" style="position: absolute;" width="' + page.width + 'px" height="' + page.height + 'px"></canvas></div>');
    page.canvasUpper = new fabric.StaticCanvas('c', { renderOnAddRemove: false });
    page.canvasLower = new fabric.StaticCanvas('d', { renderOnAddRemove: false });
  }
}

page.init();

window.onresize = function() {
  page.onWindowResize();
}
