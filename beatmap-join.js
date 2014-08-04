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

BeatMapJoin.prototype.init = function(imageData)
{
  this.tiles=new Array();
  this.src=imageData.src;
  this.format=imageData.format;
  this.width=imageData.width;
  this.tilewidth=imageData.tilewidth;
  this.tilecount=Math.ceil(this.width/this.tilewidth);
  this.cuts = Math.ceil(this.width/this.zoomWidth);
  this.cutWidth = this.width/this.cuts;
  if (this.selection) this.drawMarker();
  if (this.ticks) this.drawTime();
}

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
