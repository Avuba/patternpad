PatternPad.Fragment({
  scope: {
    test: {
      mockedTouchCoordinates: [
        { x: 174, y: 58 },
        { x: 181, y: 45 },
        { x: 195, y: 64 },
        { x: 219, y: 111 },
        { x: 271, y: 219 },
        { x: 286, y: 274 },
        { x: 295, y: 353 },
        { x: 269, y: 419 },
        { x: 81, y: 412 },
        { x: -34, y: 347 },
        { x: -34, y: 268 },
        { x: -34, y: 102 },
        { x: -19, y: -49 },
        { x: 53, y: -175 }
      ]
    }
  },


  methods: {
    triggerTest: function() {
      var curRound = 0,
        maxRounds = this.scope.test.mockedTouchCoordinates.length;

      var goRound = function() {
        setTimeout(function() {
          // CASE: still moving, restart loop after simulated touch
          if (curRound < maxRounds) {
            var touches = this.scope.test.mockedTouchCoordinates[curRound],
              type = curRound > 0 ? 'touchmove' : 'touchstart';

            var $touch = $('<div></div>');
            $touch.css({
              'position': 'absolute',
              'width': '5px',
              'height': '5px',
              'left': touches.x + 'px',
              'top': touches.y + 'px',
              'background': '#00ffff',
              'z-index': '9999'
            });
            this.scope.$container.append($touch);

            this._simulateTouchEvent(this.scope.container, type, touches);

            curRound++;
            goRound();
          }
          // CASE: touch end, don't restart loop
          else {
            this._simulateTouchEvent(this.scope.container, 'touchend');
          }
        // TODO: research if .apply() can be used
        }.bind(this), 5);
      // TODO: research if .apply() can be used
      }.bind(this);

      goRound();
    },


    _simulateTouchEvent: function(target, type, touches) {
      var event = document.createEvent('TouchEvent');
      event.initUIEvent(type, true, true);

      event.data = { isSimulated: true };
      // dirty but chrome does not support the creation of touch lists
      if (touches) event.data.touches = [{ pageX: touches.x, pageY: touches.y }];

      target.dispatchEvent(event);
    }
  }
});