# 03 — Game loop (secao 01)

A single session has 16 students, each trying to survive and leave the Academy. The game runs in chapters; a chapter passes through four phases.

## 🧭 Chapter phases

- **PHASE 1 · Daily Life** — Exploration, relationships, survival.

- **PHASE 2 · Crime** — Murder, traps, body discovery.

- **PHASE 3 · Investigation** — Evidence, fingerprints, alibis, hiding evidence.

- **PHASE 4 · Class Trial** — Debates, energy, voting.

## 🌞 Phase 1 · Daily Life

This is the main phase of the game. Students explore the Academy, build relationships and secure their physical survival.

### Needs and survival

Your character has needs. Ignoring them for too long applies debuffs, and in a critical state leads to death.

- **Satiety:** restored with food.

- **Energy:** restored with sleep or stimulants (coffee, energy drinks).

### Crafting and economy

Resources are scattered around the Academy in containers (refreshed every day at 05:00 in-game time) and can be processed at special stations:

- **Technical workbench** — gadgets, traps, weapons.

- **Medical workbench** — first-aid kits, bandages, poisons, sleeping pills.

- **Kitchen stove** — cooking complex food (gives buffs).

- **Vending machine** — buying simple food.

- **Monoshop** — a shop of rare items for winning or killing.

### Personal space and trash

- **Personal safe** — located in the player's room. It has a reinforced lock that is harder to pick.

- **Incinerator** — all items dropped on the floor anywhere on the map fall into the incinerator bins after 24 in-game hours and are stored there for the rest of the game. Items inside containers do not become trash.

## 🔪 Phase 2 · Crime

At any moment a player can decide to become the "Blackened" by killing a player character.

### Methods of murder

- **Melee weapons:** blunt, bladed, hybrid (hammer, knives, shovels, etc.).

- **Traps:** bear traps, tripwires.

- **Special means:** poisons, sleeping pills.

- **Environment:** pushing from a height, locking someone in the freezer (cold) or the sauna (overheating), crushing with other objects (elevator, curtain, bars).

### Rules of murder

- One player can kill no more than 2 characters per chapter.

- In the case of suicide, the player leaves the match and gains no experience (XP).

### Body discovery

A body counts as discovered when at least **3 different characters** look at it — the killer can be among them, but not first and only after 20 real-time seconds. If the body is not found within 5 real-time minutes, an automatic alert triggers.

## 🔍 Phase 3 · Investigation

As soon as the body-discovery signal sounds, the search for evidence begins. Combat is blocked.

### Timer and conclusion

- **Dynamic timer:** investigation time depends on the open gates — 7 minutes at the start of the game, +2 minutes for each open floor, maximum 15 minutes.

- **Early conclusion:** players can start the trial before the timer if a majority of the survivors gathers near the Red Doors (the entrance to the trial elevator).

### Examining the body

Interacting with the body produces a **Monokuma File:**

- The victim's name.

- The time of the murder (±1 minute of in-game time).

- A list of injuries and special marks.

### Evidence

- **Murder evidence:** evidence appears beneath the slain victim, by which you can tell whether the body was moved.

- **Fingerprints:** visible and collectible only with a UV Flashlight. Gloves/disguise leave "Indeterminate fingerprints" (smudged).

- **Bloody hands:** after striking with a weapon, the killer's hands leave bloody prints. They are visible to everyone, but can only be collected as evidence with a UV Flashlight.

- **Environmental evidence:** charred blast sites, sprung bear traps, empty poison vials.

### Hiding evidence

- **Rag** — wipes blood and fingerprints off items/weapons.

- **Mop** — washes pools of blood off the floor, prints off walls, and other evidence.

- **Sinks** — remove the soiled-hands effect.

## ⚖️ Phase 4 · Class Trial

The climax of the chapter. It lasts 15 real-time minutes.

### Energy and actions

Each player has a reserve of Energy, spent on:

- Initiating a vote (switching the stage to choosing the Blackened).

- Calling a debate (1-on-1).

- **Interrupt** — forcibly switch the camera to yourself and mute the others.

- **Agree** — show an agreement animation on the interface.

### Camera and arguments

- **Focus:** the camera follows whoever is holding the voice-chat button. The others get in line.

- **Evidence:** players can present found evidence or inventory items to everyone (showing their condition).

### Special debate mechanics

- **Cross-debates:** a duel between two players. The others stay silent but write "Noise" (pink text in chat), which obstructs the view. The winner restores energy.

- **Scrum debates:** triggered on a tie vote. A team argument battle. If a tie happens three times in a row — the Blackened wins automatically.

## 📖 Every chapter of the game

- Welcome to the Academy

- Sparks of Hope, Drenched in Blood

- Betrayal as an Art

- Friendship on a Knife's Edge

- A Labyrinth of Lies and Fear

- The End of Hope, the Dawn of Despair

- The Final Act of Despair

## 🏆 Endings

Your finale depends on your playstyle, your moral compass and your ability to make hard decisions.

### 🔪 Blackened victory

The path of cunning, composure and deception. Kill a player character, survive the investigation phase, and confuse the others at the trial so that they vote for an innocent.

**Result:** The Blackened goes free. Everyone else loses.

### 🌱 Peaceful victory · Final quest "Choice of Peace"

The hardest and most dramatic path. Students must complete quests, restore the life-support systems and reach the Evacuation Room on the 4th floor.

- **Rules suspended.** For the duration of the finale, the Academy's rules are suspended: there is no punishment for damage, and murders do not lead to a Trial.

- **Rescue limit.** The number of capsules is **55% of the survivor count, rounded up, maximum 8**. The result is fixed after the doors open, not during the capsule lockdown.

- **Timing and capsules.** At first the capsules are locked — time to decide who is worthy. When the timer runs out, the capsules unlock.

- **Loss conditions.** If there are fewer survivors than active capsules, or they don't make it inside before the timer — everyone loses.

The full "survivors → capsules" table is in the "Repairs" section, Stage 4.

### 🕊 Survivors' victory

The path of waiting it out or wiping out the opponents entirely. If, through murders and trials, only 2 students remain, the game ends: the rules stop applying and the Academy's doors open automatically.

### ☠ Defeat

Your character's story ends if you were killed during the game or the final quest, killed at the trial (as the murderer or by a voting mistake), or failed to take a capsule during the peaceful victory.