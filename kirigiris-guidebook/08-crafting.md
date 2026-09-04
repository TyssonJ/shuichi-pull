# 08 - Crafting (secao 07)

Receitas agrupadas por bancada.


## Workbench  (16 receitas)

### Small Parts  `small_parts`
- peso 0.2 | chance 100%
- ingredientes: 3x Rusty Scrap Metal
- Small parts for making various kinds of mechanisms.

### Processed Scrap Metal  `processed_scrap`
- peso 0.5 | chance 100%
- ingredientes: 3x Rusty Scrap Metal
- A piece of scrap metal. Used to make all sorts of things.

### Rag  `rag`
- peso 0.2 | chance 100%
- ingredientes: 3x Cloth
- A gray rag. In skilled hands it can wipe away any trace, as if it had never been there.

### Reinforced Scrap Metal  `reinforced_scrap`
- peso 0.5 | chance 100%
- ingredientes: 3x Processed Scrap Metal
- A piece of reinforced scrap metal. Used to make all sorts of things.

### Universal Parts  `universal_parts`
- peso 0.2 | chance 100%
- ingredientes: 3x Small Parts
- Universal parts for making mechanisms.

### Sensitive Mechanism  `sensitive_mecha`
- peso 0.2 | chance 100%
- ingredientes: 3x Processed Scrap Metal, 2x Small Parts
- Used in making complex devices.

### Complex Mechanism  `complex_mechan`
- peso 0.5 | chance 100%
- ingredientes: 4x Small Parts, 2x Sensitive Mechanism
- Used in making very complex devices.

### Lockpick  `lockpick`
- peso 0.3 | chance 100%
- yield: 3
- ingredientes: 1x Processed Scrap Metal, 2x Small Parts
- A thin metal plate. A cheap but effective way to open someone else's doors, if you have enough patience and dexterity.

### Toolbox  `tool_box`
- peso 2.5 | chance 100%
- ingredientes: 1x Hammer, 1x Adjustable Wrench, 1x Screwdriver
- A metal box with worn red coating, filled to the brim with tools. Scratches and oil marks are visible on the inside of the lid.

### Explosive Trap  `trap_explosive`
- peso 1.5 | chance 100%
- tool: "Отвёртка"
- ingredientes: 1x Explosives, 2x Reinforced Scrap Metal, 2x Sensitive Mechanism, 1x Circuit Board, 2x Duct Tape, 3x Universal Parts
- A trap disguised as an ordinary object or floor plate, triggering on approach.

### Explosives  `explosive`
- peso 3 | chance 100%
- tool: "Отвёртка"
- ingredientes: 1x Complex Mechanism, 3x Gunpowder, 3x Reinforced Scrap Metal, 2x Duct Tape
- A bomb dealing colossal damage to everyone within the blast radius.

### Bear Trap  `trap_trap`
- peso 1 | chance 100%
- ingredientes: 3x Processed Scrap Metal, 2x Sensitive Mechanism, 1x Universal Parts
- A classic hunting trap for immobilizing large game. Can be hidden under leaves or other objects.

### Molotov Cocktail  `molotov`
- peso 1.5 | chance 100%
- ingredientes: 2x Rag, 4x Alcohol, 4x Complex Mixture
- A classic cocktail that lights a fire in the hearts and bodies of your friends.

### Poison Gas Trap  `trap_gas`
- peso 1.5 | chance 100%
- ingredientes: 3x Reinforced Scrap Metal, 2x Sensitive Mechanism, 2x "Acid" Poison, 2x Duct Tape
- This trap releases a toxic gas that slowly fills the room when triggered.

### Somnus Grenade  `smokenade`
- peso 0.3 | chance 100%
- ingredientes: 2x Reinforced Scrap Metal, 2x Sensitive Mechanism, 1x Sleeping Pills, 2x Duct Tape
- A compact jar with thick violet vapor inside. Break it open and the world around dims: heaviness in the legs, thoughts melting away. Only the careful use it as a tool; the rest risk turning the game into a farce.

### Electroshock Trap  `trap_electro`
- peso 0.5 | chance 100%
- ingredientes: 3x Processed Scrap Metal, 1x Circuit Board, 2x Sensitive Mechanism, 1x Duct Tape
- From scrap metal, tape and electronics, a skilled hand assembled a trap ready to deliver a crushing electric discharge. It disguises itself as wiring, but step on it and a paralyzing current pierces the victim.


## Med. Lab  (15 receitas)

### Rag  `rag`
- peso 0.2 | chance 100%
- ingredientes: 3x Cloth
- A gray rag. In skilled hands it can wipe away any trace, as if it had never been there.

### Splint  `splint`
- peso 0.3 | chance 100%
- ingredientes: 2x Processed Scrap Metal
- A simple medical construction of wood and cloth. Rigid, uncomfortable, but able to restore the ability to move.

### Sleeping Pills  `poison_sleeping`
- peso 0.3 | chance 100%
- tool: "Шприц"
- ingredientes: 2x Special Extract, 3x Hemlock, 1x Alcohol
- A small vial of tasteless pills. Within the academy's clock, sleep turns not into rest but into a convenient weapon against the victim.

### Alcohol  `alcohol`
- peso 0.3 | chance 100%
- tool: "Шприц"
- ingredientes: 2x Special Extract, 3x Raw Solution, 2x Water
- Pure alcohol.

### Special Extract  `special_extract`
- peso 0.2 | chance 100%
- tool: "Шприц"
- ingredientes: 3x Raw Solution
- A chemical. Used in making various chemical substances.

### Anti-Toxin  `antitoxin`
- peso 0.2 | chance 100%
- tool: "Шприц"
- ingredientes: 1x Secret Reagent, 3x Complex Mixture, 3x Oleander, 2x Alcohol
- Anti-Toxin flushes all poisons from the body and also saturates it with all the necessary nutrients.

### Medic's First-Aid Kit  `medics_first_aid_kit`
- peso 0.5 | chance 100%
- tool: "Шприц"
- ingredientes: 1x Secret Reagent, 3x Complex Mixture, 3x Special Extract, 3x Oleander, 2x Bandage
- A complete set of all the medications needed for recovery. Significantly restores health.

### Jar of Medicine  `basic_first_aid_kit`
- peso 0.25 | chance 100%
- tool: "Шприц"
- ingredientes: 1x Complex Mixture, 3x Special Extract, 6x Hemlock, 2x Alcohol
- A small set of useful pills that restores your health.

### Bandage  `bandage`
- peso 0.2 | chance 100%
- ingredientes: 3x Cloth
- A sterile roll of cloth. At a critical moment it can buy a little time for someone bleeding out.

### Secret Reagent  `secret_reagent`
- peso 0.2 | chance 100%
- tool: "Шприц"
- ingredientes: 3x Complex Mixture, 2x Alcohol
- A special reagent for making complex serums and poisons.

### Complex Mixture  `complex_mixture`
- peso 0.2 | chance 100%
- ingredientes: 3x Special Extract
- A chemical. Used in making various chemical substances.

### "Acid" Poison  `poison_acid`
- peso 0.5 | chance 100%
- tool: "Шприц"
- ingredientes: 5x Special Extract, 3x Raw Solution, 6x Hemlock, 2x Alcohol
- A weak but still effective poison that wears your victim down. Can be mixed into food or a drink.

### "Despair" Poison  `poison_despair`
- peso 0.5 | chance 100%
- tool: "Шприц"
- ingredientes: 3x Secret Reagent, 4x Complex Mixture, 6x Oleander, 3x Alcohol
- A poison that plunges your enemy into absolute despair. Mix it into food and watch hope fade.

### "Widow's Kiss" Poison  `poison_widows_kiss`
- peso 0.5 | chance 100%
- tool: "Шприц"
- ingredientes: 1x Secret Reagent, 3x Complex Mixture, 3x Special Extract, 3x Oleander, 2x Alcohol
- A powerful poison that drains all life force from the victim. Can be mixed into food or a drink.

### "Hope" Serum  `serum_hope`
- peso 0.5 | chance 100%
- tool: "Шприц"
- ingredientes: 3x Secret Reagent, 5x Complex Mixture, 7x Oleander, 3x Alcohol
- A serum created from a concentrate of absolute hope.


## Kitchen Stove  (6 receitas)

### Meat Soup  `meat_soup`
- peso 0.5 | chance 100%
- ingredientes: 3x Water, 2x Vegetables, 2x Fried Meat
- A hot, thick defense against weakness. Slow to cook, quick to eat.

### Vegetable Salad  `salad`
- peso 0.5 | chance 100%
- ingredientes: 3x Vegetables
- A simple dish of fresh vegetables. The taste recalls a normal life beyond the academy.

### Stew  `stew`
- peso 0.75 | chance 100%
- ingredientes: 1x Cheese, 2x Vegetables, 3x Water, 3x Beef Tenderloin
- Meat, vegetables and the magic of slow simmering. Turns sadness into well-fed tiredness.

### Sandwich  `sandwich`
- peso 0.5 | chance 100%
- ingredientes: 2x Raw Bacon, 1x Bread, 1x Vegetables, 1x Cheese
- Everything you need, squeezed between bread. If only life were so convenient.

### Black Coffee  `coffee`
- peso 0.5 | chance 100%
- ingredientes: 2x Water, 1x Coffee Beans, 2x Sugar
- Pure bitterness, bracing to the point of paranoia. Sharpens focus, kills sleep.

### Fried Meat  `fried_meat`
- peso 0.5 | chance 100%
- ingredientes: 1x Raw Meat
- Filling, with a hint of smoke and fat. A great way to restore strength or stir up envy.
