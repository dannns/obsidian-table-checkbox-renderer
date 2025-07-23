#!/bin/bash
set -eu

if [ $# -eq 0 ]; then
    echo "Usage: $0 <input AVI file>"
    exit 1
fi

INPUT_AVI="$1"
BASENAME="$(basename "$INPUT_AVI" .avi)"
INTERMEDIATE_MP4="${BASENAME}.intermediate.mp4"
PALETTE_FILE="${BASENAME}.palette.png"
OUTPUT_GIF="${BASENAME}.gif"

echo "Step 1: Converting rawvideo AVI to MP4 (needed for robust GIF creation)..."
ffmpeg -y -i "$INPUT_AVI" -c:v libx264 -preset veryfast -crf 23 "$INTERMEDIATE_MP4"

echo "Step 2: Generating palette from the ORIGINAL AVI ($INPUT_AVI)..."
ffmpeg -y -i "$INPUT_AVI" -vf "palettegen=max_colors=32" "$PALETTE_FILE"

echo "Step 3: Creating GIF with no dithering from intermediate MP4..."
ffmpeg -y -i "$INTERMEDIATE_MP4" -i "$PALETTE_FILE" -filter_complex "[0:v][1:v]paletteuse=dither=none" "$OUTPUT_GIF"

echo "Cleaning up intermediate files..."
rm "$INTERMEDIATE_MP4" "$PALETTE_FILE"

echo "Converted $INPUT_AVI to $OUTPUT_GIF"
