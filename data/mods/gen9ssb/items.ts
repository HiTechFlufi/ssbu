export const Items: import('../../../sim/dex-items').ModdedItemDataTable = {
	// The Stuff
	pocketfulofposies: {
		name: "Pocketful of Posies",
		gen: 9,
		shortDesc: "On switch-in, creates Pink Rocks on foe side.",
		/*
		onStart(pokemon) {
			for (const side of pokemon.side.foeSidesWithConditions()) {
				side.addSideCondition('pinkrocks');
			}
		},
		*/
	},
	// Mel
	heartofdarkness: {
		name: "Heart of Darkness",
		gen: 9,
		desc: "Holder's Ghost-type and Dragon-type attacks have 1.3x power. Copies the healing of all direct healing Status moves. Burns the holder if it KOes another Pokémon.",
		shortDesc: "Ghost and Dragon-type moves 1.3x power, copies healing from Status moves, burns holder after KOes.",
		onBasePowerPriority: 15,
		onBasePower(basePower, user, target, move) {
			if (move && move.type === 'Ghost' || move.type === 'Dragon') {
				return this.chainModify([5324, 4096]);
			}
		},
		onAfterMoveSecondarySelf(source, target, move) {
			if (
				target &&
				target.fainted &&
				!source.status
			) {
			source.trySetStatus('brn', source);
				this.add('-message', `${source.name} was set aflame by its Heart of Darkness!`);
			}
		},
		onAnyAfterMove(source, target, move) {
			const holder = this.effectState.target;
			if (!holder || holder.fainted) return;
			if (source === holder) return;
			if (move && move.category === 'Status' && move.heal) {
				const [num, den] = move.heal;
				const healAmount = Math.floor(holder.baseMaxhp * num / den);
				if (healAmount > 0) {
					this.heal(healAmount, holder);
					this.add('-message', `${holder.name} copied their opponent's healing!`);
				}
			}
		},
	},
	// Graaz
	themightycloth: {
		name: "The Mighty Cloth",
		desc: "If the holder uses Rage, and its less than 80 base power, it becomes 80 base power. Bull Rush is added to the holder's moveset and can be used once per switch-in.",
		shortDesc: "Rage: 20 -> 80 BP. Holder can use Bull Rush.",
		gen: 9,
		onStart(pokemon) {
			this.add('-anim', pokemon, 'Bulk Up');
			this.add('-message', `${pokemon.name} boasts The Mighty Cloth!`);

			const newMove = this.dex.moves.get('bullrush');
			const newSlot = {
				move: newMove.name,
				id: newMove.id,
				target: newMove.target,
				disabled: false,
				used: false,
				pp: 1,
				maxpp: 1,
			};
			pokemon.moveSlots[pokemon.moveSlots.length] = newSlot;
			pokemon.baseMoveSlots[pokemon.moveSlots.length] = newSlot;
		},
		onBasePower(basePower, user, target, move) {
			if (move.id === 'rage' && basePower < 80) {
				return 80;
			}
		},
		onAfterMoveSecondarySelf(source, target, move) {
			// Once per switch-in; forget Bull Rush after use, relearn on next switch-in.
			if (move.id === 'bullrush') {
				const moveIndex = source.moves.indexOf('bullrush');
				if (moveIndex < 0) return false;
				delete source.moveSlots[moveIndex];
			}
		},
	},
	// Neptune
	stormtalisman: {
		name: "Storm Talisman",
		desc: "Summons strong winds that remove all entry hazards upon starting. Effects end if the holder switches or faints, or if this item is removed.",
		shortDesc: "Summons Delta Stream, removing hazards.",
		gen: 9,
		onStart(pokemon) {
			this.field.setWeather('deltastream');
			this.field.weatherState.source = pokemon;

			const target = pokemon.side.foe.active;
			const hazards = ['stealthrock', 'spikes', 'toxicspikes', 'stickyweb'];

			let hazardsRemoved = false;
			for (const h of hazards) {
				if (pokemon.side.removeSideCondition(h)) {
					hazardsRemoved = true;
					this.add('-sideend', pokemon.side, this.dex.conditions.get(h).name);
				}
			}
			for (const h of hazards) {
				if (target.side.removeSideCondition(h)) {
					hazardsRemoved = true;
					this.add('-sideend', pokemon.side, this.dex.conditions.get(h).name);
				}
			}
		},
	},
	// Roughskull
	cheaterglasses: {
		name: "Cheater Glasses",
		desc: "This Pokemon takes halved damage from attacks when it's at full HP. On switch-in, This Pokemon's Attack or Special Attack increases by 1 stage based on the foe's lower defense stat, and this Pokemon's Defense or Special Defense increases by 1 stage based on the foe's higher attack stat.",
		shortDesc: "On switch-in, boosts stats based on foe's weaker Defense/stronger Attack; Multiscale.",
		gen: 9,
		onStart(pokemon) {
			let totaldef = 0;
			let totalspd = 0;
			let totalatk = 0;
			let totalspa = 0;
			for (const target of pokemon.side.foe.active) {
				if (!target || target.fainted || target.hp <= 0) continue;
				totaldef += target.getStat('def', false, true);
				totalspd += target.getStat('spd', false, true);
				totalatk += target.getStat('atk', false, true);
				totalspa += target.getStat('spa', false, true);
			}
			if (totaldef && totaldef > totalspd) {
				this.boost({ spa: 1 });
			} else if (totalspd && totalspd > totaldef) {
				this.boost({ atk: 1 });
			} else {
				if (this.randomChance(1, 2)) {
					this.boost({ spa: 1 });
				} else {
					this.boost({ atk: 1 });
				}
			}
			if (totalatk && totalatk > totalspa) {
				this.boost({ def: 1 });
			} else if (totalspa && totalspa > totalatk) {
				this.boost({ spd: 1 });
			} else {
				if (this.randomChance(1, 2)) {
					this.boost({ def: 1 });
				} else {
					this.boost({ spd: 1 });
				}
			}
		},
		onSourceModifyDamage(damage, source, target, move) {
			if (target.hp >= target.maxhp) {
				this.debug(`Cheater Glasses halving damage from full HP`);
				return this.chainModify(0.5);
			}
		},
	},
	// Horrific17
	horrifiumz: {
		name: "Horrifium Z",
		gen: 9,
		shortDesc: "Arcanine with Meteor Strike can use Chicxulub Impact.",
		desc: "If held by an Arcanine with Meteor Strike, it can use Chicxulub Impact.",
		zMove: "Chicxulub Impact",
		zMoveFrom: "Meteor Strike",
		itemUser: ["Arcanine"],
		onTakeItem: false,
	},
	// Gadget
	everythingamajig: {
		name: "Everythingamajig",
		gen: 9,
		desc: "Upon switching in, copies the foe's item, replacing Everythingamajig. Reverts back to Everythingamajig upon switching out. If no active foes have a held item upon switching in, Everythingamajig explodes; Holder loses 1/3 max HP. If the holder uses Pay Day, it changes type to match the holder's primary type.",
		shortDesc: "Copies the foe's item until the holder switches.",
		onStart(pokemon) {
			if (!pokemon.volatiles['everythingamajig']) pokemon.addVolatile('everythingamajig');
		},
		condition: {
			onStart(pokemon) {
				let myItem = false;
				let success = false;
				for (const target of pokemon.side.foe.active) {
					if (target.item) {
						success = true;
						myItem = target.getItem();
					}
				}
				if (!myItem) success = false;
				if (!success) {
					this.add('-message', `Everythingamajig couldn't find an identity and seized up!`);
					this.add('-anim', pokemon, 'Explosion', pokemon);
					this.add('-anim', pokemon, 'Tickle', pokemon);
					this.damage(pokemon.maxhp / 3);
					this.add('-enditem', pokemon, 'Everythingamajig');
					pokemon.clearItem();
					return;
				}
				this.add('-activate', pokemon, 'item: Everythingamajig');
				this.add('-message', `Everythingamajig transformed into ${myItem.name}!`);
				pokemon.item = myItem.id;
				pokemon.setItem(myItem);
			},
			onModifyMove(move, pokemon) {
				if (move.id === 'payday') move.type = pokemon.getTypes()[0];
			},
			onSwitchOut(pokemon) {
				if (pokemon.item) pokemon.setItem('Everythingamajig');
				pokemon.removeVolatile('everythingamajig');
			},
		},
	},
	// Karumonix
	vermincrown: {
		name: "Vermin Crown",
		gen: 9,
		shortDesc: "Immune to Ratfested/Plagued. If KO'd with item intact: foe gets 1 Ratfested. Contacting holder doubles Ratfested damage.",
		desc: "The holder is immune to Ratfested and Plagued. If the holder faints while still holding this item, the opposing Pokemon gains 1 Ratfested stack. If an opposing Pokemon makes contact with the holder, that opponent's Ratfested/Plagued damage is doubled for a short time.",
		onStart(pokemon) {
			if (pokemon.volatiles['plagued']) pokemon.removeVolatile('plagued');
			if (pokemon.volatiles['ratfested']) pokemon.removeVolatile('ratfested');
		},
		// Immune to Ratfested + Plagued being applied
		onTryAddVolatile(status, target, source, effect) {
			if (status.id === 'ratfested' || status.id === 'plagued') {
				this.add('-immune', target, '[from] item: Vermin Crown');
				return null;
			}
		},
		// Implemented as: if foe uses a contact move INTO holder, mark them for doubled plague ticks.
		onDamagingHit(damage, target, source, move) {
			if (!source || source.fainted) return;
			if (source.side === target.side) return;
			if (!move?.flags?.contact) return;
			source.addVolatile('vermincrownmark', target, this.dex.items.get('vermincrown'));
		},
		onModifyMove(move, pokemon) {
			if (move.id === 'populationbomb') {
				move.accuracy = true;
			}
		},
		onFaint(pokemon) {
			// Only trigger if item is still actually held/active
			if (pokemon.ignoringItem()) return;
			if (pokemon.item !== 'vermincrown') return;
			const last = pokemon.lastAttackedBy;
			const attacker = last?.source;
			if (attacker && !attacker.fainted && attacker.side !== pokemon.side) {
				for (let i = 0; i < 3; i++) attacker.addVolatile('ratfested', pokemon, this.dex.items.get('vermincrown'));
				return;
			}
			// Fallback: if no clear attacker (hazards/status), tag all opposing actives
			for (const foe of pokemon.side.foe.active) {
				if (!foe || foe.fainted) continue;
				for (let i = 0; i < 3; i++) foe.addVolatile('ratfested', pokemon, this.dex.items.get('vermincrown'));
			}
		},
	},
	// Koiru
	fusioncoils: {
		name: "Fusion Coils",
		gen: 9,
		shortDesc: "Allows Coil Connection to use the Z-Move Frostbite Fusion.",
		desc: "If held, Coil Connection can be upgraded into the Z-Move Frostbite Fusion.",
		zMove: "Frostbite Fusion",
		zMoveFrom: "Fusion Bolt",
		itemUser: ["Zeraora"],
		onTakeItem: false,
	},	
	// Marvin
	thehappyknife: {
		name: "The Happy Knife",
		gen: 9,
		desc: "This Pokémon's damaging moves hit twice. The second hit is Fire-type and has its damage quartered.",
		shortDesc: "Attacks hit twice; 2nd hit is Fire-type and has 1/4 damage.",
		onModifyMove(move) {
			if (move.multihit || move.category === 'Status' ||
				move.isZ || move.isMax || move.id === 'itembox') return;
			move.multihit = 2;
		},
		onBasePower(basePower, user, target, move) {
			if (move.hit > 1) {
				move.type = 'Fire';
				this.add('-anim', user, 'Fire Lash', target);
				return this.chainModify(0.25);
			}
		},
	},
	// Tao
	zhuyou: {
		name: "Zhuyou",
		gen: 9,
		shortDesc: "1.25x stats; Crits heal user 1/4 max HP; Cures status.",
		desc: "This Pokemon's stats are 1.25x, including HP. Whenever this Pokemon lands a critical hit, it recovers 1/4 of its max HP. At the end of each turn, this Pokemon is cured of any present status conditions.",
		onTakeItem: false,
		onStart(pokemon) {
			if (pokemon.m.zhuyouActivated) return;
			this.add('-activate', pokemon, 'item: Zhuyou');
			this.add('-message', `${pokemon.name}'s maximum HP increased!`);
			const newHp = Math.ceil(pokemon.hp * 1.25);
			const newMaxHp = Math.ceil(pokemon.maxhp * 1.25);
			pokemon.hp = newHp;
			pokemon.maxhp = newMaxHp;
			pokemon.baseMaxhp = newMaxHp;
			this.add('-heal', pokemon, pokemon.getHealth, '[silent]');
			pokemon.m.zhuyouActivated = true;
		},
		onModifySpD(spd, pokemon) {
			return this.chainModify(1.25);
		},
		onModifyDef(def, pokemon) {
			return this.chainModify(1.25);
		},
		onModifyAtk(atk, pokemon) {
			return this.chainModify(1.25);
		},
		onModifySpA(spa, pokemon) {
			return this.chainModify(1.25);
		},
		onModifySpe(spe, pokemon) {
			return this.chainModify(1.25);
		},
		onAfterMoveSecondarySelf(source, target, move) {
			if (target.getMoveHitData(move).crit) {
				this.heal(source.maxhp / 8, source);
			}
		},
		onResidual(pokemon) {
			if (!pokemon.status) return;
			if (pokemon.cureStatus()) {
				this.add('-curestatus', pokemon, pokemon.status, '[from] item: Zhuyou');
			}
		},
	},
	// Saint Deli
	giftsack: {
		name: "Gift Sack",
		gen: 9,
		shortDesc: "Swaps foe's strongest move; Stores 1 Special; Full sack clashes back.",
		desc: "Replaces the target's strongest attacking move with another random move on switch-in. If this Pokemon is hit by a Special attack while the sack is empty, it stores the move and takes no damage. If the sack is full, Special attacks deal reduced damage based on base power difference, and the stored move is fired back after the hit, emptying the sack.",
		onStart(pokemon) {

			// Initiate Gift Sack functionality

			// It's safe to always just set this to an empty array if it's falsy, because
			// in any scenario that the sack variable is returning false, it should be [], if it isn't already.

			if (!pokemon.m.sack) pokemon.m.sack = [];

			// Find and replace opposing Pokemon's strongest attacking move

			let max = 0;
			let strongestMove: Move | undefined;
			const target = pokemon.side.foe.active[pokemon.side.foe.active.length - 1 - pokemon.position];
			if (!target) return;

			for (const moveSlot of target.moveSlots) {
				const move = this.dex.moves.get(moveSlot.move);
				if (!move || move.category === 'Status' || !move.basePower) continue;
				if (move.basePower > max) {
					max = move.basePower;
					strongestMove = move;
				}
			}

			if (!strongestMove) return;
			const moveIndex = target.moves.indexOf(strongestMove.id);
			if (moveIndex < 0) return;
			const allMoves = this.dex.moves.all().filter(m => (
				(!target.moves.includes(m.id)) &&
				(!m.isNonstandard || m.isNonstandard === 'Unobtainable') &&
				(m.flags['metronome'])
			));
			if (!allMoves.length) return;

			const randomMove = this.sample(allMoves);
			target.moveSlots[moveIndex] = {
				move: randomMove.name,
				id: randomMove.id,
				pp: randomMove.pp,
				maxpp: randomMove.pp,
				target: randomMove.target,
				disabled: false,
				used: false,
				virtual: true,
			};

			this.add('-activate', pokemon, 'item: Gift Sack');
			this.add('-anim', pokemon, 'Present', target);
			this.add('-anim', target, 'Tickle', target);
			this.add('-message', `${target.name} forgot ${strongestMove.name}, and learned ${randomMove.name}!`);
		},
		onTryHit(pokemon, source, move) {
			if (pokemon === source) return;
			if (!move || move.category !== 'Special') return;
			if (!pokemon.m.sack) pokemon.m.sack = [];
			if (!pokemon.m.sack.length) {
				this.add('-anim', pokemon, 'Present', pokemon);
				this.add('-anim', pokemon, 'Tickle', pokemon);
				this.add('-activate', pokemon, 'item: Gift Sack', move.name);
				this.add('-message', `${pokemon.name} stored ${move.name} in its Gift Sack!`);
				pokemon.m.sack.push(move.id);
				return null;
			}
		},
		onSourceModifyDamage(damage, source, target, move) {
			if (!move || move.category !== 'Special') return;
			if (source === target) return;
			if (!target.m?.sack?.length) return;
			const stored = this.dex.moves.get(target.m.sack[0]);
			if (!stored || !stored.exists) return;
			if (target.m.sackClashTurn !== this.turn) {
				target.m.sackClashTurn = this.turn;
				this.add('-message', `${target.name}'s Gift Sack clashed with the incoming attack!`);
			}
			// BP-based reduction (clamped so it never becomes goofy)
			const inBP = move.basePower || this.dex.moves.get(move.id).basePower || 0;
			const stBP = stored.basePower || 0;
			let mult = 0.75; // baseline: 25% reduction
			if (inBP && stBP) {
				// If stored move is stronger, reduce more. If weaker, reduce less.
				// diff +50 => about 50% damage, diff -50 => about 90% damage
				const diff = stBP - inBP;
				mult = 0.75 - (diff / 200);
				if (mult < 0.35) mult = 0.35;
				if (mult > 0.9) mult = 0.9;
			}
			return this.chainModify(mult);
		},
		onDamagingHit(damage, target, source, move) {
			if (!move || move.category !== 'Special') return;
			if (!target.m?.sack?.length) return;
			if (!source || source.fainted) return;
			if (target.fainted) return;
			// Prevent multiple counters in the same turn (multi-hit etc.)
			if (target.m.sackCounterTurn === this.turn) return;
			target.m.sackCounterTurn = this.turn;
			const stored = this.dex.moves.get(target.m.sack[0]);
			if (!stored || !stored.exists) return;
			this.add('-message', `${target.name} fired back with the stored ${stored.name}!`);
			this.add('-anim', target, 'Present', source);
			this.actions.useMove(stored.id, target, source);
			target.m.sack = [];
			this.add('-message', `${target.name} emptied its Gift Sack!`);
		},
		onBasePowerPriority: 15,
		onBasePower(basePower, user, target, move) {
			if (!user.m?.sack?.length) return;
			if (move.id === 'giftoffortune') {
				this.add('-message', `${user.name}'s Gift Sack amplified ${move.name}'s power!`);
				return this.chainModify(1 + 0.5 * user.m.sack.length);
			}
		},
	},
	// Rooci Caxa
	spiritberry: {
		name: "Spirit Berry",
		gen: 9,
		isBerry: true,
		shortDesc: "Phantom Force: 1 turn; If hit by physical move: Ghost-type added to Target. Single use.",
		desc: "Completes holder's Phantom Force in one turn. If the holder is hit by a physical move, adds Ghost to the target's type(s).",
		onHit(target, source, move) {
			if (move.type === 'Physical' && target.eatItem()) {
				if (!source.addType('Ghost')) return false;
				this.add('-start', source, 'typeadd', 'Ghost', '[from] item: Spirit Berry');
			}
		},
		onChargeMove(pokemon, target, move) {
			if (pokemon.eatItem() && move.id === 'phantomforce') {
				this.debug('spirit berry - remove charge turn for ' + move.id);
				this.attrLastMove('[still]');
				this.addMove('-anim', pokemon, move.name, target);
				return false;
			}
		},
		onEat() { },
	},
	// Morax
	hadeansoil: {
		name: "Hadean Soil",
		gen: 9,
		onStart(pokemon) {
			if (pokemon.m.soilActivated) return;
			this.add('-activate', pokemon, 'item: Hadean Soil');
			this.add('-anim', pokemon, 'Sand Attack', pokemon);
			this.add('-message', `${pokemon.name}'s maximum HP increased!`);
			const newHp = Math.ceil(pokemon.hp * 1.31);
			const newMaxHp = Math.ceil(pokemon.maxhp * 1.31);
			pokemon.hp = newHp;
			pokemon.maxhp = newMaxHp;
			pokemon.baseMaxhp = newMaxHp;
			this.add('-heal', pokemon, pokemon.getHealth, '[silent]');
			pokemon.m.soilActivated = true;
		},
		onTryHit(pokemon, source, move) {
			if (pokemon !== source && move.type === 'Ground' || move.type === 'Rock') {
				if (['homerunswing', 'homerunswingwindup'].includes(move.id)) return;
				this.add('-immune', pokemon);
				this.heal(pokemon.maxhp / 4, pokemon);
				return null;
			}
		},
		onAfterMoveSecondarySelf(source, target, move) {
			if (source !== target && move.category !== 'Status' && move.type === 'Ground' || move.type === 'Rock') {
				if (target.side.sideConditions['stealthrock']) return;
				this.add('-activate', source, 'item: Hadean Soil', move.name);
				target.side.addSideCondition('stealthrock', target);
			}
		},
		onTakeItem: false,
		zMove: "Planet Befall",
		zMoveFrom: "Dominus Lapidis",
		itemUser: ["Landorus"],
	},
	// Varnava
	varnaviumz: {
		name: "Varnavium Z",
		gen: 9,
		desc: "If held by Varnava with Core Enforcer, it can use Southern Island's Last Defense, and its moves have -1 priority.",
		shortDesc: "-1 Priority. If held by Varnava with Core Enforcer, it can use Southern Island's Last Defense.",
		onTakeItem: false,
		zMove: "Southern Island's Last Defense",
		zMoveFrom: "Core Enforcer",
		itemUser: ["Zygarde-Complete", "Zygarde-10%", "Zygarde"],
		onModifyMove(move, pokemon) {
			if (pokemon.name === 'Varnava' && pokemon.moves.indexOf('coreenforcer')) move.priority = -1;
		},
	},
	// Aevum
	rewindwatch: {
		name: "Rewind Watch",
		gen: 9,
		onTakeItem: false,
		shortDesc: "Calyrex becomes Grass/Steel. Repeat hits do half damage. Once: survives lethal hit, rewinds state.",
		desc: "If held by a Calyrex, the holder becomes Grass/Steel. If an attacker hits the holder with the same damaging move on consecutive turns, that hit deals half damage. Once per battle, if the holder would be knocked out by a move, it survives at 1 HP and then rewinds: fully heals, clears all stat changes, status, and volatile statuses, restores PP, and restores its type change; the item is consumed.",
		onStart(pokemon) {
			if (pokemon.baseSpecies.baseSpecies === 'Calyrex') {
				(pokemon.m as any).rewindWatchAppliedType = true;
				if (pokemon.setType(['Grass', 'Steel'])) {
					this.add('-start', pokemon, 'typechange', 'Grass/Steel', '[from] item: Rewind Watch');
				}
			}
			if (!(pokemon.m as any).rewindWatch) (pokemon.m as any).rewindWatch = {};
			const st: any = (pokemon.m as any).rewindWatch;
			st.used = false;
			st.pending = false;
			st.prevAttacker = null;
			st.prevMove = '';
			st.prevTurn = 0;
		},
		// Repeat punish: same attacker + same damaging move on consecutive turns => half damage
		onSourceModifyDamage(damage, source, target, move) {
			if (!move || move.category === 'Status') return;
			const st: any = (target.m as any).rewindWatch;
			if (!st) return;
			if (source && st.prevAttacker === source && st.prevMove === move.id && st.prevTurn === this.turn - 1) {
				this.add('-activate', target, 'item: Rewind Watch');
				this.add('-anim', target, 'Future Sight', target);
				this.add('-message', `${target.name} already saw that coming!`);
				return this.chainModify(0.5);
			}
		},
		onDamagingHit(damage, target, source, move) {
			const st: any = (target.m as any).rewindWatch;
			if (!st || !move) return;
			st.prevAttacker = source;
			st.prevMove = move.id;
			st.prevTurn = this.turn;
		},
		onDamage(damage, target, source, effect) {
			const st: any = (target.m as any).rewindWatch;
			if (!st || st.used) return;
			if (!effect || effect.effectType !== 'Move') return;
			if (damage >= target.hp) {
				st.used = true;
				st.pending = true;
				this.add('-activate', target, 'item: Rewind Watch');
				this.add('-anim', target, 'Trick Room', target);
				return target.hp - 1;
			}
		},
		onAfterMoveSecondary(target, source, move) {
			const st: any = (target.m as any).rewindWatch;
			if (!st || !st.pending) return;
			st.pending = false;
			target.useItem();
			// visuals + full heal
			this.add('-anim', target, 'Recover', target);
			this.heal(target.maxhp - target.hp, target, target, 'item: Rewind Watch');
			// clear ALL stat changes
			target.clearBoosts();
			this.add('-clearboost', target);
			// cure status
			if (target.status) {
				this.add('-curestatus', target, target.status, '[from] item: Rewind Watch');
				target.clearStatus();
			}
			// clear ALL volatiles (keep "item:" volatiles, which your format uses for shared items)
			for (const v in target.volatiles) {
				if (v.startsWith('item:')) continue;
				target.removeVolatile(v);
			}
			// restore PP
			for (const slot of target.moveSlots) {
				slot.pp = slot.maxpp;
			}
			// restore the Calyrex type change (even if Soak/etc happened)
			if ((target.m as any).rewindWatchAppliedType && target.baseSpecies.baseSpecies === 'Calyrex') {
				if (target.setType(['Grass', 'Steel'])) {
					this.add('-start', target, 'typechange', 'Grass/Steel', '[from] item: Rewind Watch');
				}
			}
			this.add('-message', `${target.name} rewound the timeline!`);
		},
	},
	// Suika Ibuki
	ibukigourd: {
		name: "Ibuki Gourd",
		spritenum: 697,
		desc: "1.5x Attack and +1/16 HP per turn if held by an Ogerpon, otherwise the user loses 1/8 HP instead; only the first move executed can be selected.",
		fling: {
			basePower: 80,
		},
		onStart(pokemon) {
			if (pokemon.volatiles['choicelock']) {
				this.debug('removing choicelock: ' + pokemon.volatiles['choicelock']);
			}
			pokemon.removeVolatile('choicelock');
		},
		onModifyMove(move, pokemon) {
			pokemon.addVolatile('choicelock');
		},
		onModifyAtkPriority: 1,
		onModifyAtk(atk, pokemon) {
			if (pokemon.species.id === 'ogerpon') {
				return this.chainModify(1.5);
			}
		},
		onResidualOrder: 5,
		onResidualSubOrder: 4,
		onResidual(pokemon) {
			if (pokemon.species.id !== 'ogerpon') {
				this.damage(pokemon.baseMaxhp / 8);
			}
		},
		isChoice: true,
		gen: 9,
	},
	// Journeyman
	colossuscarrier: {
		name: "Colossus Carrier",
		gen: 9,
		onTakeItem: false,
		shortDesc: "User can hold 8 items; New item each turn.",
		desc: "The holder can hold up to eight additional items, other than Colossus Carrier, that are unaffected by Knock Off or other means of being taken, disabled, or removed. Colossus Carrier itself also cannot be taken, disabled, or removed. At the end of each turn, the holder picks up a random item that it isn't already holding.",
		onResidual(pokemon) {
			if (!pokemon.m.carrierItems) pokemon.m.carrierItems = [];
			const items = this.dex.items.all().filter(item => (
				pokemon.item !== item &&
				!pokemon.m.carrierItems.includes(item) &&
				!item.name.includes('TR') && !item.itemUser &&
				!item.name.includes('Power') && !item.isPokeball &&
				!item.megaStone && !item.unusable
			));
			const item = this.sample(items);
			if (pokemon.m.carrierItems.length < 8 && pokemon.item === 'colossuscarrier') {
				pokemon.m.carrierItems.push(item);
				this.add('-anim', pokemon, 'Splash', pokemon);
				this.add('-message', `${pokemon.name} found one ${item.name}!`);
			} else if (pokemon.m.carrierItems.length >= 8 || !pokemon.item || pokemon.item !== 'colossuscarrier') {
				this.add('-anim', pokemon, 'Celebrate', pokemon);
				this.add('-message', `${pokemon.name} found one ${item.name}, but has no more capacity for items!`);
			}
		},
		// Ability to carry multiple items handled in ../config/formats.ts
	},
	// Sakuya Izayoi
	stopwatch: {
		name: "Stopwatch",
		onTakeItem: false,
		zMove: "Misdirection",
		zMoveFrom: "Killing Doll",
		itemUser: ["Magearna"],
		desc: "If held by a Magearna with Killing Doll, it can use Misdirection.",
		gen: 9,
	},
	// Zeeb
	slingshot: {
		name: "Slingshot",
		gen: 9,
		onStart(pokemon) {
			const target = pokemon.side.foe.active[pokemon.side.foe.active.length - 1 - pokemon.position];
			const move = this.dex.getActiveMove('populationbomb');
			const dmg = this.actions.getDamage(pokemon, target, move);
			const hits = this.random(2, 3);
			for (let i = 0; i < hits; i++) {
				if (this.randomChance(1, 10)) {
					this.add('-anim', pokemon, 'Bullet Seed', pokemon);
					this.add('-anim', pokemon, 'Wake-Up Slap', pokemon);
					this.add('-message', `${pokemon.name}! Turn the Slingshot the other way!`);
					this.damage(dmg, pokemon, pokemon);
					continue;
				}
				this.add('-anim', pokemon, 'Bullet Seed', target);
				this.damage(dmg, target, pokemon);
				if (dmg && dmg > 0 && this.randomChance(1, 10)) target.addVolatile('flinch');
			}
		},
		onAfterMoveSecondarySelf(source, target, move) {
			if (source === target || move.category === 'Status' || !target || target.fainted) return;
			const base = this.dex.getActiveMove('populationbomb');
			const dmg = this.actions.getDamage(source, target, base);
			const hits = this.random(2, 3);
			for (let i = 0; i < hits; i++) {
				this.add('-anim', source, 'Bullet Seed', target);
				this.damage(dmg, target, source);
				if (this.randomChance(1, 10)) target.addVolatile('flinch');
			}
		},
	},
	// Shifu Robot
	absorptiveshell: {
		name: "Absorptive Shell",
		gen: 9,
		onSwitchIn(pokemon) {
			pokemon.m.newType = '';
			pokemon.m.forcefield = false;
			pokemon.m.forcefieldHp = 0;
			if (pokemon.hp <= pokemon.maxhp / 2) {
				this.add('-anim', pokemon, 'Aqua Ring', pokemon);
				this.add('-message', `${pokemon.name} created a forcefield!`);
				pokemon.m.forcefield = true;
				pokemon.m.forcefieldHp = pokemon.maxhp / 3;
			}
		},
		onDamage(damage, target, source, effect) {
			if (effect?.effectType !== 'Move' || source === target) return;
			if (target.m.forcefield && target.m.forcefieldHp > 0) {
				this.add('-anim', target, 'Aqua Ring', target);
				if (target.m.forcefieldHp >= damage) {
					target.m.forcefieldHp -= damage;
					if (target.m.forcefieldHp <= 0) {
						target.m.forcefield = false;
						target.m.forcefieldHp = 0;
						this.add('-anim', target, 'Cosmic Power', target);
						this.add('-message', `${target.name}'s forcefield shattered!`);
					}
					return 0;
				}
				if (damage > target.m.forcefieldHp) {
					let bleed = damage - target.m.forcefieldHp;
					target.m.forcefield = false;
					target.m.forcefieldHp = 0;
					this.add('-anim', target, 'Cosmic Power', target);
					this.add('-message', `${target.name}'s forcefield shattered!`);
					return bleed;
				}
			}
		},
		onResidual(pokemon) {
			let types = ['Bug', 'Dark', 'Dragon', 'Electric', 'Fairy', 'Fighting', 'Fire', 'Flying', 'Ghost', 'Grass', 'Ground', 'Ice', 'Normal', 'Poison', 'Psychic', 'Rock', 'Water'];
			let newType = this.sample(types);
			pokemon.m.newType = newType;
			pokemon.setType([newType, 'Steel']);
			this.add('-start', pokemon, 'typechange', pokemon.getTypes(true).join('/'), '[from] item: Absorptive Shell');
		},
		onModifyMove(move, pokemon) {
			if (move.id !== 'technoblast') return;
			if (pokemon.m.newType) {
				move.type = pokemon.m.newType;
				this.add('-message', `${pokemon.getItem().name} changed ${move.name} to ${pokemon.m.newType}-type!`);
			} else {
				move.type = 'Steel';
				this.add('-message', `${pokemon.getItem().name} changed ${move.name} to Steel-type!`);
			}
		},
	},
	//Shigeki
	bloodpacks: {
		name: "Blood Packs",
		gen: 9,
		shortDesc: "At ≤50% HP consume A/B/AB. From full, survive KO at 1 HP once. Non-Gligar: tox.",
		desc: "When the holder reaches 50% HP or less, it consumes a Blood Pack. If HP falls to 25% or less, it consumes Type AB. Otherwise if the damage was super effective, it consumes Type B; else Type A. If held by a non-Gligar, it is badly poisoned instead. From full HP, the holder can survive a would-be KO at 1 HP once.",
		onStart(pokemon) {
			if (!pokemon.itemState) pokemon.itemState = {};
			pokemon.itemState.bpConsumed = false;
			pokemon.itemState.bpSashUsed = false;
			pokemon.itemState.bpLastHitSE = false;
		},
		// track whether the last damaging hit was super effective
		onDamagingHit(damage, target, source, move) {
			if (!target.itemState) target.itemState = {};
			const stage = move ? this.dex.getEffectiveness(move.type, target) : 0;
			target.itemState.bpLastHitSE = stage > 0;
		},
		// Focus Sash style from full once
		onDamage(damage, pokemon) {
			if (!pokemon.itemState) pokemon.itemState = {};
			if (pokemon.itemState.bpSashUsed) return;
			if (pokemon.hp === pokemon.maxhp && damage >= pokemon.hp) {
				pokemon.itemState.bpSashUsed = true;
				this.add('-activate', pokemon, 'item: Blood Packs');
				return pokemon.hp - 1;
			}
		},
		onUpdate(pokemon) {
			if (!pokemon.itemState) pokemon.itemState = {};
			if (pokemon.itemState.bpConsumed) return;
			if (pokemon.fainted) return;
			if (pokemon.hp > pokemon.maxhp / 2) return;

			let pack: 'a' | 'b' | 'ab' = 'a';
			if (pokemon.hp <= pokemon.maxhp / 4) {
				pack = 'ab';
			} else if (pokemon.itemState.bpLastHitSE) {
				pack = 'b';
			}
			pokemon.itemState.bpConsumed = true;
			this.add('-activate', pokemon, 'item: Blood Packs');
			if (pokemon.species.id !== 'gligar') { // Non-Gligar gets tox, no bonus
				pokemon.setStatus('tox', pokemon);
				pokemon.useItem();
				return;
			}
			if (pack === 'a') {
				this.add('-message', `${pokemon.name} consumed Blood Pack Type A!`);
				pokemon.addVolatile('bloodpacka');
			} else if (pack === 'b') {
				this.add('-message', `${pokemon.name} consumed Blood Pack Type B!`);
				pokemon.addVolatile('bloodpackb');
			} else {
				this.add('-message', `${pokemon.name} consumed Blood Pack Type AB!`);
				pokemon.addVolatile('bloodpackab');
			}
			pokemon.useItem();
		},
	},	
	// PokeKart
	flameflyer: {
		name: "Flame Flyer",
		gen: 9,
		desc: "This Pokemon becomes Steel/Fire-type upon switching in. This Pokemon's attacks use Speed in damage calculation instead of Attack or Special Attack.",
		shortDesc: "Steel/Fire; Uses Speed in damage calculation.",
		onStart(pokemon) {
			if (pokemon.setType(['Steel', 'Fire'])) this.add('-start', pokemon, 'typechange', 'Steel/Fire', '[from] item: Flame Flyer');
		},
		onModifyMove(move, pokemon) {
			move.overrideOffensiveStat = 'spe';
		},
	},
	// Luminous
	spectralprism: {
		name: "Spectral Prism",
		gen: 9,
		onTakeItem: false,
		zMove: "Polaris",
		zMoveFrom: "Rainbow Maxifier",
		itemUser: ["Necrozma"],
		onDamage(damage, target, source, effect) {
			if (effect.effectType !== 'Move' && effect.id !== 'recoil') {
				if (effect.effectType === 'Ability') this.add('-activate', source, 'ability: ' + effect.name);
				return false;
			}
		},
		onModifyDefPriority: 6,
		onModifyDef(def, pokemon) {
			if (pokemon.status) {
				return this.chainModify(1.5);
			}
		},
		onModifySpdPriority: 6,
		onModifySpd(spd, pokemon) {
			if (pokemon.status) {
				return this.chainModify(1.5);
			}
		},
	},
	// Fblthp
	bubblewand: {
		name: 'Bubble Wand',
		gen: 9,
		desc: "Upon switching out, all adjacent Pokemon's Speed stats are lowered by one stage, and all active Pokemon's happiness stats are increased by 30 points, or increased to max if differential between current and max happiness is less than 30.",
		shortDesc: "Switch-out: Lowers Pokemon's Speed by 1; Boosts happiness.",
		onSwitchOut(pokemon) {
			this.add('-anim', pokemon, 'Bubble Beam', pokemon);
			for (const target of this.getAllActive()) {
				if (pokemon === target) continue;
				this.boost({ spe: -1 }, target, target, this.effect);
				if (target.happiness < 255) target.happiness += 30;
				if (target.happiness > 255) target.happiness = 255;
			}
			if (pokemon.happiness < 255) pokemon.happiness += 30;
			if (pokemon.happiness > 255) target.happiness = 255;
		},
	},
	// Faust
	crossroadsblues: {
		name: 'Crossroads Blues',
		gen: 9,
		onTakeItem: false,
		zMove: "The House Always Wins",
		zMoveFrom: "Faustian Bargain",
		itemUser: ["Hoopa-Unbound"],
		onAnyFaint() {
			let totalFaintedFoes = 0;
			const pokemon = this.effectState.target;
			const target = pokemon.side.foe.active[pokemon.side.foe.active.length - 1 - pokemon.position];
			const faintedFoes = target.side.pokemon.filter(foe => foe.fainted);
			if (faintedFoes.length) totalFaintedFoes = faintedFoes.length;
			const totalHeal = ((pokemon.baseMaxhp / 8) + ((pokemon.baseMaxhp / 8) * totalFaintedFoes));
			this.add('-activate', pokemon, 'item: Crossroads Blues');
			this.heal(totalHeal, pokemon);
		},
	},
	// Croupier
	staufensdie: {
		name: 'Staufen\'s Die',
		gen: 9,
		onStart(pokemon) {
			if (!pokemon.m.wagerStacks) pokemon.m.wagerStacks = 0;
		},
		onModifyDamage(damage, source, target, move) {
			if (target.getMoveHitData(move).crit) {
				this.add("-activate", source, "item: Staufen's Die");
				this.addMove('-anim', source, 'Pay Day', source);
				this.add('-message', `Critical hit! ${source.name} scored six wager stacks!`);
				if (!source.m.wagerStacks) source.m.wagerStacks = 0;
				source.m.wagerStacks += 6;
				return;
			}
		},
		onResidual(pokemon) {
			if (pokemon.m.wagerStacks >= 6) {
				pokemon.m.wagerStacks -= 6;
				this.add("-activate", pokemon, "item: Staufen's Die");
				this.add('-message', `${pokemon.name} wagered six stacks to Roll the Dice!`);
				this.actions.useMove('Roll the Dice', pokemon);
			}
		},
		onModifyCritRatio(critRatio, user) {
			if (user.m.luckySix) return critRatio + 5;
		},
		onTakeItem: false,
		zMove: "All In",
		zMoveFrom: "Roll the Dice",
		itemUser: ["Hoopa"],
	},
	// flufi
	epipen: {
		name: "EpiPen",
		gen: 9,
		shortDesc: "1.5x Defense; 1/3 or less max HP: Heals chosen ally.",
		desc: "This Pokemon's Defense is 1.5x. Whenever this Pokemon has 1/3 or less max HP, heals a selected inactive party member for 75% of their max HP and cures its status conditions. If held by a Pikachu-Starter with Cranberry Cutter, it can use Rip Apart. Single use.",
		onTakeItem: false,
		zMove: "Rip Apart",
		zMoveFrom: "Cranberry Cutter",
		itemUser: ["Pikachu-Starter"],
		onModifyDef(def, pokemon) {
			return this.chainModify(1.5);
		},
		onUpdate(pokemon) {
			if (pokemon.hp <= pokemon.maxhp / 3 && !pokemon.itemLocked) {
				this.add('-activate', pokemon, 'item: EpiPen');
				let thisSideAllies = [];
				for (const ally of pokemon.side.pokemon) {
					if (ally === pokemon) continue;
					if (ally.fainted || ally.hp <= 0) continue;
					if (ally.hp >= ally.maxhp && !ally.status) continue;
					thisSideAllies.push(ally);
				}
				// If there are no surviving allies that require healing of any kind, use on self automatically
				if (!thisSideAllies.length) {
					this.heal(pokemon.maxhp * 0.75, pokemon);
					if (pokemon.status) pokemon.cureStatus();
					pokemon.itemLocked = true;
					return;
				}
				pokemon.side.addSlotCondition(pokemon, 'epipen');
				pokemon.itemLocked = true;
				pokemon.switchFlag = true;
			}
		},
		condition: {
			// implemented in ../scripts.ts
			duration: 1,
		},
	},
	// Cyclommatic Cell
	apparatus: {
		name: "Apparatus",
		gen: 9,
		shortDesc: "See '/ssb Cyclommatic Cell' for more!",
		desc: "On switch-in, holder becomes Electric and gains Magnet Rise. Starts Ion Deluge. Restores one gauge of battery life at end of each turn. Techno Blast: Steel-type, 1.3x power. Energy Ball: 1.3x power. Parabolic Charge drains 75%.",
		onStart(pokemon) {
			this.add('-activate', pokemon, 'item: Apparatus');
			pokemon.setType(['Electric']);
			this.add("-start", pokemon, "typechange", "Electric", "[from] item: Apparatus");
			pokemon.addVolatile('magnetrise');
			this.field.addPseudoWeather('iondeluge');
		},
		// Techno Blast becomes Steel
		onModifyType(move, pokemon) {
			if (move.id === 'technoblast') {
				move.type = 'Steel';
			}
		},
		// Parabolic Charge drains 75% instead of 50%
		onModifyMove(move, pokemon) {
			if (move.id === 'paraboliccharge') {
				(move as any).drain = [3, 4];
			}
		},
		onBasePowerPriority: 23,
		onBasePower(basePower, pokemon, target, move) {
			if (move.id === 'technoblast' || move.id === 'energyball') {
				return this.chainModify([5325, 4096]); // 1.3x
			}
		},
		onResidual(pokemon) {
			if (pokemon.species.id !== 'vikavolttotem') return;
			if (pokemon.gauges < 5) {
				this.add('-activate', pokemon, 'item: Apparatus');
				this.add('-message', `${pokemon.name} gained charge!`);
				pokemon.gauges += 1;
				this.add('-message', `Battery Remaining: ${(pokemon.gauges / 5) * 100}%`);
			}
		},
	},
	// Marisa Kirisame
	minihakkero: {
		name: "Mini-Hakkero",
		spritenum: 249,
		onTakeItem: false,
		zMove: "Master Spark",
		zMoveFrom: "Orb Shield",
		itemUser: ["Hatterene"],
		desc: "If held by a Hatterene with Orb Shield, it can use Master Spark.",
		gen: 9,
	},
	// Prince Smurf
	smurfscrown: {
		name: "Smurf\'s Crown",
		spritenum: 236,
		zMove: "Dynamic Shift",
		zMoveFrom: "You Filthy Peasant",
		itemUser: ["Kecleon"],
		fling: {
			basePower: 300,
		},
		onTryBoost(boost, target, source, effect) {
			if (source && target === source) return;
			let showMsg = false;
			let i: BoostID;
			for (i in boost) {
				if (boost[i]! < 0) {
					delete boost[i];
					showMsg = true;
				}
			}
			if (showMsg && !(effect as ActiveMove).secondaries && effect.id !== 'octolock') {
				this.add('-fail', target, 'unboost', '[from] item: Smurf\'s Crown', '[of] ' + target);
			}
		},
		onAfterMoveSecondarySelfPriority: -1,
		onAfterMoveSecondarySelf(pokemon, target, move) {
			if (move.totalDamage && !pokemon.forceSwitchFlag) {
				this.heal(move.totalDamage / 4, pokemon);
			}
		},
		shortDesc: "See '/ssb Prince Smurf' for more!",
		desc: "Prevents other Pokemon from lowering the holder's stats; after an attack, holder recovers 1/4 of the damage dealt to the Target. Holder is able to use Z-Move Dynamic Shift.",
	},
	// Kozuchi
	forgedhammer: {
		name: "forgedhammer",
		onTakeItem: false,
		spritenum: 761,
		onModifyMove(move) {
			delete move.flags['contact'];
		},
		zMove: "Emergency Upgrades",
		zMoveFrom: "Weapon Enhancement",
		itemUser: ["Tinkaton"],
		gen: 9,
		desc: "Protects from contact effects. If held by a Tinkaton with 'Weapon Enhancement', allows the usage of the Z-Move 'Emergency Upgrades'.",
	},
	// Urabrask
	braidoffire: {
		name: "Braid of Fire",
		onTakeItem: false,
		onDamagingHitOrder: 2,
		onDamagingHit(damage, target, source, move) {
			if (move.category === 'Physical') {
				this.add('-anim', target, 'Searing Shot', target);
				let temp = this.dex.getActiveMove('ember');
				for (const pokemon of this.getAllActive()) {
					if (pokemon.volatiles['protect']) continue;
					let burn = this.actions.getDamage(target, pokemon, temp);
					this.damage(burn, pokemon, target, this.dex.items.get('Braid of Fire'));
				}
				this.add('-message', `Braid of Fire scorched the battlefield!`);
			}
		},
		onAfterMoveSecondarySelf(source, target, move) {
			if (move.category === 'Physical') {
				this.add('-anim', source, 'Searing Shot', source);
				let temp = this.dex.getActiveMove('ember');
				for (const pokemon of this.getAllActive()) {
					let burn = this.actions.getDamage(source, pokemon, temp);
					this.damage(burn, pokemon, source, this.dex.items.get('Braid of Fire'));
				}
				this.add('-message', `Braid of Fire scorched the battlefield!`);
			}
		},
		zMove: "Blasphemous Act",
		zMoveFrom: "Terrorize the Peaks",
		itemUser: ["Smokomodo"],
		desc: "If holder is hit by a physical move or uses a physical move, all active Pokemon are hit with Ember. If held by a Smokomodo with Terorrize the Peaks, it can use Blasphemous Act.",
		shortDesc: "Damages all Pokemon if holder is hit by/uses a physical move.",
		gen: 9,
	},
	// Mima
	crescentstaff: {
		name: "Crescent Staff",
		spritenum: 698,
		onTakeItem: false,
		zMove: "Reincarnation",
		zMoveFrom: "Complete Darkness",
		itemUser: ["Mismagius"],
		desc: "If held by a Mismagius with Complete Darkness, it can use Reincarnation.",
		gen: 9,
	},
	// Gizmo
	inconspicuouscoin: {
		name: "Inconspicuous Coin",
		desc: "Whenever the holder is attacked, it has a 20% chance to take 1/2 damage. Whenever the holder attacks, it has a 20% chance to deal 2x damage. Chances increase by an additional 20% per charge stored.",
		shortDesc: "See '/ssb Gizmo' for more!",
		gen: 9,
		onSourceModifyDamage(damage, source, target, move) {
			if (!target.m.charges) target.m.charges = 0;
			const chance = 5 / (1 + target.m.charges);
			if (this.randomChance(1, chance)) {
				this.add('-message', `${target.name} defended itself with the Inconspicuous Coin!`);
				return this.chainModify(0.5);
			}
		},
		onModifyDamage(damage, source, target, move) {
			if (!source.m.charges || source.m.charges === 0) return;
			const chance = 5 / (1 + source.m.charges);
			if (this.randomChance(1, chance) && move.basePower <= 60) {
				this.add('-message', `${source.name} used the Inconspicuous Coin's charge to strengthen ${move.name}'s impact!`);
				return this.chainModify(2);
			}
		},
	},
	// Glint
	slag: {
		name: "Slag",
		spritenum: 34,
		gen: 9,
		desc: "If held by a Meltan, this Pokemon's attacking moves have a 30% chance to fail.",
		shortDesc: "Meltan: Attacks have 30% chance to fail.",
		onTryMove(pokemon, target, move) {
			if (this.randomChance(3, 10)) {

				this.add('-message', `Whoops! ${pokemon.name} slipped on some Slag!`);
				
				let verb = "is"; let pronoun = "he";
				switch (pokemon.gender) {
					case "F":
						pronoun = "she";
						break;
					case "N":
						verb = "are"; pronoun = "they";
						break;
				}
				this.add('-message', `Why ${verb} ${pronoun} carrying slag?`);
				return null;
			}
		},
	},
	// Finger
	mattermirror: {
		name: "Matter Mirror",
		spritenum: 69,
		desc: "This Pokemon's Physical attacks become Special.",
		gen: 9,
		onModifyMove(move, pokemon) {
			if (move.category === 'Physical') {
				move.category = 'Special';
			}
		},
	},
	// Pablo
	sketchbook: {
		name: "Sketchbook",
		spritenum: 200,
		desc: "On switch-in, this Pokemon copies the positive stat changes of the opposing Pokemon, and receives a random positive volatile effect at the end of each full turn on the field.",
		shortDesc: "Switch-in: Copies boosts; Random volatile each turn.",
		gen: 9,
		onStart(pokemon) {
			const target = pokemon.side.foe.active[pokemon.side.foe.active.length - 1 - pokemon.position];
			const boosts: SparseBoostsTable = {};
			let i: BoostID;
			let boosted = false;
			if (!target.boosts) return;
			for (i in target.boosts) {
				if (target.boosts[i] > 0) {
					boosts[i] = target.boosts[i];
					boosted = true;
				}
			}
			if (boosted) {
				this.add("-activate", pokemon, "item: Sketchbook");
				this.boost(boosts, pokemon);
				this.add('-message', `${pokemon.name} copied ${target.name}'s stat changes!`);
			}
		},
		onResidual(pokemon) {
			let effectPool = ['aquaring', 'focusenergy', 'helpinghand', 'ingrain', 'laserfocus', 'magnetrise', 'substitute', 'stockpile', 'charge', 'destinybond', 'dragoncheer', 'lockon'];
			let randomEffect = this.sample(effectPool);
			if (!pokemon.volatiles[randomEffect]) pokemon.addVolatile(randomEffect);
		},
	},
	// Trey
	yoichisbow: {
		name: "Yoichi's Bow",
		spritenum: 429,
		onTakeItem: false,
		zMove: "Grand Delta",
		zMoveFrom: "Burst Delta",
		itemUser: ["Decidueye-Hisui"],
		onBasePowerPriority: 15,
		onBasePower(basePower, user, target, move) {
			if (move && move.type === 'Flying') {
				return this.chainModify(1.3);
			}
		},
		desc: "Holder's Flying-type attacks have 1.3x power. If held by Decidueye-Hiseui with Burst Delta, it can use Grand Delta.",
		gen: 9,
	},
	// Aeri
	fleetingwinds: {
		name: "Fleeting Winds",
		onStart(source) {
			this.field.setTerrain('mistyterrain');
		},
		onDamagePriority: -40,
		onDamage(damage, target, source, effect) {
			if (damage >= target.hp) {
				this.add("-activate", target, "item: Fleeting Winds");
				this.actions.useMove('Healing Wish', target);
				target.side.addSideCondition('tailwind', target);
				target.m.faintOnUpdate = true;
				return target.hp - 1;
			}
		},
		onUpdate(pokemon) {
			if (pokemon.m.faintOnUpdate) {
				pokemon.m.faintOnUpdate = false;
				pokemon.faint();
			}
		},
		desc: "On switch-in, starts Misty Terrain. If this Pokemon would faint, starts Tailwind and uses Healing Wish.",
		shortDesc: "Switch-in: Misty Terrain; Faint; Tailwind + Healing Wish.",
		gen: 9,
	},
};
