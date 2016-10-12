PatternPad.Fragment({
  methods: {
    _solveSudoku: function() {
      var sourceRows = [
        [4,' ',' ',' ',' ',3,' ',' ',9],
        [' ',3,2,4,1,' ',' ',' ',' '],
        [1,5,' ',2,6,' ',' ',' ',' '],
        [' ',2,' ',' ',' ',' ',1,' ',8],
        [' ',' ',' ',' ',' ',' ',' ',' ',' '],
        [6,' ',7,' ',' ',' ',' ',9,' '],
        [' ',' ',' ',' ',7,6,' ',8,4],
        [' ',' ',' ',' ',9,2,6,5,' '],
        [5,' ',' ',1,' ',' ',' ',' ',3]
      ];
      /* var sourceRows = [
        [8  ,' ',' ',' ',' ',7  ,5  ,' ',2  ],
        [' ',' ',' ',' ',9  ,5  ,' ',' ',1  ],
        [' ',' ',9  ,' ',8  ,' ',7  ,' ',' '],
        [' ',3  ,6  ,' ',' ',2  ,' ',' ',' '],
        [9  ,' ',' ',' ',' ',' ',' ',' ',7  ],
        [' ',' ',' ',9  ,' ',' ',3  ,6  ,' '],
        [' ',' ',8  ,' ',3  ,' ',2  ,' ',' '],
        [7  ,' ',' ',4  ,2  ,' ',' ',' ',' '],
        [2  ,' ',4  ,7  ,' ',' ',' ',' ',' ']
      ]; */


      // HELPER FUNCTIONS


      // populate columans and quadrants based on rows array
      var getColsQuadsFromRows = function(rows) {
        var columns = [],
          quadrants = [],
          rowIndex = 0,
          rowCount = 0;

        rows.forEach(function(element, index) {
          var row = element,
            columnIndex = 0,
            columnCount = 0;

          row.forEach(function(element, index) {
            var quadIndex = rowIndex + columnIndex;

            // fill columns array
            if (!columns[index]) columns[index] = [];
            columns[index].push(element);

            // fill quadrants array
            if (!quadrants[quadIndex]) quadrants[quadIndex] = [];
            quadrants[quadIndex].push(element);

            columnCount++;
            if (columnCount === 3) {
              columnCount = 0;
              columnIndex++;
            }
          });

          rowCount++;
          if (rowCount === 3) {
            rowCount = 0;
            rowIndex = rowIndex + 3;
          }
        });

        return {
          columns: columns,
          quadrants: quadrants
        };
      };


      var getArrayIntersection = function(a,b) {
        var aIndex = 0,
          bIndex = 0,
          result = [];

        while(aIndex < a.length && bIndex < b.length) {
          if (a[aIndex] < b[bIndex] ) {
            aIndex++;
          } else if (a[aIndex] > b[bIndex] ) {
            bIndex++;
          } else {
            result.push(a[aIndex]);
            aIndex++;
            bIndex++;
          }
        }

        return result;
      };


      var getPotNums = function(toCheck) {
        var toReturn = [],
          number = 1;

        while (number < 10) {
          if (toCheck.indexOf(number) === -1) toReturn.push(number);
          number++;
        }

        return toReturn;
      };


      // CORE


      var run = 0,
        sudokuSolved = false;

      var solveFields = function(inputRows) {
        // failsafe against endless loops in case of programming errors
        run++; if (run > 1000) return;
        // exit in case sudoku was solved
        if (sudokuSolved) return;

        // make a copy of inputRows so each instance of solveFields() has
        // it's own universe to operate on
        var rows = [];
        for (var i = 0; i < inputRows.length; i++) rows[i] = inputRows[i].slice();


        // ITERATE OVER ALL FIELDS
        // and save potential matches in matches array


        var matches = [],
          rowIndex = 0,
          rowCount = 0,
          colsAndQuads = getColsQuadsFromRows(rows),
          hasEmptySpaces = false;

        for (var i = 0; i < rows.length; i++) {
          var row = rows[i],
            columnIndex = 0,
            columnCount = 0,
            potRowNums = getPotNums(row);

          for (var j = 0; j < row.length; j++) {
            var item = row[j];

            if (item === ' ') {
              hasEmptySpaces = true;

              var quadIndex = rowIndex + columnIndex,
                potColNums = getPotNums(colsAndQuads.columns[j]),
                potQuadNums = getPotNums(colsAndQuads.quadrants[quadIndex]);

              var rowColIntersection = getArrayIntersection(potRowNums, potColNums),
                rowColQuadIntersection = getArrayIntersection(rowColIntersection, potQuadNums);

              if (rowColQuadIntersection.length) {
                matches.push({
                  row: i,
                  column: j,
                  amount: rowColQuadIntersection.length,
                  values: rowColQuadIntersection.slice(0)
                });
              }
            }

            columnCount++;
            if (columnCount === 3) {
              columnCount = 0;
              columnIndex++;
            }
          }

          rowCount++;
          if (rowCount === 3) {
            rowCount = 0;
            rowIndex = rowIndex + 3;
          }
        }


        // EXIT AND CONTINUE CONDITIONS


        // exit function in case no more empty spaces are present - this means
        // the sudoku is solved!
        if (!hasEmptySpaces) {
          sudokuSolved = true;
          console.log('Sudoku solved:');
          console.log(rows);
          return true;
        }


        // handle matches in case matches exist
        if (matches.length) {
          // sort matches based on amount of possible values to match
          matches.sort(function(a, b) {
            if (a.amount > b.amount)
              return 1;
            if (a.amount < b.amount)
              return -1;
            return 0;
          });

          // pick first position
          var match = matches[0];

          // apply match on position 0 non-recursively in case only
          // one match is available, try only one path
          if (match.amount === 1) {
            rows[match.row][match.column] = match.values[0];
            return solveFields(rows);
          }
          // apply match on position 0 recursively in case multiple
          // matches are available, try all paths
          else {
            for (var k = 0; k < match.values.length; k++) {
              rows[match.row][match.column] = match.values[k];
              if (solveFields(rows)) break;
            }
          }
        // exit function with false in case no matches exist
        } else {
          return false;
        }
      };


      // INIT


      solveFields(sourceRows);
    }
  }
});