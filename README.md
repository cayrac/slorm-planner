## convert img to remove white background
`
for file in *.png; do convert "$file" -transparent white "../../../src/assets/img/shoulders/$file"; done
`

TODO
 - optimisation enchantments
 - optimisation legendary effect
 - passer activable / reaper en get / upgrade
 - commencer génération profil (XP skills)
