## Install and run project

### Windows
Install node and npm : https://nodejs.org/en/download/

Run `npm install`

Run `npm run start` to start the server on http://localhost:4200/

### Linux
Install node and npm with apt (https://doc.ubuntu-fr.org/nodejs) or pacman  (https://wiki.archlinux.org/title/Node.js)

Run `npm install`

Run `npm run start` to start the server on http://localhost:4200/

### Build and run docker image

Build docker image :  `docker build -t slormplanner-image .`

Run docker image :  `docker run -d -p 8080:4200 --name=slormplanner slormplanner-image`

## Removing white background from pngs
`
for file in *.png; do convert "$file" -transparent white "$file"; done
`
