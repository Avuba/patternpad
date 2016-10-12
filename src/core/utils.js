var ppMaths = {};


/**
 * calculate distance between two given points / length of any given line
 * defined by two points
 *
 * @param  {Object} point1 : needs to contain coordinates x & y
 * @param  {Object} point2 : needs to contain coordinates x & y
 * @return {Number}        : distance
 */
ppMaths.getDistance = function(point1, point2) {
  return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
};


/**
 * calculate angle of any given line defined by two points
 *
 * @param  {Object} point1 : needs to contain coordinates x & y
 * @param  {Object} point2 : needs to contain coordinates x & y
 * @return {Number}        : between 0 and +/- 180 deg
 */
ppMaths.getAngle = function(point1, point2) {
  return (Math.atan2(point2.y - point1.y, point2.x - point1.x) * 180) / Math.PI;
};


/**
 * check if any given line defined by two points intersects and actually touches
 * any given circle, reference: http://stackoverflow.com/a/1088058
 *
 * TODO: think about using http://stackoverflow.com/a/1090772, compare speed
 *
 * @param  {Object} lineStart : needs to contain coordinates x & y
 * @param  {Object} lineEnd   : needs to contain coordinates x & y
 * @param  {Object} circle    : needs to contain coordinates x,y & radius
 * @return {Boolean}
 */
ppMaths.doesLineIntersectCircle = function(lineStart, lineEnd, circle) {
  var line = {
    length: ppMaths.getDistance(lineStart, lineEnd),
    direction: {}
  };

  line.direction.x = (lineEnd.x - lineStart.x) / line.length;
  line.direction.y = (lineEnd.y - lineStart.y) / line.length;

  var closestPoint = {
    // i don't know what t stands for and at this point i'm too afraid to ask
    t: (line.direction.x * (circle.x - lineStart.x)) + (line.direction.y * (circle.y - lineStart.y))
  };

  closestPoint.x = (closestPoint.t * line.direction.x) + lineStart.x;
  closestPoint.y = (closestPoint.t * line.direction.y) + lineStart.y;

  var distCircleToClosest = ppMaths.getDistance(circle, closestPoint);


  // CASE: line intersects circle at two points
  if (distCircleToClosest < circle.radius) {
    var distCircleToClosestT = Math.sqrt(Math.pow(circle.radius, 2) - Math.pow(distCircleToClosest, 2));

    var intersection1 = {
      x: ((closestPoint.t - distCircleToClosestT) * line.direction.x) + lineStart.x,
      y: ((closestPoint.t - distCircleToClosestT) * line.direction.y) + lineStart.y
    };

    var intersection2 = {
      x: ((closestPoint.t + distCircleToClosestT) * line.direction.x) + lineStart.x,
      y: ((closestPoint.t + distCircleToClosestT) * line.direction.y) + lineStart.y
    };


    // CASE: intersection1 is closest to lineEnd and line.length is large enough
    // to reach the circle
    if (line.length >= ppMaths.getDistance(lineStart, intersection1)) {
      var dirLineStartToEnd = ppMaths.getAngle(lineStart, lineEnd) > 0 ? 1 : -1,
        dirLineStartToI1 = ppMaths.getAngle(lineStart, intersection1) > 0 ? 1 : -1;

      // CASE: both angles point in the same direction, which means the line
      // actually touches the circle
      if (dirLineStartToEnd === dirLineStartToI1) return true;
    }


    // CASE: intersection2 is closest to lineEnd and line.length is large enough
    // to reach the circle
    else if (line.length >= ppMaths.getDistance(lineStart, intersection2)) {
      var dirLineStartToEnd = ppMaths.getAngle(lineStart, lineEnd) > 0 ? 1 : -1,
        dirLineStartToI2 = ppMaths.getAngle(lineStart, intersection2) > 0 ? 1 : -1;

      // CASE: both angles point in the same direction, which means the line
      // actually touches the circle
      if (dirLineStartToEnd === dirLineStartToI2) return true;
    }


    // CASE: lineStart and/or lineEnd is/are inside the circle
    else if (ppMaths.getDistance(lineStart, circle) < circle.radius
      || ppMaths.getDistance(lineEnd, circle) < circle.radius) {
      return true;
    }


    // CASE: line intersects in theory but is not long enough to actually reach
    // the circle at any point
    // CASE: or/and the angles point in different directions
    // CASE: or/and lineStart and/or lineEnd is/are outside the circle
    return false;
  }


  // CASE: line intersects circle at no OR one point. we ignore one-point
  // intersections for the moment as they are not relevant for our usecase
  else {
    return false;
  }
};