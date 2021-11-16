## Release 0.0.1 (2021-10-10)

### Added
- Initial release

## Release 0.0.2 (2021-10-12)

### Added
- Added a content blocked page if the browser block the main scripts
- Added a content blocked modal if the browser block a paste.ee request
- Added a build configuration page
### Fixes
- Activables are now correctly removed from the skill bar if you remove the related item / reaper / ancestral legacy node
- Creating a new build no longer initialize your available attribute points to 0
- Fixed an issue when parsing ressources item (ressources value of size 6 instead of 8)
- Ancestral legacies tab now correctly work on Firefox

## Release 0.0.3 (2021-10-12)

### Fixes
- Fixed an issue causing character stats to be empty on first load

## Release 0.0.4 (2021-10-15)

### Added
- Added the correct average hit value on character view
- Added a compare item option
- Added a compare layers page
- Added a change equipped items level option
- Added a change equipped items reinforcment option
- Added a link to slormite studio website in the sidenav
### Changed
- Aura and buff effects are now only added to stats if the related activable is in the skill bar
### Fixes
- Fixed an issue causing items to not be visually updated
- Skills mana cost is now correctly computed based on upgrades
- Manabender now correctly add additional damages to skills based on their mana cost
- Fixed a parsing error on float values
- Fixed an import soft lock on invalid import key
- Fixed an issue preventing a file to be uploaded twice in a row
- Turn the tide now correctly increase projectile damages

## Release 0.0.5 (2021-10-15)
### Added
- Added name in character view link
### Fixes
- Cloak of the insatiable now correctly increase bounce number

## Release 0.0.6 (2021-10-17)
### Added
- Added mechanics
### Fixes
- Fixed an issue causing the changelog to be in the past
- Fixed an issue with arcane breach configuration and buffs not being applied

## Release 0.0.7 (2021-10-18)
### Added
- Stats tab now display full details and formula when a stat is selected

## Release 0.0.8 (TBD)
### Added
- Added compatibility for The Slormancer 0.3.014
- Fixed text font issues
- Increased active legacy nodes to 3
- Raised maximum level to 50
- Fixed an issue when computing stack multipliers
- Reworked skills cost computing

TODO
 - différence additional damage (extra) et skill additional damage
 - reaper ajouté en "extra"
 - supprimer activables si non disponible
