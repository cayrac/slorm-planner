## convert img to remove white background
`
for file in *.png; do convert "$file" -fuzz 4% -transparent white "../../../src/assets/img/shoulders/$file"; done
`