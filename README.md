# BeatMap
A Javascript audio display based on tiled bitmap images.

## Example usage 
The completed example as described below can be found in example/example.html.

Download BeatMap using [bower](http://bower.io):

    bower install beatmap

In the header of your web page, insert:

    <script src="bower_components/kineticjs/kinetic.min.js"></script>
    <script src="bower_components/beatmap/beatmap.js"></script>

Create three images to represent the audio of sizes 960x240, 4800x240 and
9600x240, and name them 1.jpg, 5.jpg and 10.jpg respectively. Use the supplied
[ImageMagick](http://www.imagemagick.org) script to chop each image into
240px-wide tiles.

    ./tilecut.sh 1.jpg 240
    ./tilecut.sh 5.jpg 240
    ./tilecut.sh 10.jpg 240

In your web page, declare an object with the image metadata:

    var data = {
      height: 240,
      image: [
        {
          src: '1',
          tilewidth: 240,
          width: 960,
          format: 'jpg'
        },
        {
          src: '5',
          tilewidth: 240,
          width: 4800,
          format: 'jpg'
        },
        {
          src: '10',
          tilewidth: 240,
          width: 9600,
          format: 'jpg'
        }
      ]
    };

## Documentation

To generate documentation from the comments, [use JSDoc](http://usejsdoc.org/):

    jsdoc -d=doc beatmap.js beatmap-join.js
