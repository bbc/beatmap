#!/bin/bash
#
# Tiles a given image into smaller fixed-width .jpg files. Requires ImageMagick
# to be installed.
#
# Usage: tilecut.sh largeimage.png 240
# Output files: largeimage_0.jpg, largeimage_1.jpg... largeimage_{N-1}.jpg

FILEIN="$1"
FILEBASE="`basename $1 .png`"
FILEDIR="`dirname $1`"
TILESIZE="$2"
convert "${FILEIN}" -crop ${TILESIZE}x -strip -set filename:tile "%[fx:page.x/${TILESIZE}]" +repage +adjoin "${FILEDIR}/${FILEBASE}_%[filename:tile].jpg"
