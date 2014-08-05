# BeatMap
A Javascript audio visualization element based on tiled bitmap images. For a
vector-based waveform visualization, see
[peaks.js](https://github.com/bbcrd/peaks.js).

## Installation
BeatMap can be installed using [bower](http://bower.io)

    bower install beatmap

or by copying beatmap.js and [KineticJS](http://kineticjs.com/) into your
working directory.

## Examples 
Two working examples are supplied:

* __[example/example.html](example/example.html)__ implements a single display
  with three zoom levels and selection functionality
* __[example/example-dual.html](example/example-dual.html)__ is as above, but
  includes a second zoomed display with lines to indicate which part of the
  recording the zoomed display is showing

## Generating tiles
Firstly, generate images from your audio data using something like
[Vampeyer](https://github.com/bbcrd/vampeyer). The images then need to be cut
into tiles and given filenames in the format _filename\_0.jpg_,
_filename\_1.jpg_ etc. The supplied [ImageMagick](http://www.imagemagick.org)
script _tilecut.sh_ chops an image into equally-spaced tiles and names them
appropriately. For example:

    ./tilecut.sh filename.jpg 240

## Usage
In the &lt;head&gt; section of your web page, insert:

    <script src="bower_components/kineticjs/kinetic.min.js"></script>
    <script src="bower_components/beatmap/beatmap.js"></script>

Add a &lt;div&gt; element where you would like the display to go.

    <div id="display"></div>

In a &lt;script&gt; element, declare an array containing the image metadata:

    var images = [
      {
        src: 'filenameA',
        width: 960,
        tilewidth: 240,
        format: 'jpg'
      },
      {
        src: 'filenameB',
        width: 4800,
        tilewidth: 240,
        format: 'jpg'
      }
    ];

Initialize a BeatMap object:

    var bm = new BeatMap(document.getElementById("display"),
                         960,           // width of div element in pixels
                         images,        // image metadata array
                         240,           // height of images in pixels
                         60,            // length of recording in seconds
                         0,             // index of image to use (default=0)
                         true);         // display timeline markers (default=true)

and finally create a drawing loop:

    window.setInterval("bm.draw(0);",   // drawing function with cursor position in seconds
                       50);             // milliseconds between refreshs

## Documentation

To generate the full documentation, [use JSDoc](http://usejsdoc.org/):

    jsdoc -d=doc beatmap.js

## License
See [COPYING](COPYING)

## Authors
* [Chris Baume](https://github.com/chrisbaume), British Broadcasting Corporation

## Copyright
Copyright 2014 British Broadcasting Corporation

