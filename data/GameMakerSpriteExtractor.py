import re

# Requires python 3

# YYC-compiled GameMaker Studio games don't work with most GameMaker Studio asset extractors.
# However, GameMaker Studio just stores textures as raw PNGs, no matter the compilation type.
# This script works by searching for all PNG images in the data file.
# This could be the data.win, .data, or gamename.exe files.

pngs = []

# Read in bytes mode- this file doesn't care what it looks like internally, so it doesn't use any special encoding.
# Using an encoding method would actually break it because UTF-8, python's string encoding, doesn't like some binary data.
# Instead, the bytes type is used to assure no encoding takes place.
with open(input("Target File Path: "), 'rb') as f:
    # Regex madness explanation:
    # A fully valid PNG file will have a start sequence and an end sequence.
    # These markers allow us select the whole contents of the file with regex.
    # The start sequence is 89 50 4e 47 0d 0a 1a 0a
    # Or in another form,   89 P  N  G  0d 0a 1a 0a
    # The ending marker is  49 45 4e 44 ae 42 60 82
    # Or in another form,   I  E  N  D  ae 42 60 82
    # Then, [\s\S]*? is used for a non-greedy select of all characters between the two markers.
    # .*? doesn't work because it won't accept line breaks.
    pngs = re.findall(b"\x89PNG\x0d\x0a\x1a\x0a[\s\S]*?IEND\xae\x42\x60\x82", f.read())

for n in range(len(pngs)):
    # Write in bytes mode
    with open(str(n) + '.png', 'wb') as f:
        f.write(pngs[n])
    print("Saved " + str(n) + ".png")