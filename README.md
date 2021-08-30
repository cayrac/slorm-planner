## convert img to remove white background
`
for file in *.png; do convert "$file" -transparent white "../../../src/assets/img/shoulders/$file"; done
`

TODO
 - optimisation legendary effect => ajouter EffectValueCraftable ?
 - passer activable / reaper en get / upgrade
 - commencer génération profil (XP skills)
