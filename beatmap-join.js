/*
   Copyright 2014 British Broadcasting Corporation

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

/**
 * Create line-based display which links two audio displays with different
 * timescales.
 * @constructor
 * @param {Object} container DIV element for display
 * @param {number} topWidth Width of top display (in pixels)
 * @param {number} bottomWidth Width of bottom display (in pixels)
 * @param {number} height Height of display (in pixels)
 * @param {number} trackLength Length of audio track (in seconds)
 */
function BeatMapJoin(containerId, containerWidth, overviewWidth, height,
    length)
{
  this.zoomWidth=containerWidth;
  this.overviewWidth = overviewWidth;
  this.height=height;
  this.length=length;

  this.offset=0;
  this.vislength=0;

  // initialize
  this.kineticInit(containerId);
}

/**
 * Initialize KineticJS
 * @param {Object} container DIV element
 */
BeatMapJoin.prototype.kineticInit = function(containerId)
{
  this.stage = new Kinetic.Stage({
    container: containerId,
    width: this.zoomWidth,
    height: this.height
  });
  this.layer = new Kinetic.Layer();
  this.stage.add(this.layer);
}

/**
 * Draw display
 * @param {number} topOffset Offset of top display in pixels
 * @param {number} topLength Length of visible audio in top display, in seconds
 * @param {number} bottomLength Length of visible audio in bottom display, in seconds
 */
BeatMapJoin.prototype.draw = function(zoomOffset, zoomLength, overallLength)
{
  this.layer.destroyChildren();
  var xOffset = (this.zoomWidth-this.overviewWidth)/2;
  var leftX = xOffset+this.overviewWidth/overallLength*zoomOffset;
  var rightX = xOffset+this.overviewWidth/overallLength*(zoomOffset+zoomLength);
  this.layer.add(new Kinetic.Line({
    points: [0, 0,
             leftX/8, this.height/4,
             leftX/2, this.height/2,
             leftX*7/8, this.height*3/4,
             leftX, this.height],
    stroke: 'black',
    strokeWidth: 1,
    tension: 0.5
  }));
  this.layer.add(new Kinetic.Line({
    points: [this.zoomWidth, 0,
             rightX+(this.zoomWidth-rightX)*7/8, this.height/4,
             rightX+(this.zoomWidth-rightX)/2, this.height/2,
             rightX+(this.zoomWidth-rightX)/8, this.height*3/4,
             rightX, this.height],
    stroke: 'black',
    strokeWidth: 1,
    tension: 0.5
  }));
  this.layer.draw();
}
