function BeatMap(containerId,
                 trackData,
                 containerWidth,
                 trackLength,
                 index,
                 showTime)
{
  var index = typeof index !== 'undefined' ? index : 0;
  var showTime = typeof showTime !== 'undefined' ? showTime : true;
  this.offset=0;
  this.inpoint=0;
  this.outpoint=0;
  this.ticksPerView=10;

  // copy data
  this.height=trackData.height;
  this.length=trackLength;
  this.outWidth=containerWidth;
  this.showTime=showTime;

  // initialize
  this.init(trackData.image[index]);
  this.kineticInit(containerId);
}

BeatMap.prototype.init = function(imageData)
{
  this.tiles=new Array();
  this.src=imageData.src;
  this.format=imageData.format;
  this.width=imageData.width;
  this.tilewidth=imageData.tilewidth;
  this.tilecount=Math.ceil(this.width/this.tilewidth);
  this.cuts = Math.ceil(this.width/this.outWidth);
  this.cutWidth = this.width/this.cuts;
  if (this.selection) this.drawMarker();
  if (this.ticks) this.drawTime();
}

BeatMap.prototype.getOffset = function()
{
  return this.offset/this.width*this.length;
}

BeatMap.prototype.getViewLength = function()
{
  return this.outWidth/this.width*this.length;
}

BeatMap.prototype.secsToMinsSecs = function(secs)
{
  var mins = Math.floor(secs / 60);
  var secs = secs - mins*60;
  return ('0'+mins).slice(-2)+':'+('0'+Math.round(secs)).slice(-2);
}

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

BeatMap.prototype.kineticInit = function(containerId)
{
  this.stage = new Kinetic.Stage({
    container: containerId,
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
  this.loadimg.src = 'tileload.png';

  this.group.add(this.selection);
  this.group.add(this.ticks);
  this.layer.add(this.group);
  this.layer.add(this.line);
  this.stage.add(this.layer);

  this.drawTime();
}

BeatMap.prototype.loadTile = function(i)
{
  if (this.tiles[i] === undefined)
  {
    var that=this;

    // display loading image
    var loadkimg = new Kinetic.Image({
      x: this.tilewidth*i,
      y: 0,
      image: this.loadimg
    });
    this.group.add(loadkimg);

    // load actual image
    this.tiles[i] = new Image();
    this.tiles[i].onload = function() {
      var kimg = new Kinetic.Image({
        x: that.tilewidth*i,
        y: 0,
        image: that.tiles[i]
      });
      that.group.add(kimg);
    };
    this.tiles[i].src = this.src+'_'+i+'.'+this.format;
  }
}

BeatMap.prototype.draw = function(secs)
{
  this.offset = 0;
  var overlap = 0;
  var pos = Math.round(this.width/this.length*secs);

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

BeatMap.prototype.findSecs = function()
{
  var pos = this.stage.getPointerPosition();
  if (pos == undefined) return -1;
  return (pos.x+this.offset)/this.width*this.length;
}

BeatMap.prototype.setIn = function(secs)
{
  this.inpoint = secs;
  if (this.inpoint > this.outpoint) this.outpoint = this.inpoint;
  this.drawMarker();
}

BeatMap.prototype.setOut = function(secs)
{
  this.outpoint = secs;
  if (this.outpoint < this.inpoint) this.inpoint = this.outpoint;
  this.drawMarker();
}

BeatMap.prototype.drawMarker = function()
{
  var xpos = this.width/this.length*this.inpoint;
  var widthpos = this.width/this.length*this.outpoint - xpos;
  this.selection.setAttr('x', xpos);
  this.selection.setAttr('width', widthpos);
  this.selection.moveToTop();
}
