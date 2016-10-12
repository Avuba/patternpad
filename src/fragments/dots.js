PatternPad.Fragment({
  name: 'dots',


  scope: {
    columns: 3,
    rows: 3,
    dotCollection: [],
    containerOffset: {},
    resize: {
      timeout: null,
      isFirstEvent: true
    }
  },


  hooks: {
    onInit: function() {
      this._drawDots();
      this._updateDotCollection();
      this._listen(window, 'resize', this._onWindowResize);
    }
  },


  methods: {
    // TODO: look for better place, make it event based
    refresh: function() {
      this._resetDotValues();
      this._resetDotElems();
      this._resetLine();
      this.scope.pattern.length = 0;
      this.scope.containerOffset = this.scope.$container.offset();
      this._updateDotCollection();
    },


    _drawDots: function() {
      // TODO: add check that makes sure initial container is positioned absolute / relative
      // TODO: write down this will only work with "-webkit-transform: translate(-50%,-50%)"
      // TODO: maybe force "-webkit-transform: translate(-50%,-50%)" on all dots?
      // TODO: add comment explaining why we seperate dot creation from dot params update
      // + include CSS / JS speration
      // TODO: think about clearing container when calling this function

      var spacingXinPer = 100 / this.scope.columns,
        spacingYinPer = 100 / this.scope.rows,
        startXinPer = spacingXinPer / 2,
        startYinPer = spacingYinPer / 2;

      for (var i = 0; i < this.scope.rows; i++) {
        for (var j = 0; j < this.scope.columns; j++) {
          // TODO: replace with dom fragments asap
          var $dot = $(this.scope.dot);

          $dot.css({
            'left': (startXinPer + spacingXinPer * j) + '%',
            'top': (startYinPer + spacingYinPer * i) + '%'
          });

          this.scope.dotCollection.push({ $elem: $dot });
          this.scope.$container.append($dot);
        }
      }
    },


    _updateDotCollection: function() {
      // TODO: explain purpose of method
      if (!this.scope.dotCollection[0]) return;

      // TODO: explain why we calculate the positions completely independent
      // from the elements inside the DOM
      var containerWidth = this.scope.$container.width(),
        containerHeight = this.scope.$container.height(),
        spacingXinPx = containerWidth / this.scope.columns,
        spacingYinPx = containerHeight / this.scope.rows,
        startXinPx = spacingXinPx / 2,
        startYinPx = spacingYinPx / 2,
        radiusInPx = this.scope.dotCollection[0].$elem.width() / 2;

      var reference = 0;
      // TODO: explain why we use two for and not one array construct
      for (var i = 0; i < this.scope.rows; i++) {
        for (var j = 0; j < this.scope.columns; j++) {
          var dot = this.scope.dotCollection[reference];

          dot.x = this.scope.containerOffset.left + startXinPx + spacingXinPx * j;
          dot.y = this.scope.containerOffset.top + startYinPx + spacingYinPx * i;
          dot.radius = radiusInPx;
          dot.isActive = false;
          dot.numberOfHits = 0;
          dot.value = reference + 1;

          reference++;
        }
      }
    },


    _resetDotValues: function() {
      var numberOfDots = this.scope.dotCollection.length;
      for (var i = 0; i < numberOfDots; i++) {
        var dot = this.scope.dotCollection[i];

        dot.isActive = false;
        dot.numberOfHits = 0;
      }
    },


    _resetDotElems: function() {
      var numberOfDots = this.scope.dotCollection.length;
      for (var i = 0; i < numberOfDots; i++) {
        var dot = this.scope.dotCollection[i];

        // TODO: research if all should be batched inside one dom operation
        // TODO: research of requestAnimFrame should be used
        dot.$elem.removeClass('active');
      }
    },


    _onWindowResize: function(event) {
      // TODO: explain why
      if (this.scope.resize.isFirstEvent) {

        // TODO: put stuff into reset event
        this._resetDotValues();
        this._resetDotElems();
        this._resetLine();
        this.scope.pattern.length = 0;
        // important: this._updateDotCollection() is NOT part of this (due to performance reasons)

        this.scope.resize.isFirstEvent = false;
      }

      // TODO: explain why timeout
      // TODO: put timeout amount into variable
      if (this.scope.resize.timeout) clearTimeout(this.scope.resize.timeout);
      this.scope.resize.timeout = setTimeout(function() {
        this._updateDotCollection();
        this.scope.resize.isFirstEvent = true;
      // TODO: research if .apply() can be used
      }.bind(this), 150);
    }
  }
});