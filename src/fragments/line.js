PatternPad.Fragment({
  name: 'line',


  EVENTS: {
    line: {
      start: 'line:start',
      hit: 'line:hit',
      end: 'line:end'
    }
  },


  // TODO: add min and max number
  scope: {
    line: {
      currentDot: null,
      currentSegment: {
        start: { x: 0, y: 0 },
        end: { x: 0, y: 0 },
        $elem: null
      },
      $segments: [],
    },
    multipleHits: false,
    pattern: []
  },


  hooks: {
    onInit: function() {
      // TODO: fuck jQuery
      this.scope.$container = $(this.scope.container);
      // TODO: optimise offset topic, not really well solved atm.
      this.scope.containerOffset = this.scope.$container.offset();

      this._listen(this.scope.container, 'touchstart', this._onTouchStart);
      this._listen(this.scope.container, 'touchmove', this._onTouchMove);
      this._listen(this.scope.container, 'touchend', this._onTouchEnd);
      this._listen(this.scope.container, 'touchcancel', this._onTouchCancel);
    }
  },


  methods: {

    // TOUCH HANDELRS

    _onTouchStart: function(event) {
      event.preventDefault();

      // start from a clean slate every time
      // TODO: put stuff into reset event
      this.refresh();

      if (event.data && event.data.isSimulated) {
        // dirty but chrome does not support the creation of touch lists
        this._startLine(event.data.touches[0].pageX, event.data.touches[0].pageY);
      } else {
        this._startLine(event.touches[0].pageX, event.touches[0].pageY);
      }

      this._checkForIntersection();

      this._dispatch(this.EVENTS.line.start);
    },


    _onTouchMove: function(event) {
      event.preventDefault();

      if (event.data && event.data.isSimulated) {
        // dirty but chrome does not support the creation of touch lists
        this._updateLine(event.data.touches[0].pageX, event.data.touches[0].pageY);
      } else {
        this._updateLine(event.touches[0].pageX, event.touches[0].pageY);
      }

      this._checkForIntersection();
    },


    _onTouchEnd: function(event) {
      event.preventDefault();

      this.scope.line.$segments[this.scope.line.$segments.length - 1].addClass('is-last');
      this._dispatch(this.EVENTS.line.end, { pattern: fUtils.fastCloneArray(this.scope.pattern) });
    },


    _onTouchCancel: function(event) {
      event.preventDefault();
    },


    // LINE METHODS


    _startLine: function(lineX, lineY) {
      // TODO: would a request animation frame make sense?
      this.scope.line.currentSegment.start.x = lineX;
      this.scope.line.currentSegment.start.y = lineY;

      // we need to define the enpoints already at line start because
      // intersection detection uses the endpoint as key reference.
      // TODO: explain in detail why the + 1 trick is required (because of
      // ppMaths.doesLineIntersectCircle NaN thingy)
      this.scope.line.currentSegment.end.x = lineX + 1;
      this.scope.line.currentSegment.end.y = lineY + 1;

      var isFirstSegment = this.scope.line.$segments.length < 1;

      // TODO: think about http://mir.aculo.us/2011/03/09/little-helpers-a-tweet-sized-javascript-templating-engine/
      this.scope.line.currentSegment.$elem = $('<div \
        class="line' + (isFirstSegment ? ' is-first' : '') + '" style=" \
        left:' + (this.scope.line.currentSegment.start.x -  this.scope.containerOffset.left) + 'px; \
        top:' + (this.scope.line.currentSegment.start.y -  this.scope.containerOffset.top) + 'px; \
        "></div>');

      this.scope.$container.append(this.scope.line.currentSegment.$elem);
      this.scope.line.$segments.push(this.scope.line.currentSegment.$elem);
    },


    _updateLine: function(lineX, lineY) {
      // TODO: would a request animation frame make sense?
      this.scope.line.currentSegment.end.x = lineX;
      this.scope.line.currentSegment.end.y = lineY;

      this.scope.line.currentSegment.$elem.css({
        'width': ppMaths.getDistance(this.scope.line.currentSegment.start, this.scope.line.currentSegment.end) + 'px',
        // TODO: explain why translateY(-50%) - see end of 'transform:'
        'transform': 'rotate(' + ppMaths.getAngle(this.scope.line.currentSegment.start, this.scope.line.currentSegment.end) + 'deg) translateY(-50%)'
      });
    },


    _resetLine: function() {
      var linesLength = this.scope.line.$segments.length;
      // remove all line segments
      // TODO: research if all should be batched inside one dom operation
      // TODO: research of requestAnimFrame should be used
      for (var i = 0; i < linesLength; i++) this.scope.line.$segments[i].remove();
      // clear array
      this.scope.line.$segments.length = 0;
    },


    _checkForIntersection: function() {
      var numberOfDots = this.scope.dotCollection.length,
        hitDots = [];

      // STEP #1: iterate over all dots and find the ones that got hit by the
      // line. there are two important things to notice:
      // - more than one dot can get hit during one touch event, which means
      //   we're not allowed to exit the loop after one hit
      // - the loop processes the dots in ascending order (1,2,3) - however, as
      //   the user might hit the dots in a different order (9,8,7), we need
      //   to store the distance to the line start and use it for ordering
      //   dots that got hit for later processing

      // TODO: check execution speed, optimised intersection alg. if requried,
      // only focus on points next to line if required
      for (var i = 0; i < numberOfDots; i++) {
        var dot = this.scope.dotCollection[i];

        // CASE: dot is currently active and therefore blocked
        if (dot.isActive) continue;
        // CASE: dot was already hit and multiple hits are not allowed
        if (!this.scope.multipleHits && dot.numberOfHits > 0) continue;
        // CASE: line does not intersect
        if (!ppMaths.doesLineIntersectCircle(this.scope.line.currentSegment.start, this.scope.line.currentSegment.end, dot)) continue;

        dot.isActive = true;
        dot.numberOfHits++;
        // save distance to line for determining which dot gets processed first
        dot.distanceToLineStart = ppMaths.getDistance(this.scope.line.currentSegment.start, dot);
        // TODO: think about putting this into a requestAnimationFrame
        dot.$elem.addClass('active');

        hitDots.push(dot);

        // don't exit loop as two dots can get hit in the same cycle
        continue;
      }

      var numberOfHitDots = hitDots.length;
      if (!numberOfHitDots) return;

      // STEP #2: process the hit dots
      // - sort the hit dots based on their distance to the line start in
      //   ascending order, which means the dot furthest away ends up last
      // - process (= push into array, send out event with current pattern) the
      //   hit dots based on their order

      hitDots.sort(function(a,b) {
        return a.distanceToLineStart - b.distanceToLineStart;
      });

      for (var i = 0; i < numberOfHitDots; i++) {
        var dot = hitDots[i];

        // push the end of the current line segment to coordinates of the dot
        // and spawn a new line from the coordinates of the dot
        this._updateLine(dot.x, dot.y);
        this._startLine(dot.x, dot.y);

        // push the value of the dot into the pattern array and dispatch a
        // public event containing the updated pattern
        this.scope.pattern.push(dot.value);
        this._dispatch(this.EVENTS.line.hit, {
          pattern: fUtils.fastCloneArray(this.scope.pattern),
          value: dot.value
        });
      }

      // set the last dot as the current active dot
      var lastDot = hitDots[numberOfHitDots - 1];
      if (this.scope.line.currentDot) this.scope.line.currentDot.isActive = false;
      this.scope.line.currentDot = lastDot;
    }
  }
});