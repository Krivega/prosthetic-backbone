'use strict';

var sin = Math.sin;
var cos = Math.cos;

module.exports = {

  /* @options:
   * startDegrees, endDegrees — fill between these angles, clockwise
   * innerRadius, outerRadius — distance from the center
   */
  donutSector: function(options) {
    var r1 = options.innerRadius;
    var r2 = options.outerRadius;
    var cx = options.size / 2;
    var cy = options.size / 2;
    var a1 = options.startDegrees * Math.PI / 180;
    var a2 = options.endDegrees * Math.PI / 180;
    var p = [
      [cx + r2 * cos(a1), cy + r2 * sin(a1)],
      [cx + r2 * cos(a2), cy + r2 * sin(a2)],
      [cx + r1 * cos(a2), cy + r1 * sin(a2)],
      [cx + r1 * cos(a1), cy + r1 * sin(a1)]
    ];
    var largeArc = ((a2 - a1) % (Math.PI * 2)) > Math.PI ? 1 : 0;
    var cmds = [
      'M' + p[0], // Move to P0    jshint ignore:line
      'A' + [r2, r2, 0, largeArc, 1, p[1]], // Arc to  P1 jshint ignore:line
      'L' + p[2], // Line to P2jshint ignore:line
      'A' + [r1, r1, 0, largeArc, 0, p[3]], // Arc to  P3 jshint ignore:line
      'z' // Close path (Line to P0) jshint ignore:line
    ];
    return cmds.join('\n');
  }

};
