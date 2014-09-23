/*
   Copyright 2014 British Broadcasting Corporation

   This program is free software: you can redistribute it and/or modify
   it under the terms of the GNU General Public License as published by
   the Free Software Foundation, either version 3 of the License, or
   (at your option) any later version.

   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU General Public License for more details.

   You should have received a copy of the GNU General Public License
   along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

/**
 * Create tiled bitmap display.
 * @constructor
 * @param {Object} container DIV element for display
 * @param {number} containerWidth Width of display (in pixels)
 * @param {Object} images Metadata of images
 * @param {number} height of images (in pixels)
 * @param {number} trackLength Length of audio track (in seconds)
 * @param {String} [loadImage='tileload.png'] Tile image to display when loading
 * @param {number} [index=0] Index of image to use initially
 * @param {boolean} [showTime=true] Flag to display time markers
 */
function BeatMap(container,
                 containerWidth,
                 images,
                 height,
                 trackLength,
                 loadImage,
                 index,
                 showTime)
{
  this.offset=0;
  this.inpoint=0;
  this.outpoint=0;
  this.ticksPerView=10;

  // set defaults
  var loadImage = typeof loadImage !== 'undefined' ? loadImage : 'tileload.png';
  var index = typeof index !== 'undefined' ? index : 0;
  var showTime = typeof showTime !== 'undefined' ? showTime : true;

  // copy data
  this.height=height;
  this.length=trackLength;
  this.outWidth=containerWidth;
  this.showTime=showTime;
  this.currentZoom=index;
  this.loadImage=loadImage;

  // initialize
  this.init(images[this.currentZoom]);
  this.kineticInit(container);
}

/**
 * Initialize display
 * @param {Object} image Metadata of image
 */
BeatMap.prototype.init = function(image)
{
  this.tiles=new Array();
  this.src=image.src;
  this.format=image.format;
  this.width=image.width;
  this.tilewidth=image.tilewidth;
  this.tilecount=Math.ceil(this.width/this.tilewidth);
  this.cuts = Math.ceil(this.width/this.outWidth);
  this.cutWidth = this.width/this.cuts;
  if (this.selection) this.drawMarker();
  if (this.ticks) this.drawTime();
}

/**
 * Returns current x offset.
 * @returns {number}
 */
BeatMap.prototype.getOffset = function()
{
  return this.offset/this.width*this.length;
}

/**
 * Returns number of seconds that can currently be seen in display.
 * @returns {number}
 */
BeatMap.prototype.getViewLength = function()
{
  return this.outWidth/this.width*this.length;
}

/**
 * Converts seconds to string of minutes and seconds (00:00).
 * @param {number} seconds
 * @returns {string}
 */
BeatMap.prototype.secsToMinsSecs = function(seconds)
{
  var minutes = Math.floor(seconds / 60);
  var seconds = seconds - minutes*60;
  return ('0'+minutes).slice(-2)+':'+('0'+Math.round(seconds)).slice(-2);
}

/**
 * Draw time markers
 */
BeatMap.prototype.drawTime = function()
{
  if (!this.showTime) return;
  this.ticks.destroyChildren();

  // calculate frequency of ticks
  var tickLength = this.length/((this.width/this.outWidth)*this.ticksPerView);
  if (tickLength > 5)
    tickLength = Math.round(tickLength/10)*10;
  if (tickLength < 1)
    tickLength = 1;
  else
    tickLength = Math.round(tickLength)

  // calculate pixel distance and number
  var tickWidth = this.width/this.length*tickLength;
  var tickCount = this.length/tickLength;

  // draw each tick
  for (var i=1; i<tickCount+1; i++)
  {
    this.ticks.add(new Kinetic.Line({
      points: [i*tickWidth, this.height,
               i*tickWidth, this.height-this.height/20],
      stroke: 'black',
      strokeWidth: 1,
      opacity: 0.5
    }));
    this.ticks.add(new Kinetic.Line({
      points: [i*tickWidth, 0,
               i*tickWidth, this.height/20],
      stroke: 'black',
      strokeWidth: 1,
      opacity: 0.5
    }));
    this.ticks.add(new Kinetic.Text({
      x: (i*tickWidth)-15,
      y: this.height-this.height/20-12,
      text: this.secsToMinsSecs(i*tickLength),
      fontSize: 12,
      fontFamily: 'sans-serif',
      fill: 'black',
      opacity: 0.5
    }));
  }
}

/**
 * Initialize KineticJS.
 * @param {Object} container
 */
BeatMap.prototype.kineticInit = function(container)
{
  this.stage = new Kinetic.Stage({
    container: container,
    width: this.outWidth,
    height: this.height
  });
  this.layer = new Kinetic.Layer();
  this.group = new Kinetic.Group({
    x: 0,
    y: 0,
    width: this.width,
    height: this.height
  });
  this.line = new Kinetic.Line({
    points: [0, 0, 0, this.height],
    stroke: 'black',
    strokeWidth: 1
  });
  this.selection = new Kinetic.Rect({
    x: 0,
    y: 0,
    width: 0,
    height: this.height,
    fill: 'white',
    opacity: 0.5
  });
  this.ticks = new Kinetic.Group({
    x: 0,
    y: 0,
    width: this.width,
    height: this.height
  });
  this.loadimg = new Image();
  this.loadimg.src = this.loadImage; 

  this.group.add(this.selection);
  this.group.add(this.ticks);
  this.layer.add(this.group);
  this.layer.add(this.line);
  this.stage.add(this.layer);

  this.drawTime();
}

/**
 * Check if tile has been loaded and load if not.
 * @param {number} index Index of tile
 */
BeatMap.prototype.loadTile = function(index)
{
  if (this.tiles[index] === undefined)
  {
    var that=this;

    // display loading image
    var loadkimg = new Kinetic.Image({
      x: this.tilewidth*index,
      y: 0,
      image: this.loadimg
    });
    this.group.add(loadkimg);

    // load actual image
    this.tiles[index] = new Image();
    this.tiles[index].onload = function() {
      var kimg = new Kinetic.Image({
        x: that.tilewidth*index,
        y: 0,
        image: that.tiles[index]
      });
      that.group.add(kimg);
    };
    this.tiles[index].src = this.src+'_'+index+'.'+this.format;
  }
}

/**
 * Draw display with cursor at given point.
 * @param {number} seconds Position of cursor
 */
BeatMap.prototype.draw = function(seconds)
{
  this.offset = 0;
  var overlap = 0;
  var pos = Math.round(this.width/this.length*seconds);

  // find which 'page' cursor is on, set offset
  for (var i=this.cuts-1; i>=0; i--)
  {
    if (pos > i*this.cutWidth)
    {
      if (i>0 && i<this.cuts-1)
        overlap = (this.outWidth-this.cutWidth)/2;
      else if (i == this.cuts-1)
        overlap = this.outWidth-this.cutWidth;
      this.offset = i*this.cutWidth-overlap;
      pos = pos-this.offset;
      break;
    }
  }

  // go through each tile, load if in current or next view
  for (var i=0; i<this.tilecount; i++)
  {
    var start=i*this.tilewidth;
    var end=start+this.tilewidth-1;
    if (end > this.width) end=this.width;
    if ( (start>this.offset && start<this.offset+this.outWidth*2) ||
         (end>this.offset && end<this.offset+this.outWidth) )
    {
      this.loadTile(i);
    }
  }

  // move image group and line, then draw
  this.group.setX(-this.offset);
  this.line.points([pos, 0, pos, this.height]);
  this.selection.moveToTop();
  this.ticks.moveToTop();
  this.layer.draw();
}

/**
 * Returns current mouse position on timeline in seconds.
 * @returns {number} seconds
 */
BeatMap.prototype.findSecs = function()
{
  var pos = this.stage.getPointerPosition();
  if (pos == undefined) return -1;
  return (pos.x+this.offset)/this.width*this.length;
}

/**
 * Set selection in point.
 * @param {number} seconds
 */
BeatMap.prototype.setIn = function(seconds)
{
  this.inpoint = seconds;
  if (this.inpoint > this.outpoint) this.outpoint = this.inpoint;
  this.drawMarker();
}

/**
 * Set selection out point.
 * @param {number} seconds
 */
BeatMap.prototype.setOut = function(seconds)
{
  this.outpoint = seconds;
  if (this.outpoint < this.inpoint) this.inpoint = this.outpoint;
  this.drawMarker();
}

/**
 * Draw selection.
 */
BeatMap.prototype.drawMarker = function()
{
  var xpos = this.width/this.length*this.inpoint;
  var widthpos = this.width/this.length*this.outpoint - xpos;
  this.selection.setAttr('x', xpos);
  this.selection.setAttr('width', widthpos);
  this.selection.moveToTop();
}

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
function BeatMapJoin(container, topWidth, bottomWidth, height, length)
{
  this.zoomWidth=topWidth;
  this.overviewWidth = bottomWidth;
  this.height=height;
  this.length=length;

  this.offset=0;
  this.vislength=0;

  // initialize
  this.kineticInit(container);
}

/**
 * Initialize KineticJS
 * @param {Object} container DIV element
 */
BeatMapJoin.prototype.kineticInit = function(container)
{
  this.stage = new Kinetic.Stage({
    container: container,
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
BeatMapJoin.prototype.draw = function(topOffset, topLength, bottomLength)
{
  this.layer.destroyChildren();
  var xOffset = (this.zoomWidth-this.overviewWidth)/2;
  var leftX = xOffset+this.overviewWidth/bottomLength*topOffset;
  var rightX = xOffset+this.overviewWidth/bottomLength*(topOffset+topLength);
  var rightDiff = this.zoomWidth-rightX;

  // draw left spline
  this.layer.add(new Kinetic.Line({
    points: [0, 0,
             leftX*1/8, this.height*1/4,
             leftX*4/8, this.height*2/4,
             leftX*7/8, this.height*3/4,
             leftX, this.height],
    stroke: 'black',
    strokeWidth: 1,
    tension: 0.5
  }));

  // draw right spline
  this.layer.add(new Kinetic.Line({
    points: [this.zoomWidth, 0,
             rightX+rightDiff*7/8, this.height*1/4,
             rightX+rightDiff*4/8, this.height*2/4,
             rightX+rightDiff*1/8, this.height*3/4,
             rightX, this.height],
    stroke: 'black',
    strokeWidth: 1,
    tension: 0.5
  }));
  this.layer.draw();
}
