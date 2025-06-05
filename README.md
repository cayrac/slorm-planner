This project is a build planner for the game <a href="http://www.slormitestudios.com/">The Slormancer</a>

## Install and run project

### Windows
Install node and npm : https://nodejs.org/en/download/

Run `npm install`

Run `npm run start` to start the server on http://localhost:4200/

### Linux
Install node and npm with apt (https://doc.ubuntu-fr.org/nodejs) or pacman  (https://wiki.archlinux.org/title/Node.js)

Run `npm install`

Run `npm run start` to start the server on http://localhost:4200/

## Removing white background from pngs
`
for file in *.png; do convert "$file" -transparent white "$file"; done
`

je vois que Exhilarating Speed ne s'applique pas en tourmenté, je note pour le fix plus tard
