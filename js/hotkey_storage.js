var HotKey = (function() {
  return {
    setup: function() {
      // Default enable hot key for capture.
      if (!localStorage.getItem('hot_key_enabled'))
        localStorage.setItem('hot_key_enabled', true);

      // Set default hot key of capture, R V H P.
      if (!this.get('rulerH'))
        this.set('rulerH', 'H');
      if (!this.get('rulerV'))
        this.set('rulerV', 'V');
      if (!this.get('colorpicker'))
        this.set('colorpicker', 'C');
    },

    /**
     * Set hot key by type.
     * @param {String} type Hot key type, must be area/viewport/fullpage/screen.
     * @param {String} value
     */
    set: function(type, value) {
      var key = type + '_hot_key';
      localStorage.setItem(key, value);
    },

    get: function(type) {
      return localStorage.getItem(type + '_hot_key');
    },

    getCharCode: function(type) {
      if(this.get(type)) {
        return this.get(type).charCodeAt(0);
      }

      return '';
    },

    enable: function() {
      localStorage.setItem('hot_key_enabled', true);
    },

    disable: function(bg) {
      localStorage.setItem('hot_key_enabled', false);
    },

    isEnabled: function() {
      return localStorage.getItem('hot_key_enabled') == 'true';
    }
  }
})();
