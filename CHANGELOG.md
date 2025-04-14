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
- Added a change equipped items reinforcement option
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

## Release 0.1.2 (2022-04-26)
### Changed
- Raised max level to 60
- Item affixes are now shown in the correct order
- Ancestral legacies map now show the new ancestral legacies
- Skill / Ancestral legacies / Attributes tab now take all the page's height
- Goldfish primordial malediction no longer disable cumulative values on greater traits despite it's description
- Skills now handle multiple ressource cost
### Fixes
- Item edit stat sliders are now more visible
- Fixed some rounding issues
- "My finess pal" finesse upgrade now correctly synergise with movement speed percent instead of movement speed
- Fixed a damage computing issue with Savagery 60 and Void Arrow's "Netherfire from the void" / Orb of the arcane master's "ancestral orb"
- Fixed some skill upgrade values not being updated based on their tags
- Sleepy butterfly reaper now correctly set cooldowns to a minimum of 2s
- Stash are no longer loaded from a game save with the material tabs causing items to be incorrectly placed (older builds will not be updated)
- "Booster max" effect is no longer applied if the booster max buff is unchecked in configuration
- "Ancestral champion's present" no longer cause ancestral legacies rank to change unexpectedly
- "Sigil of boldness" no longer increase upgrade damages
- "Reckless" now correctly apply it's damage bonus
- "Vengeful hurricane" is no longer affected by "Full Plate Armor"
- Changing the hero level now correctly update it's level
### Added
- Added an export link on the create build component

## Release 0.1.3 (2022-05-12)
### Added
- Select options for reapers or affixes can now be filtered
### Changed
- Removed paste.ee support for old exported builds
- Updated website navigation and modules organisation
- Added a maximum rarity option to optimize item affixes (by uilman)
- Reworked a bit build creation modal
### Fixes
- Attribute tab now correctly update when changing layer
- Fixed some cases of variables not being correctly injected in mechanic templates
- Optimize item affixes should no longer create impossible items
- Manabender now correctly increase skill damages based on it's cost
- Item edit modal reset's button now correctly reset item to it's original value

## Release 0.1.4 (2022-05-13)
### Added
- Added a slorm-reaper list page

## Release 0.1.5 (2022-07-14)
### Added
- Title is now dinamically updated
- Updated game data files
- Added a default page
### Changed
- reaper image copy is no longer available on firefox (image copy is not supported yet)
### Fixes
- Armor of Obliteration now correctly increase armor and elemental resistance if you are channeling Ray of Obliteration
- Fixed Ultra Canon and Manabender activable description

## Release 0.2.0 (2022-10-02)
### Added
- Added runes
- Added Reaper affinity
- Added search for ultimatum, reaper and runes
### Changed
- Updated game data
- Removed unavailable flag on fate crusher
### Fixes
- Ancestral legacy reaper now correctly convert reaper damage to elemental damage with non primordial versions
- Fixed a rounding issue on ancestral legacy aoe size
- Fixed Immortal Arrow instructions count
- Fixed pure stats always showing 2 !

## Release 0.2.1 (2022-10-03)
### Fixes
- Fixed an issue when loading a saved build from previous version
- Fixed an issue preventing mana and life lock synergies from working

## Release 0.2.2 (2022-10-05)
### Fixes
- Fixed runes templates not being correctly updated on change
- Fixed rune of the Magnificient Leviathan damage limit not being applied
- Legendaries list now correctly update affinity and level when "max level and affinity" is checked
- Fixed typo

## Release 0.2.3 (2022-10-15)
### Changed
- Fate-crusher no longer benefit from item's affinity
### Fixes
- Fixed an issue with ultimatum not being applied to stats
- Ancestral Legacy reaper malediction no longer reduce skill damages from upgrades to 0
- Fixed a rounding issue on activation runes with constraint
- Fixed a skill level parsing issue causing exported url to be corrupted
- Fixed Doubtful Sock legendary not being correctly loaded

## Release 0.2.5 (2022-15-19)
### Added
- Added epic stats restrictions
- Now use slormancer-api package 0.2.5

## Release 0.2.5.1 (2023-22-01)
## Fixes
- Item edition epic stats no longer show incorrect options

## Release 0.2.5.2 (2023-22-01)
## Fixes
- Item edition epic stats no longer show incorrect options (again)

## Release 0.3.0 (2023-07-02)
### Added
- Raised max level to 70
- Ancestral legacies map now show the new ancestral legacies
## Fixes
- Cooldown reduction is now correctly applied to ancestral legacy activables

## Release 0.3.1 (2023-08-02)
## Fixes
- Fixed ancestral legacy realms not being correctly mapped

## Release 0.4.0 (2023-19-07)
### Added
- Raised max level to 80
- Added new legendaries data
- Added reinforcement cap to legendaries
- Ancestral legacies map now show all ancestral legacies
## Fixes
- Fixed Replenish upgrade order 
- Lightning minimum damage is now correctly computed
- Fixed an issue causing ancestral legacy active effects to be applied twice
- Fixed an issue causing exported build with character level above 64 to have an incorrect level

## Release 0.4.1 (2023-25-07)
## Fixes
- Fixed an issue causing exported build with item level above 64 to have an incorrect level
- Fixed an issue causing exported build with an attribute rank above 64 to have an incorrect rank
- it is no longer possible to allocate more than 75 points into an attribute

## Release 0.4.2 (2023-05-08)
## Fixes
- Fixed an issue when displaying slorm reapers list with maximum level and affinity

## Release 0.5.0 (2023-24-09)
### Added
- Increased ancestral stone max and added the first stone
- Added a "triggered by book smash" config option for Embittered author
## Fixes
- Fixed Judge of Light incorrect % value
- Fixed Ancestral Instability incorrect % value
- Consistency is key minimum damage can no longer be below 1% of maximum
- Elemental reward max rank is now correctly affected by Ancestral champion's present

## Release 0.5.1 (2023-24-09)
## Fixes
- Fixed an issue when adding the first stone while not all ancestral nodes are present

## Release 0.6.0 (2024-03-23)
### Added
- Added all new available reapers
- Summon skeleton squire now has a config to add the number of summoned skeletons to minions under your control
- Reaper description tooltip now have a scroll bar if the content is too large
## Fixes
- Personal Development Magazine damage multiplier is no longer applied twice
- Reaper primordial data are no longer lost when parsed from a save file
- Attributes now allow invalid values on save parsing to avoid issues with corrupted saves
- Ancestral legacy nodes should no longer allow impossible configurations
- Blorm damages is now correctly based on skill damage
- Determination synergy is now based on 100% tenacity instead of 1%
- Tenacity is now correctly capped at 100%
- Waste Not is no longer affected by Area Increased Size
- Inner fire and overdrive multipliers are now applied after additional damages
- Oak-Bark Armor stacks are now correctly applied to stats
- Personal development magazine damage bonus is no longer applied to upgrades
- Fixed a save parsing error with profile values
- Switching to another reaper now change the current reaper level if the previous value is not allowed
- Fixed multiple item modal edition issues

## Release 0.6.2 (2024-03-23)
### Added
- Updated game files

## Release 0.6.3 (2024-03-23)
### Fixes
- Fixed an issue when updating reaper data (0.6.2 builds will have their affinity set to 100)
- Reaper list now show the correct reapers for max level and affinity

## known issues
- switching between builds on the planner do not correctly change the class
- signet ring of the Mc ripped require a reload to be updated in the skill bar

## Release 0.6.4 (2024-03-24)
### Changed
- Auras no longer have to be in the skill bar to be active
### Fixes
- Mana is Overrated chance is no longer affected by aura increased effect
- Fixed a synergy loop with the ungifted reaper
- Fixed an issue causing skills to not be affected by area increased size stat
- Mana harvesting rune damage is now based on reaper damage
- Total mastery count no longer ignore the last skill mastery
- Unkillable berzerker reaper additional damage multiplier is now correctly applied

## Release 0.7.0 (2024-10-14)
### Added
- Added all the changes from the balance update
### Changed
- Improved the ancestral nodes display to show the remaining stones
### Fixes
- Skill upgrades are no longer ignored when not in the skill bar
- Skill levels are no longer lost when reloading the page
- Ancestral gift base ranks are no longer randomly increased or lowered with ancestral champion's present
- Fixed some incorrect ancestral legacy nodes mapping
- Fixed an issue causing skill related class mechanics to not be shown
- Fixed an issue causing class mechanics to not be uptated
- Fixed many skills interactions
- Summon maximum possible skeletons config should now correctly work with evasive magic
- Reaper affinity should now apply it's value to stats the same way the game does
- Equiping an item using the context menu now correctly update the current layer
- Reaper list page no longer show reapers with a base affinity of 100
- Fixed an issue causing reaper affinity to be hidden
- Legendary activables are now correctly capped at 15 reinforcements

## Release 0.8.0 (2025-04-06)
### Added
- Added all new legendaries
- Added an "apply indirect damage multiplier" option for Relentless Transferance reaper
- Added neither item edition
- Added the 2 last reapers (todo)
### Fixes
- Fixed an computing issue with increased aoe ultimatum and increased aoe from skills
- Savagery 60 should now correctly work with Raw Lock
- Fixed a computing between with Splintering Vine and Splintered
- Fixed incorrect base damage from Frostbolt and Flashing Dart
- Missing mana can no longer use more than 100% of your maximum mana
- Light Diffusion now correctly increase Flashing Dart damages
- Aura increased effect now correctly reduce Lowey's Gratitude's time between Fireballs
- Master the Arcane Missile now correctly apply it's cooldown reduction
- Swift Wings of Hermesal now correctly apply it's cooldown reduction
- Rifts of Oblivion now correctly increase damages based on arcanic emblems instead of obliteration emblems
- Optimise items now correctly work with defensive stats
- Indomitable Mountain bonus effect is now correctly enabled if any "took_x_damage_recently" is enabled
- Primordial Support reapers now correctly apply other specialization passive effects
- Shaman reapers configuration now correctly apply totem tag to Wood Stick instead of Mighty Swing
- Fixed item edition modal suggesting the wrong stats for an item and rarity
- Fixed reaper stat values not being applied the way the game do
- Fixed many synergies and damage values not being updated correctly
- Updated Honorary Sigil of Chivalry decreased damage value
- Non primordial Elemental Overload reaper no longer reduce critical strike damage
- Unity reaper now correctly count the number of vigilant blades
- Ultimatum of Impeccable Technique now correctly increased inner fire damage instead
- Fixed Shearing Winds damage type
## retours

## Release 0.8.1 (TBD)
### Added
- Added a search bar for the legendary effect on the item edition modal
- Searching for a reaper name in the search bar now show legendary effects for that reaper
- Added new icons transparency
### Fixes
- Fixed an item parsing issue
- Fixed some legendary synergies not being computed correctly when in the shared inventory
- Fixed Fist of the Wild (and it's upgrades) damage types
- Fixed reinforcement typo
- Fixed item edition stuck when editing a non neither items without legendary effects
- Fixed Holy Benediction activable healing values
- Fixed some translations errors
- Removed the poison tag from Dazing Smoke and added it back to Toxic Fire
- Fixed missing value for buff descriptions
- Fixed tooltip position getting out of screen for item and reapers

## TODO
- update packages ?