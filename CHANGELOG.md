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

## Release 0.0.8 (2021-11-18)
### Added
- Added compatibility for The Slormancer 0.3.014
- Increased active legacy nodes to 3
- Raised maximum level to 50
- Reworked skills cost computing
### Fixes
- Synergies based on configuration are now correctly computed on the first load
- Fixed an issue when computing stack multipliers
- The Slormancer font is now correctly used
- Flashing Dart now has the correct description
- Extra elemental damage from reaper are now correctly added
- Ancestral activables are now correctly removed from the skill bar if the related ancestral node is removed
- Vindictive slam and mana detonation size are now correctly increased by aoe size stats

## Release 0.0.9 (2021-11-22)
### Added
- Added compatibility for The Slormancer 0.3.015

## Release 0.0.10 (2021-12-20)
### Changed
- Replaced pastee export to an "all in url" solution to avoid browser or antivirus blocking
- Activable slot menu is now also showed on left click (like the skill slot)
- Updated angular packages to latest versions
### Added
- Exported builds with pastee are now redirected to the "all in url" version
### Fixes
- Splendid greaves icon is no longer missing

## Release 0.0.11 (2022-01-11)
### Changed
- Downloading a layer now use the layer name for the generated file
- Reduced the max level back to 50 (up to 100 by mistake in version 0.0.10)
### Fixes
- Material theme now correctly use the Berlin (Slormancer) font
- Fixed an issue causing some item stats to be ignored when parsed from a save file
- Fixed an error when parsing url in the import textarea 
- It should no longer be possible to load a layer from a class into a build from another class
- Fixed some activables values not being updated correctly
- Fixed generated build links not containing slorm-reaper sub folder
### Added
- Added optimize items stats modal on character settings menu
- It is now possible to have multiple builds

## Release 0.0.12 (2022-01-21)
### Fixes
- Fixed an issue causing the import build on the exported build view to be hidden
### Added
- Added save files location on the import save button
- Added skills estimated time between casts
- Exported build view now display the build original version if it is not the latest

## Release 0.1.0 (2022-02-15)
### Changed
- Changed 'all characters level' configs to 'all other characters level' config and updated the default value
- Added the 20 new reapers (19 obtainable + 1 implemented) with the help of Blãcksad, Wiffle and Legrems
### Fixes
- Item and skill icons are no longer blurry
- Fixed an issue causing activables to be unexpectedly removed from the skillbar
- Reaper description overlay should no longer hide the reaper slot
### Added
- Added an icon to show locked skills and ultimatum
- Build view now show an icon if the build has been made for an older version of the game

## Release 0.1.1 (2022-02-15)
### Fixes
- Save parser service now set numbers to Number.MAX_SAFE_INTEGER when parsing a number larger to this value
- Added a missing bracer icon

## Release 0.1.2 TBR
### Changed
- Raised max level to 60
- Item affixes are now shown in the correct order


## TODO
 - ancestral legacies
 - reaper untouchable
 - maj armor of illusion
 - Mana Harvesting Reaper 
 - mana regen pas bonne
 - precision overdrive
 - selector stat plus visible


 - bug shield of champion of light aura is always level 10
 - arondi en .5 inconsistant (exemple light wave et glittering silence avec Area Increased Effect 21.5%)  => probablement changement de bankerRound en round
 - walking bomb has it's aoe size affected by aoe increased size but it's aoe damage not affected by aoe increased effect

## Planned changes
- Damages computing rework (probably when imbue passives are out)
- copy item as image ?
