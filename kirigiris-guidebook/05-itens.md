# 05 - Itens (secao 05)

Total: 162 itens.
Campos: nome, categoria, ramo, raridade, peso, descricao, locais de spawn (com peso), receita.


## "Acid" Poison   `poison_acid`
- Categoria: Consumable | Ramo: Medicine | Raridade: Rare | Peso: 0.5
- Descricao: A weak but still effective poison that wears your victim down. Can be mixed into food or a drink.
- Craft: [Med. Lab] chance 100% - 5x Special Extract, 3x Raw Solution, 6x Hemlock, 2x Alcohol
- effect: Loses 2% health every 5 seconds for 300 seconds; Energy drains 20% faster for 180 seconds

## "Despair" Poison   `poison_despair`
- Categoria: Consumable | Ramo: Medicine | Raridade: Legendary | Peso: 0.5
- Descricao: A poison that plunges your enemy into absolute despair. Mix it into food and watch hope fade.
- Craft: [Med. Lab] chance 100% - 3x Secret Reagent, 4x Complex Mixture, 6x Oleander, 3x Alcohol
- effect: Loses 20% health every 5 seconds for 60 seconds; Disorientation for 30 seconds; Reaction speed reduced by 15%

## "Hope" Serum   `serum_hope`
- Categoria: Consumable | Ramo: Medicine | Raridade: Legendary | Peso: 0.5
- Descricao: A serum created from a concentrate of absolute hope.
- Craft: [Med. Lab] chance 100% - 3x Secret Reagent, 5x Complex Mixture, 7x Oleander, 3x Alcohol
- effect: Full health restoration; Removes most negative effects and all poisons; Immunity to negative effects; Reduces incoming damage by 50%
- mechanics: {"hp": "restores up to 100 u.", "buff": "Absolute resistance (300 sec): damage -50%, negative effects have no effect", "cures": ["All negative effects and poisons, no exceptions"], "applies": ["absolute-resistance"]}

## "Widow's Kiss" Poison   `poison_widows_kiss`
- Categoria: Consumable | Ramo: Medicine | Raridade: Very rare | Peso: 0.5
- Descricao: A powerful poison that drains all life force from the victim. Can be mixed into food or a drink.
- Craft: [Med. Lab] chance 100% - 1x Secret Reagent, 3x Complex Mixture, 3x Special Extract, 3x Oleander, 2x Alcohol
- effect: Loses 8% health every 5 seconds for 120 seconds; Satiety drains 30% faster for 180 seconds

## Academy Archive File   `arch_doc`
- Categoria: Other | Ramo: Other | Raridade: Very rare | Peso: 1
- Descricao: This file lay in the archive long enough to stop being checked, but not long enough to lose relevance. A thick stack of yellowed documents, tied with cord and marked with a stamp.

## Academy Class Register   `schl_book`
- Categoria: Other | Ramo: Other | Raridade: Rare | Peso: 1
- Descricao: A thick register filled with neat tables and notes. Inside are student rosters, attendance marks and records of movements between classes.

## Academy Head's Keycard   `keycard_head`
- Categoria: Other | Ramo: Other | Raridade: Legendary | Peso: 0.1
- Descricao: A black keycard with golden engraving and the Academy's crest. The built-in access indicator faintly flickers, confirming an active clearance level.

## Academy Secret Files   `doc_sec`
- Categoria: Other | Ramo: Other | Raridade: Very rare | Peso: 0.5
- Descricao: A stack of service documents marked with a security label. The paper has yellowed with time, and the lines in places look deliberately blurred or struck out. It seems part of the information was hidden after printing.

## Academy Service Laptop   `lap_acd`
- Categoria: Other | Ramo: Other | Raridade: Rare | Peso: 2
- Descricao: A portable computer in a strict casing with a worn keyboard and a dim screen. When turned on it boots slowly, as if reluctant to share what it holds. Some keys are noticeably worn — they were pressed more often than the rest.

## Adjustable Wrench   `adjustable_wrench`
- Categoria: Weapon/Tool | Ramo: Universal | Raridade: Common | Peso: 1
- Descricao: A universal tool for work. Heavy and sturdy. Used in making items.
- Spawns:
    - Boiler Room - peso 1.0
- effect: Bludgeoning

## Advanced Devices Manual   `man_adv`
- Categoria: Other | Ramo: Other | Raridade: Very rare | Peso: 0.5
- Descricao: A thick hardcover book with technical schematics on the title page.

## Alcohol   `alcohol`
- Categoria: Resource | Ramo: Medicine | Raridade: Rare | Peso: 0.3
- Descricao: Pure alcohol.
- Spawns:
    - Boiler Room - peso 1.0
- Craft: [Med. Lab] chance 100% - 2x Special Extract, 3x Raw Solution, 2x Water

## Ammunition   `ammo`
- Categoria: Other | Ramo: Other | Raridade:  | Peso: 
- note: Metadata missing — awaiting source update.
- placeholder: true

## Anti-Toxin   `antitoxin`
- Categoria: Consumable | Ramo: Medicine | Raridade: Very rare | Peso: 0.2
- Descricao: Anti-Toxin flushes all poisons from the body and also saturates it with all the necessary nutrients.
- Craft: [Med. Lab] chance 100% - 1x Secret Reagent, 3x Complex Mixture, 3x Oleander, 2x Alcohol
- effect: Reduced satiety consumption; Neutralizes the effects of the "Acid" and "Widow's Kiss" poisons
- mechanics: {"buff": "Satiety -50% slower (300 sec)", "cures": ["Acid", "Widow's Kiss"], "applies": ["hunger-resistance"]}

## Antidote   `antidote`
- Categoria: Consumable | Ramo: Medicine | Raridade: Uncommon | Peso: 0.35
- Descricao: An effective antidote against weak poisons.
- effect: Removes the effects of the "Acid" poison
- mechanics: {"cures": ["Acid"]}

## Bandage   `bandage`
- Categoria: Resource | Ramo: Medicine | Raridade: Common | Peso: 0.2
- Descricao: A sterile roll of cloth. At a critical moment it can buy a little time for someone bleeding out.
- Craft: [Med. Lab] chance 100% - 3x Cloth
- effect: Stops bleeding.

## Baseball Bat   `baseball_bat`
- Categoria: Weapon/Tool | Ramo: Universal | Raridade: Rare | Peso: 5
- Descricao: Perfect for play on the field. And in a tense situation — a means to fend off any blow, including an enemy's.
- damageType: Дробящее

## Batteries   `batteries`
- Categoria: Consumable | Ramo: Universal | Raridade: Uncommon | Peso: 0.05
- Descricao: A set of batteries used to power and recharge electrical devices.
- Spawns:
    - Boiler Room - peso 1.0
    - Gym — Workbench (1F) - peso 1.0
    - Gym — Stage (1F) - peso 40
- effect: When used, restores the charge of compatible electronic items

## Bear Trap   `trap_trap`
- Categoria: Consumable | Ramo: Engineering | Raridade: Rare | Peso: 1
- Descricao: A classic hunting trap for immobilizing large game. Can be hidden under leaves or other objects.
- Craft: [Workbench] chance 100% - 3x Processed Scrap Metal, 2x Sensitive Mechanism, 1x Universal Parts
- effect: Deals 30 damage and immobilizes the player for 3 seconds; Movement-speed reduction for 10 seconds

## Beef Tenderloin   `beef_tenderloin`
- Categoria: Resource | Ramo: Food | Raridade: Rare | Peso: 0.5
- Descricao: The best meat you can find. Tender, expensive, strangely suspicious.
- effect: Minor satiety restoration; Poisoning
- mechanics: {"hunger": "+5%", "hp": "-22 u.", "extra": "Poisoning 60 sec", "applies": ["poisoning"]}

## Black Coffee   `coffee`
- Categoria: Consumable | Ramo: Food | Raridade: Rare | Peso: 0.5
- Descricao: Pure bitterness, bracing to the point of paranoia. Sharpens focus, kills sleep.
- Craft: [Kitchen Stove] chance 100% - 2x Water, 1x Coffee Beans, 2x Sugar
- effect: Small energy restoration; Bonus to evidence-detection radius; Caffeine shock when overused
- mechanics: {"vigor": "+25%", "extra": "On repeated caffeine intake: caffeine shock (600 sec)"}

## Bloody Fingerprint   `bloody_fingerprint`
- Categoria: Other | Ramo: Universal | Raridade: Common | Peso: 0.01
- Descricao: A unique pattern left on the surface. Physical evidence pointing to involvement.
- note: Source: *source_location*

## Bloody Shoe Print   `bloody_footprint`
- Categoria: Other | Ramo: Universal | Raridade: Common | Peso: 0.01
- Descricao: A unique pattern left on the surface. Physical evidence pointing to involvement.

## Body Armor   `armor`
- Categoria: Other | Ramo: Other | Raridade:  | Peso: 
- note: Metadata missing — awaiting source update.
- placeholder: true

## Bread   `bread`
- Categoria: Resource | Ramo: Food | Raridade: Common | Peso: 0.25
- Descricao: A dense chunk of carbs. Goes well with meat, cheese and paranoia.
- effect: Minor satiety restoration
- mechanics: {"hunger": "+1%"}

## Broken Lockpick   `lockpick_broken`
- Categoria: Other | Ramo: Other | Raridade:  | Peso: 
- note: Metadata missing — awaiting source update.
- placeholder: true

## Camera   `photocamera`
- Categoria: Weapon/Tool | Ramo: Universal | Raridade: Legendary | Peso: 2
- Descricao: Lets you take pictures of evidence, traces, notes and suspicious objects.
- effect: Hybrid

## Car Wheel   `wheel_car`
- Categoria: Other | Ramo: Other | Raridade: Rare | Peso: 3.5
- Descricao: A massive wheel with a metal rim and deep tread.

## Central Processor   `cpu_core`
- Categoria: Other | Ramo: Other | Raridade: Rare | Peso: 0.5
- Descricao: A square computing module with a metal cover and a contact panel that glints with a cold shine.

## Cheese   `cheese`
- Categoria: Resource | Ramo: Food | Raridade: Common | Peso: 0.25
- Descricao: Strong-smelling, but melts in your mouth. Perfect for sandwiches and strange experiments.
- effect: Minor satiety restoration
- mechanics: {"hunger": "+1%"}

## Chemical Heat Pack   `chemical_heating`
- Categoria: Consumable | Ramo: Universal | Raridade: Common | Peso: 0.2
- Descricao: You don't know what's inside. And it's better not to ask. The main thing is — it keeps you warm.
- effect: Raises body temperature by +1.5°C and slows cooling for 3 min.

## Chips   `chips`
- Categoria: Consumable | Ramo: Food | Raridade: Common | Peso: 0.5
- Descricao: A crunchy noise in the silence. Not nutritious, but oh so pleasant.
- effect: Small satiety restoration
- shop: {"vendor": "vending", "price": 15}
- mechanics: {"hunger": "+15%"}

## Chocolate Cookie   `cookies`
- Categoria: Consumable | Ramo: Food | Raridade: Common | Peso: 0.25
- Descricao: A round cookie with dark chocolate chips, baked in a hurry. The surface is slightly cracked, and the aroma still feels warm and homey — too cozy for the Academy's walls.
- effect: Small satiety restoration
- mechanics: {"hunger": "+15%"}

## Circuit Board   `plate`
- Categoria: Resource | Ramo: Engineering | Raridade: Uncommon | Peso: 0.5
- Descricao: A basic component of electrical devices.
- Spawns:
    - Boiler Room - peso 1.0
    - Kitchen - peso 1.0

## Classified Facility Blueprints   `log_cls`
- Categoria: Other | Ramo: Other | Raridade: Very rare | Peso: 0.5
- Descricao: A set of technical schematics and blueprints, laid out in disarray and marked with a stamp.

## Cleaning Agent "Without a Trace"   `cln_nf`
- Categoria: Other | Ramo: Other | Raridade: Uncommon | Peso: 0.7
- Descricao: A thick plastic bottle with a bright label and a sharp chemical smell. Judging by the liquid level, the bottle has already been used more than once.

## Cleaver   `kitchen_axe`
- Categoria: Weapon/Tool | Ramo: Universal | Raridade: Uncommon | Peso: 3
- Descricao: Sharp and handy for chopping meat. With such a helper you can butcher any carcass. Lets you cut zip ties.
- Spawns:
    - Boiler Room - peso 1.0
- damageType: Колото-режущее

## Cloth   `fabric`
- Categoria: Resource | Ramo: Engineering | Raridade: Common | Peso: 0.6
- Descricao: Pleasant-to-the-touch cloth.
- Spawns:
    - Boiler Room - peso 1.0
    - Kitchen - peso 40

## Coffee Beans   `coffee_beans`
- Categoria: Resource | Ramo: Food | Raridade: Common | Peso: 0.2
- Descricao: Coarse, bitter and vital for coffee connoisseurs.
- mechanics: {"extra": "No effect"}

## Coins   `money2`
- Categoria: Other | Ramo: Other | Raridade:  | Peso: 
- note: Metadata missing — awaiting source update.
- placeholder: true

## Complex Mechanism   `complex_mechan`
- Categoria: Resource | Ramo: Engineering | Raridade: Very rare | Peso: 0.5
- Descricao: Used in making very complex devices.
- Craft: [Workbench] chance 100% - 4x Small Parts, 2x Sensitive Mechanism

## Complex Mixture   `complex_mixture`
- Categoria: Resource | Ramo: Medicine | Raridade: Rare | Peso: 0.2
- Descricao: A chemical. Used in making various chemical substances.
- Craft: [Med. Lab] chance 100% - 3x Special Extract

## Confidential Dossier   `doc_conf`
- Categoria: Other | Ramo: Other | Raridade: Very rare | Peso: 0.25
- Descricao: A folder of official documents bound with a metal clip. The sheets inside are filled with service notes, codes and a stamp. Some pages look frequently leafed through.

## Container   `dro_cont`
- Categoria: Other | Ramo: Other | Raridade:  | Peso: 
- note: Metadata missing — awaiting source update.
- placeholder: true

## Copper Cable   `cab_cu`
- Categoria: Other | Ramo: Other | Raridade: Rare | Peso: 0.75
- Descricao: Copper wire coiled into a tight ring with dark insulation. An inconspicuous part of any electrical system.
- Spawns:
    - Boiler Room - peso 1.0
    - Classroom (1F) ×2 - peso 1.0
    - Laboratory (3F) - peso 1.0

## Crowbar   `crowbar`
- Categoria: Weapon/Tool | Ramo: Universal | Raridade: Rare | Peso: 5
- Descricao: A sturdy metal tool for breaking in. Handy for opening doors and skulls.
- Spawns:
    - Shop (1F) - peso 1.0
- damageType: Дробящее

## Culinary Handbook   `book_cook`
- Categoria: Other | Ramo: Other | Raridade: Rare | Peso: 1
- Descricao: A battered hardcover book stained with marks of oil and time.

## Dirty Clothing   `cloth_drt`
- Categoria: Other | Ramo: Other | Raridade: Common | Peso: 0.5
- Descricao: Crumpled clothing with noticeable dirt stains and signs of careless handling. The fabric has darkened in places.

## Disguise   `disguise`
- Categoria: Equipment | Ramo: Other | Raridade: Very rare | Peso: 1
- Descricao: A white suit. A clean mask. No name, no emotions. Just you — and someone else's shadow you decided to try on.
- Spawns:
    - Boiler Room - peso 76
- effect: Lets you fully conceal your identity and leave no traces
- shop: {"vendor": "monoshop", "price": 300}

## Disposable Gloves   `disposable_gloves`
- Categoria: Equipment | Ramo: Other | Raridade: Common | Peso: 0.1
- Descricao: Thin, cheap, unreliable. They give only a temporary illusion of safety — just enough time to make a mistake. When the gloves tear, the truth is back on your hands.
- Spawns:
    - Boiler Room - peso 1.0
    - Kitchen - peso 1.0
- effect: Hide fingerprints when interacting with objects
- durability: 100%

## Duct Tape   `tape`
- Categoria: Weapon/Tool | Ramo: Universal | Raridade: Uncommon | Peso: 0.1
- Descricao: A roll of adhesive tape. A universal tool: to repair, to bind... or to make someone go quiet.
- Spawns:
    - Boiler Room - peso 1.0
    - Gym — Workbench (1F) - peso 1.0
    - Gym — Stage (1F) - peso 1.0
    - Restroom near the Dormitory (1F) - peso 1.0
    - Classroom (1F) ×2 - peso 1.0
- effect: Used in crafting; can be applied to gag a student

## Electronic Thermometer   `therm_el`
- Categoria: Other | Ramo: Other | Raridade: Rare | Peso: 0.25
- Descricao: A compact medical device with a digital display and a thin sensor.

## Electroshock Trap   `trap_electro`
- Categoria: Consumable | Ramo: Engineering | Raridade: Rare | Peso: 0.5
- Descricao: From scrap metal, tape and electronics, a skilled hand assembled a trap ready to deliver a crushing electric discharge. It disguises itself as wiring, but step on it and a paralyzing current pierces the victim.
- Craft: [Workbench] chance 100% - 3x Processed Scrap Metal, 1x Circuit Board, 2x Sensitive Mechanism, 1x Duct Tape
- effect: A trap you can place. Triggers when stepped on; When triggered, stuns the target for 2 minutes and deals 20 points of damage

## Empty Poison Vial   `poison_empty`
- Categoria: Other | Ramo: Other | Raridade:  | Peso: 
- note: Metadata missing — awaiting source update.
- placeholder: true

## Empty Sleeping-Pills Vial   `poison_empty_sl`
- Categoria: Other | Ramo: Other | Raridade:  | Peso: 
- note: Metadata missing — awaiting source update.
- placeholder: true

## Encrypted Data Drive   `drv_sec`
- Categoria: Other | Ramo: Other | Raridade: Very rare | Peso: 1
- Descricao: A heavy external drive in a shock-resistant casing with reinforced corners. Such a medium is used to store information whose loss is unacceptable.
- effect: Lets you download a virtual image of the monopad and extract the contents of its chats and private notes
- shop: {"vendor": "monoshop", "price": 200}

## Encrypted Flash Drive   `usb_drv`
- Categoria: Other | Ramo: Other | Raridade: Rare | Peso: 0.3
- Descricao: A compact USB drive in a plain casing with an activity indicator.
- effect: Lets you download a log of the monopad user's recent actions
- shop: {"vendor": "monoshop", "price": 200}

## Energy Drink "MonomiFizz"   `energy_drink`
- Categoria: Consumable | Ramo: Food | Raridade: Rare | Peso: 0.5
- Descricao: A bright can with a smiling Monomi and an overly cheerful design. Inside is a sweet, cloying carbonated drink with an unusual aroma.
- effect: Moderate energy restoration. Bonus to stamina recovery speed. Bonus to movement speed. Energy reduction when it wears off.
- shop: {"vendor": "vending", "price": 40}
- mechanics: {"vigor": "+45%", "buff": "+5 walk speed, +10 run speed, stamina recovery +25% (300 sec)", "extra": "After it ends: -30% energy. On repeated caffeine intake: -20% energy + caffeine shock (600 sec)", "applies": ["energy-drink-buff"]}

## Explosive Trap   `trap_explosive`
- Categoria: Consumable | Ramo: Engineering | Raridade: Very rare | Peso: 1.5
- Descricao: A trap disguised as an ordinary object or floor plate, triggering on approach.
- Craft: [Workbench] chance 100% - 1x Explosives, 2x Reinforced Scrap Metal, 2x Sensitive Mechanism, 1x Circuit Board, 2x Duct Tape, 3x Universal Parts
- effect: Deals 50 damage to everyone within 2 meters and 100 damage to whoever stepped on it; Negative effect: "Concussion"; Negative effect: "Reduced Reaction Speed"; Negative effect: "Stun"

## Explosives   `explosive`
- Categoria: Consumable | Ramo: Engineering | Raridade: Very rare | Peso: 3
- Descricao: A bomb dealing colossal damage to everyone within the blast radius.
- Craft: [Workbench] chance 100% - 1x Complex Mechanism, 3x Gunpowder, 3x Reinforced Scrap Metal, 2x Duct Tape
- effect: Hybrid; Deals 250 damage to everyone within 3 meters

## Filled Encrypted Data Drive   `drv_sec_full`
- Categoria: Other | Ramo: Other | Raridade: Very rare | Peso: 1
- Descricao: A secure drive holding the data from someone else's monopad. It cannot be wiped or reused.

## Filled Flash Drive   `usb_drv_full`
- Categoria: Other | Ramo: Other | Raridade: Rare | Peso: 0.3
- Descricao: A flash drive holding the activity log from someone else's monopad. The data can be wiped and the drive reused.

## Fingerprint   `fingerprint`
- Categoria: Other | Ramo: Universal | Raridade: Common | Peso: 0.01
- Descricao: A unique pattern left on the surface. Physical evidence pointing to involvement.
- note: Source: *source_location*

## Fingerprint Profile   `fingerprint_profile`
- Categoria: Other | Ramo: Universal | Raridade: Common | Peso: 0.01
- Descricao: A reference sample confirming that fingerprints of type #X belong to *character_name*

## Fire Axe   `fire_axe`
- Categoria: Weapon/Tool | Ramo: Universal | Raridade: Rare | Peso: 6
- Descricao: A rescuer's tool, able to cut through doors and partitions. The blade commands respect, and the poll — fear.
- damageType: Колото-режущее

## Flashlight   `flashlight`
- Categoria: Weapon/Tool | Ramo: Universal | Raridade: Rare | Peso: 0.5
- Descricao: An ordinary handheld flashlight emitting a bright cone of light.
- Spawns:
    - Boiler Room - peso 1.0
    - Gym — Bridge (1F) - peso 1.0
- effect: Lets you light up dark rooms
- damageType: Гибридное

## Food   `food`
- Categoria: Other | Ramo: Other | Raridade:  | Peso: 
- note: Metadata missing — awaiting source update.
- placeholder: true

## Fried Meat   `fried_meat`
- Categoria: Consumable | Ramo: Food | Raridade: Uncommon | Peso: 0.5
- Descricao: Filling, with a hint of smoke and fat. A great way to restore strength or stir up envy.
- Craft: [Kitchen Stove] chance 100% - 1x Raw Meat
- effect: Medium satiety restoration
- mechanics: {"hunger": "+35%"}

## Frying Pan   `frying_pan`
- Categoria: Other | Ramo: Other | Raridade:  | Peso: 
- note: Metadata missing — awaiting source update.
- placeholder: true

## Fuel Canister   `fuel_can`
- Categoria: Other | Ramo: Other | Raridade: Very rare | Peso: 2
- Descricao: A heavy metal canister with scratched scarlet coating and a tightly screwed cap. It gives off a faint smell of fuel that cannot be mistaken for anything else.

## Gallery   `lookable`
- Categoria: Other | Ramo: Other | Raridade:  | Peso: 
- note: Metadata missing — awaiting source update.
- placeholder: true

## Gloves   `gloves`
- Categoria: Equipment | Ramo: Other | Raridade: Common | Peso: 0.1
- Descricao: A thin layer of cloth between you and the world. Gloves hide who you are, but not what you did. Sometimes they alone decide whether a crime stays a secret or becomes evidence.
- effect: Hide fingerprints when interacting with objects
- durability: 100%

## Gunpowder   `gunpowder`
- Categoria: Resource | Ramo: Medicine | Raridade: Rare | Peso: 0.2
- Descricao: Used in making explosive substances.

## Hammer   `hammer`
- Categoria: Weapon/Tool | Ramo: Universal | Raridade: Common | Peso: 1
- Descricao: A compact tool for driving nails. If needed, it can become a powerful argument in close combat.
- Spawns:
    - Dormitory Rooms - peso 1.0
- effect: Bludgeoning

## Handcuffs   `handcuffs`
- Categoria: Weapon/Tool | Ramo: Universal | Raridade: Rare | Peso: 0.5
- Descricao: Metal bracelets with a lock. Under normal conditions — a guard's tool. Here — a means of subjugation and control.
- effect: Restrict freedom of action, let you chain someone to an object

## Headbag   `headbag`
- Categoria: Weapon/Tool | Ramo: Universal | Raridade: Uncommon | Peso: 0.2
- Descricao: Coarse cloth with a smell of damp. In an instant it turns the surrounding world into pitch darkness.
- effect: Worn over the head, restricts the victim's view

## Hemlock   `conium`
- Categoria: Resource | Ramo: Medicine | Raridade: Uncommon | Peso: 0.2
- Descricao: A poisonous plant.
- Spawns:
    - Garden - peso 1.0

## Ice Capsule   `ice_capsule`
- Categoria: Consumable | Ramo: Universal | Raridade: Common | Peso: 0.2
- Descricao: Looks like a piece of candy that will ruin your day.
- effect: Lowers body temperature by -2.0°C. Slows body-temperature rise for 3 min.

## Jack's Scissors   `toko_scissors`
- Categoria: Weapon/Tool | Ramo: Universal | Raridade: Legendary | Peso: 1
- Descricao: At first glance — an ordinary tool, but left beside a victim they become a sinister signature, the mark of a mad killer.
- effect: Causes bleeding on dealing damage
- damageType: Колото-режущее

## Jar of Medicine   `basic_first_aid_kit`
- Categoria: Consumable | Ramo: Medicine | Raridade: Rare | Peso: 0.25
- Descricao: A small set of useful pills that restores your health.
- Craft: [Med. Lab] chance 100% - 1x Complex Mixture, 3x Special Extract, 6x Hemlock, 2x Alcohol
- effect: Reduced stamina consumption; Removes the effects of the "Acid" poison
- mechanics: {"hp": "+40 u.", "buff": "-30% stamina consumption (120 sec)", "cures": ["Acid"], "applies": ["stamina-boost"]}

## Katana   `katana`
- Categoria: Weapon/Tool | Ramo: Universal | Raridade: Legendary | Peso: 5
- Descricao: An elegant Japanese weapon. The sharp blade combines the beauty of art with deadly efficiency. Lets you cut zip ties.
- effect: Causes bleeding on dealing damage
- damageType: Колото-режущее

## Key   `key`
- Categoria: Other | Ramo: Other | Raridade:  | Peso: 
- note: Metadata missing — awaiting source update.
- placeholder: true

## Keycard "Abandoned Dormitory Floor"   `keycard_dorms`
- Categoria: Other | Ramo: Other | Raridade: Very rare | Peso: 0.1
- Descricao: A card granting access to a floor officially taken out of service. Layers of dust and sealed doors hint: more is hidden here than mere ruin.
- Spawns:
    - Boiler Room - peso 69
    - Classroom (1F) ×2 - peso 70
- effect: Lets you open the gates to the closed dormitory floor
- shop: {"vendor": "monoshop", "price": 750}

## Keycard "Staff Room"   `keycard_lobby_r`
- Categoria: Other | Ramo: Other | Raridade: Rare | Peso: 0.1
- Descricao: An unremarkable plastic pass. It opens a door to where students are not supposed to look — the staff room, where at times more secrets are decided than in classes.
- Spawns:
    - Boiler Room - peso 1.0
    - Kitchen - peso 1.0
    - Lobby - peso 1.0
    - Second Garden - peso 1.0
    - Gym — Electrical Panel (1F) - peso 72
    - Classroom (1F) ×2 - peso 70
- effect: Lets you open the service room in the hall
- shop: {"vendor": "monoshop", "price": 150}

## Keycard "Technical Rooms"   `keycard_maintain`
- Categoria: Other | Ramo: Other | Raridade: Very rare | Peso: 0.1
- Descricao: A plastic card with greasy fingerprints and the smell of machine oil. Its owner gains access to the very heart of the building — where the mechanisms that sustain life… or take it away are hidden.
- Spawns:
    - Boiler Room - peso 1.0
    - Technical Room - peso 1.0
    - Gym — Electrical Panel (1F) - peso 74
    - Classroom (1F) ×2 - peso 70
- effect: Lets you open the technical rooms
- shop: {"vendor": "monoshop", "price": 500}

## Ki-bo's Eyes   ``
- Categoria: Equipment | Ramo: Other | Raridade: Legendary | Peso: 0.1
- Descricao: Lets you see in complete darkness. Increased viewing range.
- effect: A night-vision device, lets you see in the dark

## Kitchen Knife   `kitchen_knife`
- Categoria: Weapon/Tool | Ramo: Universal | Raridade: Common | Peso: 1
- Descricao: The most ordinary kitchen knife. Good for cutting vegetables and meat. Lets you cut zip ties.
- Spawns:
    - Boiler Room - peso 1.0
- effect: Causes bleeding on dealing damage
- durability: 100%
- damageType: Колото-режущее

## Laundry Detergent "Clean Start"   `wash_cs`
- Categoria: Other | Ramo: Other | Raridade: Uncommon | Peso: 0.5
- Descricao: A cardboard box of fine powder giving off a sharp chemical smell, meant for removing tough stains from fabric.

## Lead Pipe   `lead_pipe`
- Categoria: Weapon/Tool | Ramo: Universal | Raridade: Common | Peso: 3
- Descricao: A heavy and sturdy pipe. Perfectly suited for repairing plumbing or for applying force to a foe.
- damageType: Дробящее

## Lock   `lock`
- Categoria: Other | Ramo: Other | Raridade:  | Peso: 
- note: Metadata missing — awaiting source update.
- placeholder: true

## Locked Service Case   `case_srv`
- Categoria: Other | Ramo: Other | Raridade: Very rare | Peso: 2.5
- Descricao: A sturdy light-colored plastic case with reinforced corners and a reliable handle.

## Lockpick   `lockpick`
- Categoria: Consumable | Ramo: Engineering | Raridade: Uncommon | Peso: 0.3
- Descricao: A thin metal plate. A cheap but effective way to open someone else's doors, if you have enough patience and dexterity.
- Spawns:
    - Boiler Room - peso 1.0
- Craft: [Workbench] chance 100% - 1x Processed Scrap Metal, 2x Small Parts
- effect: Lets you pick a lock

## Machete   `machete`
- Categoria: Other | Ramo: Other | Raridade:  | Peso: 
- note: Metadata missing — awaiting source update.
- placeholder: true

## Master Key   `master_key`
- Categoria: Other | Ramo: Other | Raridade:  | Peso: 
- note: Metadata missing — awaiting source update.
- placeholder: true

## Meat Soup   `meat_soup`
- Categoria: Consumable | Ramo: Food | Raridade: Rare | Peso: 0.5
- Descricao: A hot, thick defense against weakness. Slow to cook, quick to eat.
- Craft: [Kitchen Stove] chance 100% - 3x Water, 2x Vegetables, 2x Fried Meat
- effect: Medium satiety restoration; Small health restoration
- mechanics: {"hunger": "+55%", "hp": "+20 u. over 90 sec IRL", "buff": "Increased stamina 120 sec (-30% consumption)", "applies": ["stamina-boost"]}

## Medic's First-Aid Kit   `medics_first_aid_kit`
- Categoria: Consumable | Ramo: Medicine | Raridade: Very rare | Peso: 0.5
- Descricao: A complete set of all the medications needed for recovery. Significantly restores health.
- Craft: [Med. Lab] chance 100% - 1x Secret Reagent, 3x Complex Mixture, 3x Special Extract, 3x Oleander, 2x Bandage
- effect: Large health restoration; Increased movement speed; Removes most negative effects; Removes the effects of the "Acid" and "Widow's Kiss" poisons
- mechanics: {"hp": "+70 u.", "buff": "Movement speed +20% (300 sec)", "cures": ["Bleeding", "Satiety Drain", "Energy Drain", "\"Acid\" Poison", "\"Widow's Kiss\" Poison"], "applies": ["speed-boost"]}

## Military Ration "Monokuma Ration"   `mk_mre`
- Categoria: Consumable | Ramo: Food | Raridade: Very rare | Peso: 0.5
- Descricao: A dense sealed pack with military markings and the familiar grinning bear cub. Inside is a set of calorie-rich, long-storage food meant to keep up strength in extreme conditions.
- effect: Abundant satiety restoration. Moderate energy restoration.
- mechanics: {"hunger": "+75%", "vigor": "+25%"}

## Molotov Cocktail   `molotov`
- Categoria: Consumable | Ramo: Engineering | Raridade: Very rare | Peso: 1.5
- Descricao: A classic cocktail that lights a fire in the hearts and bodies of your friends.
- Craft: [Workbench] chance 100% - 2x Rag, 4x Alcohol, 4x Complex Mixture
- effect: Hybrid; Deals periodic damage; Movement-speed reduction for 10 seconds after triggering

## Monitor Headphones   `hp_mon`
- Categoria: Other | Ramo: Other | Raridade: Rare | Peso: 0.5
- Descricao: Full-size headphones with soft earpads and a reinforced cable.

## Monocoins   `money`
- Categoria: Other | Ramo: Other | Raridade: Legendary | Peso: 0
- Descricao: Metal tokens engraved with Monokuma's profile. Used as a universal currency.
- Spawns:
    - Boiler Room - peso 1.0
    - Kitchen - peso 1.0
    - Lobby - peso 1.0
    - Restroom near the Dormitory (1F) - peso 1.0
    - Classroom (2F) ×2 - peso 1.0
    - Recreation Room (2F) - peso 1.0
    - Abandoned Dormitory (2F) - peso 1.0
    - Secret Room in the Men's Restroom (2F) - peso 1.0
    - Restroom (3F) - peso 1.0

## Monopad   `phone`
- Categoria: Other | Ramo: Other | Raridade: Legendary | Peso: 0.5
- Descricao: A personal device issued to every student of the academy.

## Mop   `broom`
- Categoria: Weapon/Tool | Ramo: Universal | Raridade: Uncommon | Peso: 3
- Descricao: An ordinary cleaning mop. In the academy it is valued no less than a weapon — for it can wipe away the traces of a crime.
- Spawns:
    - Boiler Room - peso 1.0
    - Lobby - peso 1.0
    - Shop (1F) - peso 1.0
    - Secret Room in the Men's Restroom (2F) - peso 1.0
- effect: Hybrid; Lets you clean up blood, traces and fingerprints
- charge: 100% purity
- cleaning: {"rows": [{"target": "Pool of blood", "totalPercent": 18, "perUsePercent": 6, "ticks": 3}, {"target": "Regular, smudged or bloody fingerprint", "totalPercent": 2, "perUsePercent": 2, "ticks": 1}, {"target": "Bloody shoeprint, drop of blood", "totalPercent": 6, "perUsePercent": 2, "ticks": 3}, {"target": "Wet and dirty shoeprint", "totalPercent": 2, "perUsePercent": 2, "ticks": 1}], "notes": ["If the floor, door or any other surface is already clean, no charge is spent.", "Blood spattered by a blow cannot be washed off."]}

## NoctiScope v0.1   `nightvision`
- Categoria: Equipment | Ramo: Other | Raridade: Rare | Peso: 1
- Descricao: Goggles with a dim green glow. Makes the night transparent, but gives the wearer away with a lens reflection.
- effect: A night-vision device, lets you see in the dark
- shop: {"vendor": "monoshop", "price": 200}

## Note with Code #34   `note_num_34`
- Categoria: Other | Ramo: Other | Raridade: Rare | Peso: 0.15
- Descricao: A small scrap of paper with the number 7351 neatly written out and circled.

## Notepad   `notepad`
- Categoria: Other | Ramo: Other | Raridade: Uncommon | Peso: 0.2
- Descricao: Meant for keeping notes.

## Oleander   `oleander`
- Categoria: Resource | Ramo: Medicine | Raridade: Rare | Peso: 0.2
- Descricao: A poisonous flower containing a strong toxin.
- Spawns:
    - Garden - peso 1.0

## Perfume "False Freshness"   `prf_fake`
- Categoria: Other | Ramo: Other | Raridade: Rare | Peso: 0.2
- Descricao: A small glass bottle with a warm amber tint and a simple sprayer. The scent is sharp, obtrusively sweet, noticeable even after brief use. Such a smell is hard to mistake or fully conceal.

## Pickaxe   `pickaxe`
- Categoria: Other | Ramo: Other | Raridade:  | Peso: 
- note: Metadata missing — awaiting source update.
- placeholder: true

## Poison Gas Trap   `trap_gas`
- Categoria: Consumable | Ramo: Engineering | Raridade: Very rare | Peso: 1.5
- Descricao: This trap releases a toxic gas that slowly fills the room when triggered.
- Craft: [Workbench] chance 100% - 3x Reinforced Scrap Metal, 2x Sensitive Mechanism, 2x "Acid" Poison, 2x Duct Tape
- effect: Poisons with the "Acid" poison after more than 2 seconds in the gas cloud; Reduces maximum health by 10 points for 3 minutes

## Portable Battery   `bat_imp`
- Categoria: Other | Ramo: Other | Raridade:  | Peso: 
- note: Metadata missing — awaiting source update.
- placeholder: true

## Processed Scrap Metal   `processed_scrap`
- Categoria: Resource | Ramo: Engineering | Raridade: Uncommon | Peso: 0.5
- Descricao: A piece of scrap metal. Used to make all sorts of things.
- Spawns:
    - Boiler Room - peso 1.0
    - Gym — Bridge (1F) - peso 1.0
    - Classroom (1F) ×2 - peso 1.0
    - Laboratory (3F) - peso 1.0
- Craft: [Workbench] chance 100% - 3x Rusty Scrap Metal

## Pry Bar   `fubar`
- Categoria: Other | Ramo: Other | Raridade:  | Peso: 
- note: Metadata missing — awaiting source update.
- placeholder: true

## RAM Module   `ram_mod`
- Categoria: Other | Ramo: Other | Raridade: Rare | Peso: 0.5
- Descricao: An old cassette with a worn casing and a hand-signed label.
- Spawns:
    - Boiler Room - peso 1.0

## Rag   `rag`
- Categoria: Consumable | Ramo: Universal | Raridade: Common | Peso: 0.2
- Descricao: A gray rag. In skilled hands it can wipe away any trace, as if it had never been there.
- Spawns:
    - Boiler Room - peso 1.0
    - Storeroom - peso 1.0
    - Lobby - peso 1.0
    - Shop (1F) - peso 1.0
    - Classroom (2F) ×2 - peso 1.0
    - Recreation Room (2F) - peso 1.0
    - Secret Room in the Men's Restroom (2F) - peso 1.0
    - Restroom (3F) - peso 1.0
- Craft: [Workbench, Med. Lab] chance 100% - 3x Cloth
- effect: Lets you wipe blood off a weapon and clean dirt or bloodstains from hands and shoes

## Raw Bacon   `bacon`
- Categoria: Resource | Ramo: Food | Raridade: Common | Peso: 0.25
- Descricao: It sizzles in anticipation of frying. Not recommended to eat without heat treatment.
- effect: Minor satiety restoration; Poisoning
- mechanics: {"hunger": "+5%", "hp": "-22 u.", "extra": "Poisoning 60 sec", "applies": ["poisoning"]}

## Raw Meat   `raw_meat`
- Categoria: Resource | Ramo: Food | Raridade: Common | Peso: 0.5
- Descricao: Meat without heat treatment. Can be dangerous to eat, but filling when cooked properly.
- effect: Minor satiety restoration; Poisoning
- mechanics: {"hunger": "+5%", "hp": "-22 u.", "extra": "Poisoning 60 sec", "applies": ["poisoning"]}

## Raw Solution   `raw_solution`
- Categoria: Resource | Ramo: Medicine | Raridade: Common | Peso: 0.2
- Descricao: A chemical. Used in making various chemical substances.
- Spawns:
    - Boiler Room - peso 1.0
    - Kitchen - peso 1.0

## Recipe Book   `book_crafts`
- Categoria: Other | Ramo: Other | Raridade:  | Peso: 
- note: Metadata missing — awaiting source update.
- placeholder: true

## Recorded Audio Cassette   `tape_rec`
- Categoria: Other | Ramo: Other | Raridade: Very rare | Peso: 0.5
- Descricao: An old cassette with a worn casing and a hand-signed label.

## Reinforced Scrap Metal   `reinforced_scrap`
- Categoria: Resource | Ramo: Engineering | Raridade: Rare | Peso: 0.5
- Descricao: A piece of reinforced scrap metal. Used to make all sorts of things.
- Spawns:
    - Boiler Room - peso 1.0
    - Laboratory (3F) - peso 1.0
- Craft: [Workbench] chance 100% - 3x Processed Scrap Metal

## Room Key   ``
- Categoria: Other | Ramo: Other | Raridade: Very rare | Peso: 0.01
- Descricao: A metal key with an engraved number. A symbol of private territory — but even the walls of a personal room don't always guarantee safety.
- effect: Lets you lock and unlock a private room's door

## Rusty Scrap Metal   `rusty_scrap_metal`
- Categoria: Resource | Ramo: Engineering | Raridade: Common | Peso: 1.5
- Descricao: A piece of rusty scrap metal. Used to make all sorts of things.
- Spawns:
    - Boiler Room - peso 1.0
    - Gym — Workbench (1F) - peso 1.0
    - Gym — Stage (1F) - peso 1.0
    - Classroom (1F) ×2 - peso 2.0
    - Laboratory (3F) - peso 1.0

## Sandwich   `sandwich`
- Categoria: Consumable | Ramo: Food | Raridade: Rare | Peso: 0.5
- Descricao: Everything you need, squeezed between bread. If only life were so convenient.
- Craft: [Kitchen Stove] chance 100% - 2x Raw Bacon, 1x Bread, 1x Vegetables, 1x Cheese
- effect: Medium satiety restoration; Reduced incoming damage: 10% less weapon damage
- mechanics: {"hunger": "+45%"}

## Sausage   `sausage`
- Categoria: Resource | Ramo: Food | Raridade: Common | Peso: 0.25
- Descricao: A pressed and heavily seasoned meat roll. Suspiciously tasty.
- effect: Minor satiety restoration
- mechanics: {"hunger": "+5%"}

## Screwdriver   `screwdriver`
- Categoria: Weapon/Tool | Ramo: Engineering | Raridade: Uncommon | Peso: 0.2
- Descricao: An old Phillips screwdriver. Capable of unscrewing not only a screw, but someone else's plans.
- Spawns:
    - Boiler Room - peso 1.0
    - Gym — Workbench (1F) - peso 1.0
    - Gym — Stage (1F) - peso 1.0
    - Gym — Lockers (1F) - peso 1.0
    - Classroom (1F) ×2 - peso 1.0
- effect: Used in crafting; lets you disarm a trap or remove handcuffs

## Sealed Technical Case   `case_tech`
- Categoria: Other | Ramo: Other | Raridade: Very rare | Peso: 2.5
- Descricao: A black shock-resistant case with reinforced ribs and a reliable handle. The locks are tightly shut, as if they hadn't been opened since packing.

## Secret Reagent   `secret_reagent`
- Categoria: Resource | Ramo: Medicine | Raridade: Very rare | Peso: 0.2
- Descricao: A special reagent for making complex serums and poisons.
- Craft: [Med. Lab] chance 100% - 3x Complex Mixture, 2x Alcohol

## Security Service Report   `rep_sec`
- Categoria: Other | Ramo: Other | Raridade: Very rare | Peso: 0.5
- Descricao: A bundle of documents stapled together in haste. Inside are duty logs, surveillance-camera layouts and time-stamped shots.

## Sensitive Mechanism   `sensitive_mecha`
- Categoria: Resource | Ramo: Engineering | Raridade: Rare | Peso: 0.2
- Descricao: Used in making complex devices.
- Spawns:
    - Boiler Room - peso 1.0
    - Gym — Workbench (1F) - peso 1.0
- Craft: [Workbench] chance 100% - 3x Processed Scrap Metal, 2x Small Parts

## Shoe Print Profile   `footprint_profile`
- Categoria: Other | Ramo: Universal | Raridade: Common | Peso: 0.01
- Descricao: A reference sample confirming that shoe prints of type #X belong to *character_name*

## Shovel   `shovel`
- Categoria: Weapon/Tool | Ramo: Universal | Raridade: Uncommon | Peso: 4
- Descricao: A simple garden shovel. Good for digging holes.
- Spawns:
    - Boiler Room - peso 1.0
- damageType: Гибридное

## Sledgehammer   `sledge_hammer`
- Categoria: Other | Ramo: Other | Raridade:  | Peso: 
- note: Metadata missing — awaiting source update.
- placeholder: true

## Sleeping Pills   `poison_sleeping`
- Categoria: Consumable | Ramo: Medicine | Raridade: Rare | Peso: 0.3
- Descricao: A small vial of tasteless pills. Within the academy's clock, sleep turns not into rest but into a convenient weapon against the victim.
- Spawns:
    - Boiler Room - peso 1.0
- Craft: [Med. Lab] chance 100% - 2x Special Extract, 3x Hemlock, 1x Alcohol
- effect: A poison that can be slipped into food or an ingredient; When used, puts another character to sleep for 3 minutes. During this time the target cannot be woken; Takes effect 1 h 33 min of in-game time after consumption

## Slice of Pizza   `pizza`
- Categoria: Consumable | Ramo: Food | Raridade: Rare | Peso: 0.5
- Descricao: A small part of former greatness.
- effect: Moderate satiety restoration
- mechanics: {"hunger": "+30%"}

## Small Parts   `small_parts`
- Categoria: Resource | Ramo: Engineering | Raridade: Uncommon | Peso: 0.2
- Descricao: Small parts for making various kinds of mechanisms.
- Spawns:
    - Boiler Room - peso 1.0
    - Pool - peso 1.0
    - Technical Room - peso 1.0
    - Kitchen - peso 1.0
    - Incinerator - peso 1.0
    - Gym — Workbench (1F) - peso 1.0
    - Gym — Stage (1F) - peso 1.0
    - Gym — Bridge (1F) - peso 1.0
    - Gym — Lockers (1F) - peso 1.0
    - Gym — Trash Can (1F) - peso 1.0
    - Classroom (1F) ×2 - peso 1.0
    - Restroom (2F) - peso 1.0
    - Laboratory (3F) - peso 1.0
- Craft: [Workbench] chance 100% - 3x Rusty Scrap Metal

## Somnus Grenade   `smokenade`
- Categoria: Weapon/Tool | Ramo: Engineering | Raridade: Very rare | Peso: 0.3
- Descricao: A compact jar with thick violet vapor inside. Break it open and the world around dims: heaviness in the legs, thoughts melting away. Only the careful use it as a tool; the rest risk turning the game into a farce.
- Craft: [Workbench] chance 100% - 2x Reinforced Scrap Metal, 2x Sensitive Mechanism, 1x Sleeping Pills, 2x Duct Tape
- effect: Hybrid; A throwable weapon you can hurl. Disappears on use; The grenade stays active for 15 seconds, and after 7 seconds the cloud's radius shrinks. It puts you to sleep 2 seconds after you enter the cloud (distance from the epicenter doesn't matter) for 1.5-2.5 minutes within 3.5 m. During this time they cannot be woken

## Souvenir   `souvenir`
- Categoria: Other | Ramo: Other | Raridade:  | Peso: 
- note: Metadata missing — awaiting source update.
- placeholder: true

## Special Extract   `special_extract`
- Categoria: Resource | Ramo: Medicine | Raridade: Uncommon | Peso: 0.2
- Descricao: A chemical. Used in making various chemical substances.
- Spawns:
    - Boiler Room - peso 1.0
    - Laundry Room - peso 1.0
- Craft: [Med. Lab] chance 100% - 3x Raw Solution

## Sphere of Foreboding   `orb_frs`
- Categoria: Other | Ramo: Other | Raridade: Rare | Peso: 2
- Descricao: A smooth glass sphere of a cold hue, set on a stable base. In its depths a distorted reflection of the surrounding world seems to lurk: blurry, troubling, giving no clear answer.

## Splint   `splint`
- Categoria: Resource | Ramo: Medicine | Raridade: Uncommon | Peso: 0.3
- Descricao: A simple medical construction of wood and cloth. Rigid, uncomfortable, but able to restore the ability to move.
- Craft: [Med. Lab] chance 100% - 2x Processed Scrap Metal
- effect: Splints a limb and removes a leg fracture.

## Staff Badge   `bdg_srv`
- Categoria: Other | Ramo: Other | Raridade: Very rare | Peso: 0.5
- Descricao: A service badge of an Academy staff member.
- Spawns:
    - Boiler Room - peso 1.0
    - Garden - peso 1.0

## Stew   `stew`
- Categoria: Consumable | Ramo: Food | Raridade: Very rare | Peso: 0.75
- Descricao: Meat, vegetables and the magic of slow simmering. Turns sadness into well-fed tiredness.
- Craft: [Kitchen Stove] chance 100% - 1x Cheese, 2x Vegetables, 3x Water, 3x Beef Tenderloin
- effect: Abundant satiety restoration; Moderate energy restoration; Bonus to melee-weapon damage; Reduced stamina consumption
- mechanics: {"hunger": "+75%", "vigor": "+25%", "buff": "Bonus damage with melee weapons, reduced stamina consumption (600 sec)", "applies": ["stew-buff"]}

## Student Gym Uniform   `uni_sprt`
- Categoria: Other | Ramo: Other | Raridade: Uncommon | Peso: 0.5
- Descricao: A neatly folded set of sportswear in the Academy's red-and-black colors.

## Sugar   `sugar`
- Categoria: Resource | Ramo: Food | Raridade: Common | Peso: 0.1
- Descricao: Pure sweetness. Boosts energy, causes addiction. Especially in Monokuma.
- Spawns:
    - Chemistry Laboratory (4F) - peso 1.0
- mechanics: {"extra": "No effect"}

## Sweet Water   `soda`
- Categoria: Consumable | Ramo: Food | Raridade: Uncommon | Peso: 0.5
- Descricao: A light, invigorating liquid with more sugar than sense.
- effect: Small energy restoration. Minor satiety restoration.
- shop: {"vendor": "vending", "price": 30}
- mechanics: {"hunger": "+5%", "vigor": "+15%"}

## Syringe   `syringe`
- Categoria: Weapon/Tool | Ramo: Universal | Raridade: Common | Peso: 0.5
- Descricao: A medical instrument for injections. In skilled hands it can deliver both salvation and an unpleasant surprise.

## System Air Filter   `air_flt`
- Categoria: Other | Ramo: Other | Raridade: Rare | Peso: 2
- Descricao: A protective module with a dense grille and built-in flow guides.
- Spawns:
    - Boiler Room - peso 1.0
    - Pool - peso 1.0
    - Laboratory (3F) - peso 1.0

## Tapioca Drink "Sweet Break"   `bubbletea`
- Categoria: Consumable | Ramo: Food | Raridade: Rare | Peso: 0.5
- Descricao: A plastic cup with a domed lid and a thick straw, dark tapioca pearls settled at the bottom. The drink looks fresh and appetizing, but its sweet aroma stands out a little too much.
- effect: Medium satiety restoration
- shop: {"vendor": "vending", "price": 30}
- mechanics: {"hunger": "+55%"}

## Technical Fuse   `fuse_tech`
- Categoria: Other | Ramo: Other | Raridade: Rare | Peso: 0.2
- Descricao: A compact cylindrical module with metal contacts and a bright signal insert. The casing is covered with markings and traces of installation.
- Spawns:
    - Boiler Room - peso 1.0
    - Pool - peso 1.0
    - Gym — Workbench (1F) - peso 1.0
    - Gym — Stage (1F) - peso 1.0
    - Classroom (1F) ×2 - peso 1.0

## Toolbox   `tool_box`
- Categoria: Other | Ramo: Other | Raridade: Rare | Peso: 2.5
- Descricao: A metal box with worn red coating, filled to the brim with tools. Scratches and oil marks are visible on the inside of the lid.
- Spawns:
    - Boiler Room - peso 1.0
    - Gym — Workbench (1F) - peso 1.0
- Craft: [Workbench] chance 100% - 1x Hammer, 1x Adjustable Wrench, 1x Screwdriver

## Torn Disposable Gloves   `torn_disposable`
- Categoria: Other | Ramo: Other | Raridade:  | Peso: 
- note: These gloves have already done their job...

## Trap   `trap`
- Categoria: Other | Ramo: Other | Raridade:  | Peso: 
- note: Metadata missing — awaiting source update.
- placeholder: true

## UV Flashlight   `uv_flashlight`
- Categoria: Weapon/Tool | Ramo: Universal | Raridade: Very rare | Peso: 0.5
- Descricao: A flashlight with a violet beam. Under its light, traces someone wanted to hide come to view.
- Spawns:
    - Boiler Room - peso 1.0
    - Technical Room - peso 69
- effect: Lets you detect and collect fingerprints
- charge: 100%
- shop: {"vendor": "monoshop", "price": 750}

## Universal Parts   `universal_parts`
- Categoria: Resource | Ramo: Engineering | Raridade: Rare | Peso: 0.2
- Descricao: Universal parts for making mechanisms.
- Spawns:
    - Boiler Room - peso 1.0
    - Gym — Workbench (1F) - peso 1.0
    - Gym — Stage (1F) - peso 1.0
- Craft: [Workbench] chance 100% - 3x Small Parts

## Vegetable Salad   `salad`
- Categoria: Consumable | Ramo: Food | Raridade: Uncommon | Peso: 0.5
- Descricao: A simple dish of fresh vegetables. The taste recalls a normal life beyond the academy.
- Craft: [Kitchen Stove] chance 100% - 3x Vegetables
- effect: Moderate satiety restoration
- mechanics: {"hunger": "+20%"}

## Vegetables   `vegetable`
- Categoria: Resource | Ramo: Food | Raridade: Common | Peso: 0.35
- Descricao: Fresh or almost fresh. The base for any decent dish or salad.
- effect: Minor satiety restoration
- mechanics: {"hunger": "+1%"}

## Walkie-Talkie   `radio`
- Categoria: Other | Ramo: Other | Raridade:  | Peso: 
- note: Metadata missing — awaiting source update.
- placeholder: true

## Warm Jacket "Plush Gloom"   `warm_jacket`
- Categoria: Equipment | Ramo: Other | Raridade: Common | Peso: 2
- Descricao: Old, worn and clearly someone else's. Warm inside.
- effect: Reduces body-cooling speed by 50%

## Water   `water`
- Categoria: Resource | Ramo: Food | Raridade: Common | Peso: 0.5
- Descricao: A clear liquid, with no taste, color or surprises. Sometimes that's a good thing.
- effect: Minor satiety restoration
- mechanics: {"hunger": "+1%"}

## Weapon   `weapon`
- Categoria: Other | Ramo: Other | Raridade:  | Peso: 
- note: Metadata missing — awaiting source update.
- placeholder: true

## Wooden Boards   `wood_plk`
- Categoria: Other | Ramo: Other | Raridade:  | Peso: 
- note: Metadata missing — awaiting source update.
- placeholder: true

## Zip Ties   `ties`
- Categoria: Weapon/Tool | Ramo: Universal | Raridade: Uncommon | Peso: 0.1
- Descricao: Sturdy plastic clamps. Light and inconspicuous, but when tightened they turn into shackles.
- Spawns:
    - Boiler Room - peso 1.0
    - Incinerator - peso 1.0
    - Gym — Workbench (1F) - peso 1.0
    - Gym — Stage (1F) - peso 1.0
    - Restroom near the Dormitory (1F) - peso 1.0
- effect: Restrict freedom of action, let you chain someone to an object


## LOJAS

### Monoshop - moeda: monocoins (mc.)
- Locked Service Case: 100 (sell)
- UV Flashlight: 750 (comprar)
- Disguise: 300 (comprar)
- Keycard "Abandoned Dormitory Floor": 750 (comprar)
- Keycard "Staff Room": 150 (comprar)
- Keycard "Technical Rooms": 500 (comprar)
- Encrypted Flash Drive: 200 (comprar)
- Encrypted Data Drive: 200 (comprar)
- NoctiScope v0.1: 200 (comprar)
### Vending Machine - moeda: monocoins (mc.)
- Tapioca Drink "Sweet Break": 30 (comprar)
- Sweet Water: 30 (comprar)
- Chips: 15 (comprar)
- Energy Drink "MonomiFizz": 40 (comprar)


## EFEITOS DE STATUS

- Bleeding [bleeding] - negative | fonte: mixed | duracao: -
    
- Bloody Hands [bloody-hands] - negative | fonte: mixed | duracao: -
    
- Caffeine Shock [caffeine-shock] - negative | fonte: item | duracao: 600
    Triggers when consuming two caffeinated drinks (2× black coffee, 2× «MonomiFizz» or 1×1). Reduces stamina recovery, increases drowsiness loss, reduces drowsiness recovery.
- Concussion [contusion] - negative | fonte: weapon | duracao: -
    
- Reduced Reaction Speed [reaction-slow] - negative | fonte: weapon | duracao: -
    Action speed reduced by 15%.
- Disorientation [disorientation] - negative | fonte: mixed | duracao: 30
    Screen distortion, vision blurred.
- Poison Gas [poison-gas] - negative | fonte: weapon | duracao: -
    
- Bear Trap [trap] - negative | fonte: weapon | duracao: -
    
- Severe Food Poisoning [severe-food-poisoning] - negative | fonte: item | duracao: -
    
- Satiety Drain [hunger-drain] - negative | fonte: mixed | duracao: 180
    Satiety decreases 30% faster.
- Energy Drain [vigor-drain] - negative | fonte: mixed | duracao: 180
    Energy decreases 20% faster.
- Leg Fracture [leg-fracture] - negative | fonte: weapon | duracao: -
    
- Overeating [overeating] - negative | fonte: item | duracao: -
    
- "Acid" Poison [poison-acid] - negative | fonte: weapon | duracao: -
    Poisoning 300 sec + energy drain 180 sec (-20% faster).
- "Despair" Poison [poison-despair] - negative | fonte: weapon | duracao: -
    Poisoning 60 sec + disorientation 30 sec + reaction-speed reduction -15%.
- "Widow's Kiss" Poison [poison-widows-kiss] - negative | fonte: weapon | duracao: -
    Poisoning 120 sec + satiety drain 180 sec (-30% faster).
- Poisoning [poisoning] - negative | fonte: mixed | duracao: -
    Periodically drains health.
- Mild Drowsiness [drowsy-mild] - negative | fonte: mixed | duracao: -
    
- Strong Drowsiness [drowsy-strong] - negative | fonte: mixed | duracao: -
    
- Critical Drowsiness [drowsy-critical] - negative | fonte: mixed | duracao: -
    
- Mild Hunger [hunger-mild] - negative | fonte: mixed | duracao: -
    
- Strong Hunger [hunger-strong] - negative | fonte: mixed | duracao: -
    
- Critical Hunger [hunger-critical] - negative | fonte: mixed | duracao: -
    
- Absolute Resistance [absolute-resistance] - positive | fonte: item | duracao: 300
    Damage -50%, negative effects have no effect.
- Energy Drink [energy-drink-buff] - positive | fonte: item | duracao: 300
    +45% energy, +5 units walking speed / +10 units running speed, +25% stamina recovery.
- Increased Hunger Resistance [hunger-resistance] - positive | fonte: item | duracao: 300
    Satiety decreases 50% slower.
- Increased Movement Speed [speed-boost] - positive | fonte: item | duracao: 300
    Movement speed +20%.
- Increased Stamina [stamina-boost] - positive | fonte: item | duracao: 120
    Stamina consumption -30%.
- Stew [stew-buff] - positive | fonte: item | duracao: 600
    +75% satiety, +25% energy, bonus melee-weapon damage, -stamina consumption.


## LOCAIS / CORES

- Boiler Room (Бойлерная) - andar — | fg #546E7A bg #ECEFF1
- Pool (Бассейн) - andar — | fg #0277BD bg #E1F5FE
- Staff Room (Комната персонала) - andar — | fg #4527A0 bg #EDE7F6
- Technical Room (Техническое помещение) - andar — | fg #37474F bg #ECEFF1
- Medical Office (Медкабинет) - andar — | fg #7B2F8C bg #F3E5F5
- Kitchen (Кухня) - andar — | fg #5D4037 bg #EFEBE9
- Laundry Room (Прачечная) - andar — | fg #37474F bg #F5F5F5
- Storeroom (Склад) - andar — | fg #455A64 bg #E8EBED
- Incinerator (Мусоросжигатель) - andar — | fg #4E342E bg #EFEBE9
- Lobby (Вестибюль) - andar — | fg #B26A00 bg #FFF3E0
- Garden (Сад) - andar — | fg #2E7D32 bg #F1F8E9
- Second Garden (Второй Сад) - andar — | fg #558B2F bg #F9FBE7
- Gym — Electrical Panel (1F) (Спортзал — Щиток (1 эт.)) - andar 1 эт. | fg #B5451B bg #FDECE7
- Gym — Workbench (1F) (Спортзал — Верстак (1 эт.)) - andar 1 эт. | fg #C45000 bg #FFF0E0
- Gym — Stage (1F) (Спортзал — Сцена (1 эт.)) - andar 1 эт. | fg #D84315 bg #FBE9E7
- Gym — Bridge (1F) (Спортзал — Мост (1 эт.)) - andar 1 эт. | fg #BF360C bg #FFCCBC
- Gym — Upper Room (1F) (Спортзал — Верхняя комната (1 эт.)) - andar 1 эт. | fg #8B0000 bg #FCE4E4
- Gym — Lockers (1F) (Спортзал — Шкафчики (1 эт.)) - andar 1 эт. | fg #A0522D bg #FDEBD0
- Gym — Trash Can (1F) (Спортзал — Мусорка (1 эт.)) - andar 1 эт. | fg #6B4226 bg #F5E6DA
- Restroom (1F) (Туалет (1 эт.)) - andar 1 эт. | fg #607D8B bg #ECEFF1
- Restroom near the Dormitory (1F) (Туалет возле общежития (1 эт.)) - andar 1 эт. | fg #78909C bg #ECEFF1
- Dormitory Rooms (Комнаты общежития) - andar 1 эт. | fg #6A1B9A bg #F3E5F5
- Shop (1F) (Магазин (1 эт.)) - andar 1 эт. | fg #1A6B1A bg #E8F5E9
- VHS Room (1F) (VHS-комната (1 эт.)) - andar 1 эт. | fg #3D7A6B bg #E0F2F1
- Classroom (1F) (Школьный класс (1 эт.)) - andar 1 эт. | fg #0097A7 bg #E0F7FA
- Classroom (2F) (Школьный класс (2 эт.)) - andar 2 эт. | fg #0097A7 bg #E0F7FA
- Far Classroom (2F) (Школьный класс дальний (2 эт.)) - andar 2 эт. | fg #00695C bg #E0F7FA
- Library (2F) (Библиотека (2 эт.)) - andar 2 эт. | fg #1565C0 bg #E3F2FD
- Recreation Room (2F) (Игровая комната (2 эт.)) - andar 2 эт. | fg #B8860B bg #FFF8E1
- Abandoned Dormitory (2F) (Заброшенное общежитие (2 эт.)) - andar 2 эт. | fg #4A148C bg #EDE7F6
- Restroom (2F) (Туалет (2 эт.)) - andar 2 эт. | fg #546E7A bg #ECEFF1
- Secret Room in the Men's Restroom (2F) (Секретная комната в мужском туалете (2 эт.)) - andar 2 эт. | fg #880E4F bg #FCE4EC
- Vent in the Secret Room (2F) (Вентиляция в секретной комнате (2 эт.)) - andar 2 эт. | fg #AD1457 bg #FCE4EC
- Art Room (3F) (Артрум (3 эт.)) - andar 3 эт. | fg #1A3FAA bg #E8EDF9
- Laboratory (3F) (Лаборатория (3 эт.)) - andar 3 эт. | fg #006064 bg #E0F7FA
- Classroom (3F) (Школьный класс (3 эт.)) - andar 3 эт. | fg #0097A7 bg #E0F7FA
- Restroom (3F) (Туалет (3 эт.)) - andar 3 эт. | fg #546E7A bg #ECEFF1
- Principal's Office (4F) (Кабинет директора (4 эт.)) - andar 4 эт. | fg #311B92 bg #EDE7F6
- Chemistry Laboratory (4F) (Лаборатория химии (4 эт.)) - andar 4 эт. | fg #006064 bg #E0F7FA