import { ssbSets } from "./random-teams";
import { PSEUDO_WEATHERS, changeSet, getName } from "./scripts";
import { Teams } from '../../../sim/teams';

export const Moves: import('../../../sim/dex-moves').ModdedMoveDataTable = {
	/*
	// Example
	moveid: {
		accuracy: 100, // a number or true for always hits
		basePower: 100, // Not used for Status moves, base power of the move, number
		category: "Physical", // "Physical", "Special", or "Status"
		shortDesc: "", // short description, shows up in /dt
		desc: "", // long description
		name: "Move Name",
		gen: 8,
		pp: 10, // unboosted PP count
		priority: 0, // move priority, -6 -> 6
		flags: {}, // Move flags https://github.com/smogon/pokemon-showdown/blob/master/data/moves.js#L1-L27
		onTryMove() {
			this.attrLastMove('[still]'); // For custom animations
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Move Name 1', source);
			this.add('-anim', source, 'Move Name 2', source);
		}, // For custom animations
		secondary: {
			status: "tox",
			chance: 20,
		}, // secondary, set to null to not use one. Exact usage varies, check data/moves.js for examples
		target: "normal", // What does this move hit?
		// normal = the targeted foe, self = the user, allySide = your side (eg light screen), foeSide = the foe's side (eg spikes), all = the field (eg raindance). More can be found in data/moves.js
		type: "Water", // The move's type
		// Other useful things
		noPPBoosts: true, // add this to not boost the PP of a move, not needed for Z moves, dont include it otherwise
		isZ: "crystalname", // marks a move as a z move, list the crystal name inside
		zMove: {effect: ''}, // for status moves, what happens when this is used as a Z move? check data/moves.js for examples
		zMove: {boost: {atk: 2}}, // for status moves, stat boost given when used as a z move
		critRatio: 2, // The higher the number (above 1) the higher the ratio, lowering it lowers the crit ratio
		drain: [1, 2], // recover first num / second num % of the damage dealt
		heal: [1, 2], // recover first num / second num % of the target's HP
	},
	*/
	// Please keep sets organized alphabetically based on staff member name!
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

		if (
			move &&
			move.category === 'Status' &&
			move.heal
		) {
			const [num, den] = move.heal;
			const healAmount = Math.floor(holder.baseMaxhp * num / den);

		if (healAmount > 0) {
			this.heal(healAmount, holder);
			this.add('-message', `${holder.name} copied their opponent's healing!`);
				}
			}
		},
	},
	// Hooked Doll
	retribution: {
		name: "Retribution",
		category: "Physical",
		gen: 9,
		desc: "Damages then switches. If opponent has 'Vindictive', deals double damage, heals 50% of damage dealt.",
		shortDesc: "Switch-out. 2x power, 50% healing if foe = vindictive.",
		basePower: 60,
		accuracy: 100,
		pp: 10,
		priority: 0,
		flags: { protect: 1, metronome: 1, contact: 1 },
		selfSwitch: true,
		onTryMove(target, source, move) {
			//whatever the fuck this does
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source, move) {
			//adds a 'hex' animation to the target if they have 'vindictive'
			this.add ('-anim', source, 'Hex', target);
			this.add ('-anim', target, 'Shadow Claw', target);
			if (target.volatiles['vindictive']) {
				this.add ('-anim', target, 'Hex', target);
			}
		},
		onModifyMove(move, pokemon, target) {
			//drains 50% of damage dealt if opponent has 'vindictive'
			if (target.volatiles['vindictive']) {
				move.drain = [1, 2];
			}
		},
		type: "Ghost",
		target: 'normal',
	}, //end of signature move
	// Graaz
	wildmagicfrenzy: {
		name: "Wild Magic Frenzy",
		category: "Status",
		gen: 9,
		basePower: 0,
		accuracy: true,
		pp: 5,
		priority: 0,
		flags: { metronome: 1 },
		volatileStatus: 'wildmagicfrenzy',
		onTryMove(target, source, move) {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source, move) {
			this.add('-anim', source, 'Work Up');
			this.add('-anim', source, 'Fire Punch', source);
			this.add('-anim', source, 'Thunder Punch', source);
			this.add('-anim', source, 'Boomburst');
		},
		condition: {
			duration: 3,
			onStart(pokemon) {
				this.add('-message', `${pokemon.name} is enraged!`);
			},
			onModifySTAB(stab, source, target, move) {
				if (source !== target && move.category === 'Physical' && stab < 1.5) {
					this.debug('wild magic frenzy adding stab to nonstab move');
					return 1.5;
				}
			},
			onEffectiveness(typeMod, target, type, move) {
				if (!target) return;
				if (move.category === 'Physical' && typeMod )
				return 0;
			},
		},
		secondary: null,
		type: "Fire",
		target: "self",
	},
	// Graaz
	bullrush: {
		name: "Bull Rush",
		category: "Physical",
		gen: 9,
		basePower: 60,
		accuracy: true,
		desc: "Usually goes first. 10% chance to flinch. 40% chance to flinch instead if hitting an ally.",
		shortDesc: "+1 priority. Foes/10% flinch. Allies/40% flinch.",
		pp: 10,
		priority: 1,
		flags: { protect: 1, metronome: 1, contact: 1 },
		onTryMove(target, source, move) {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source, move) {
			this.add('-anim', source, 'Stomping Tantrum', source);
			this.add('-anim', source, 'Extreme Speed', target);
			if (!move.secondaries) move.secondaries = [];
			if (target.side === source.side) {
				move.secondaries.push({
					chance: 40,
					volatileStatus: 'flinch',
				});
			} else {
				move.secondaries.push({
					chance: 10,
					volatileStatus: 'flinch',
				});
			}
		},
		secondary: null,
		type: "Ground",
		target: "normal",
	},
	// Roughskull
	radiationstench: {
		name: "Radiation Stench",
		category: "Physical",
		gen: 9,
		desc: "Power doubles if the target is poisoned, and has a 20% chance to cause the target to flinch. Neutral effectiveness against Steel-type. Nullifies the target's ability upon hitting.",
		shortDesc: "20%: Flinch. PSN: 2x power. Neutral vs Steel. Nullifies abilities.",
		basePower: 100,
		accuracy: 100,
		pp: 10,
		priority: 0,
		volatileStatus: 'gastroacid',
		ignoreImmunity: {'Poison': true},
		flags: { protect: 1, metronome: 1 },
		onTryMove(target, source, move) {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source, move) {
			this.add('-anim', source, 'Gunk Shot', target);
			this.add('-anim', target, 'G-Max Malodor', target);
		},
		onEffectiveness(typeMod, target, type) {
			if (type === 'Steel') return 0;
		},
		onBasePower(basePower, pokemon, target) {
			if (target.status === 'psn' || target.status === 'tox') {
				return this.chainModify(2);
			}
		},
		secondary: {
			chance: 20,
			volatileStatus: 'flinch',
		},
		type: "Poison",
		target: "normal",
	},
	// Horrific17
	chicxulubimpact: {
		name: "Chicxulub Impact",
		category: "Physical",
		gen: 9,
		basePower: 150,
		accuracy: true,
		pp: 1,
		priority: 0,
		flags: { contact: 1 },
		status: 'brn',
		sideCondition: "chicxulubimpact",
		onTryMove(target, source, move) {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source, move) {
			this.add('-anim', source, 'Draco Meteor', target);
			this.add('-anim', source, 'V-Create', target);
			this.add('-anim', target, 'Explosion', target);
			this.add('-anim', target, 'Inferno', target);
			if (source.hp < source.maxhp / 2) {
				for (const side of source.side.foeSidesWithConditions()) {
					side.addSideCondition('gmaxwildfire', source, move);
				}
			} else if (source.hp >= source.maxhp / 2) {
				this.field.setWeather('desolateland', source, move);
			}
		},
		condition: {
			duration: 5,
			onSideStart(side) {
				this.add('-sidestart', side, 'move: Chicxulub Impact');
			},
			durationCallback(target, source) {
				// Makeshift solution to make the trapping last 4-5 turns; default to 5, but 50% chance it changes to 4 instead
				// Fire Spin lasts 4-5 turns and I have no fucking clue how this.random works
				if (this.randomChance(1, 2)) return 4;
			},
			onTrapPokemon(pokemon) {
				pokemon.tryTrap();
			},
			onResidual(pokemon) {
				this.add('-anim', pokemon, 'Fire Spin', pokemon);
				this.damage(pokemon.maxhp / 8, pokemon, this.effectState.source, this.dex.moves.get('firespin'));
			},
			onSideEnd(side) {
				this.add('-sideend', side, 'move: Chicxulub Impact');
			},
		},
		secondary: null,
		type: "Fire",
		target: "allAdjacent",
	},
	meteorstrike: {
		name: "Meteor Strike",
		category: "Physical",
		gen: 9,
		shortDesc: "+50% HP: Sunny Day, BRN, -1/4 HP. -49% HP: 33% recoil.",
		desc: "If this Pokemon has 50% max HP or higher, -6 priority, summons Sunny Day for 8 turns, burns the target, and the user loses 25% of its maximum HP. If this Pokemon has less than 50% max HP, has 33% recoil.",
		basePower: 100,
		accuracy: 100,
		pp: 5,
		priority: 0,
		flags: { protect: 1, metronome: 1, contact: 1 },
		onTryMove(target, source, move) {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source, move) {
			this.add('-anim', source, 'Draco Meteor', target);
			this.add('-anim', source, 'Flare Blitz', target);
		},
		onModifyMove(move, pokemon) {
			if (pokemon.hp >= pokemon.maxhp / 2) {
				move.status = 'brn';
				move.weather = 'sunnyday';
				move.priority = -6;
				move.onAfterHit = function (t, s, m) {
					this.damage(s.maxhp / 4, s);
				};
			} else {
				move.recoil = [33, 100];
			}
		},
		secondary: null,
		type: "Fire",
		target: "normal",
	},
	// Koiru
	coilconnection: {
		name: "Coil Connection",
		gen: 9,
		category: "Status",
		type: "Electric",
		pp: 40,
		priority: 5,
		accuracy: true,
		flags: { snatch: 1, cantusetwice: 1 },
		target: "self",
		shortDesc: "Protects; contact burns. Swaps Coil Mode and resets Grade to D.",
		desc: "Protects from attacking moves; contact burns. Swaps Coil Mode in order (Gravity -> Speed -> Regeneration -> Gravity). Resets Grade to D when swapping modes.",
		volatileStatus: 'coilconnection',
		onTryMove(target, source, move) {
			// If in Fusion, this button becomes Hellhound Strike instead.
			if (source.volatiles['coilfusion']) {
				this.attrLastMove('[still]');
				this.actions.useMove('hellhoundstrike', source, source.side.foe.active[source.position] || source);
				return null;
			}
		},
		onPrepareHit(target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, 'Shift Gear', source);
		},
		onHit(target, source) {
			// mode + grade reset happens here
			if (!source.m.coilMode) source.m.coilMode = 'gravity';
			const cur = source.m.coilMode;
			let next: string = 'gravity';
			if (cur === 'gravity') next = 'speed';
			else if (cur === 'speed') next = 'regen';
			else if (cur === 'regen') next = 'gravity';
			else next = 'gravity';

			source.m.coilMode = next;
			source.m.coilGrade = 'D'; // reset on mode swap

			this.add('-message', `${source.name} switched to ${next.toUpperCase()} Mode! (Grade D)`);
		},
	},
	frostbitefusion: {
		name: "Frostbite Fusion",
		gen: 9,
		category: "Physical",
		type: "Fighting",
		basePower: 160,
		accuracy: 100,
		pp: 1,
		noPPBoosts: true,
		priority: 0,
		isZ: "fusioncoils",
		flags: {},
		shortDesc: "160 BP. Combines Ice/Fighting effectiveness. Enters Coil Fusion (3 turns).",
		desc: "Deals damage. Effectiveness uses the better of Fighting or Ice. Then enters Coil Fusion for 3 turns: becomes Electric/Fighting, locked at B Grade, all modes at once, Coil Connection becomes Hellhound Strike.",
		onPrepareHit(target, source, move) {
			this.add('-anim', source, 'Collision Course', target);
		},
		onEffectiveness(typeMod, target, type) {
			// take the better effectiveness between Fighting and Ice vs that defender type
			// (If your dex build doesn't support getEffectiveness vs TypeName, swap this to a lookup you use elsewhere.)
			const f = this.dex.getEffectiveness('Fighting', type as any);
			const i = this.dex.getEffectiveness('Ice', type as any);
			return Math.max(f, i);
		},
		onHit(target, source) {
			source.addVolatile('coilfusion');
		},
		target: "normal",
	},
	hellhoundstrike: {
		name: "Hellhound Strike",
		gen: 9,
		category: "Physical",
		type: "Fighting",
		pp: 5,
		accuracy: 100,
		priority: 0,
		flags: {protect: 1, contact: 1},
		target: "normal",
		shortDesc: "BP scales by Speed ratio (user/target).",
		desc: "BP scales by Speed ratio (user/target): 150 (>=4), 120 (>=3), 90 (>=2), 60 (>=1), 40 (<1).",
		onTryMove(target, source, move) {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source, move) {
			this.add('-anim', source, 'Meteor Assault', target);
		},
		basePowerCallback(pokemon, target) {
			const s = pokemon.getStat('spe', false, true);
			const t = target.getStat('spe', false, true);
			const ratio = t ? (s / t) : 4;
			if (ratio >= 4) return 150;
			if (ratio >= 3) return 120;
			if (ratio >= 2) return 90;
			if (ratio >= 1) return 60;
			return 40;
		},
	},	
	// Lyssa
	masochism: {
		name: "Masochism",
		basePower: 80,
		category: "Physical",
		accuracy: 100,
		gen: 9,
		priority: 0,
		pp: 15,
		desc: "Restores the item the user last used.",
		shortDesc: "Restores the item the user last used.",
		flags: { contact: 1, protect: 1, metronome: 1 },
		onTryMove(target, source, move) {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source, move) {
			this.add('-anim', source, 'Mean Look', target);
			this.add('-anim', source, 'Superpower', target);
		},
		onHit(target, source, move) {
			if (source.item || !source.lastItem) return false;
			const item = source.lastItem;
			source.lastItem = '';
			this.add('-item', source, this.dex.items.get(item), '[from] move: Masochism');
			source.setItem(item);
		},
		secondary: null,
		type: "Fighting",
		target: "normal",
	},
	// Cinque
	homerunswing: {
		name: "Homerun Swing",
		basePower: 40,
		category: "Physical",
		accuracy: true,
		gen: 9,
		desc: "Ignores immunities and protection. Homerun Swing - Windup's PP is reduced to 0. If this KOes the target, user's Attack, Defense, and Special Defense are 1.5x permanently, STAB bonus is permanently 2x instead of 1.5x, and restores 35% of its max HP.",
		shortDesc: "Ignores immunity. If KO: Heals, increases ATK/DEF/SPD, boosts STAB.",
		priority: 6,
		pp: 5,
		isZ: "moogleplushie",
		ignoreImmunity: true,
		flags: { contact: 1 },
		onTryMove(target, source, move) {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source, move) {
			this.add('-anim', source, 'Teeter Dance', source);
			this.add('-anim', source, 'Bone Club', target);
		},
		onEffectiveness(typeMod, target, type, move) {
			if (move.type !== 'Ground' || !target) return;
			if (!target.runImmunity('Ground')) {
				if (target.hasType('Flying')) return 0;
			}
		},
		basePowerCallback(pokemon, target, move) {
			if (!pokemon.m.windup) return move.basePower;
			let power = pokemon.m.windup * 60;
			return move.basePower + power;
		},
		onHit(target, source, move) {
			this.add('-anim', source, 'Dragon Cheer', source);
		},
		onAfterMoveSecondarySelf(pokemon, target, move) {
			if (!target || target.fainted || target.hp <= 0) {
				pokemon.m.homerun = true;
				this.heal(pokemon.baseMaxhp * 0.35, pokemon);
				this.add('-message', `It's a K.O.!\n${pokemon.name}'s Attack, Defense, and Special Defense increased!`);
			}
			if (pokemon.m.windup) {
				const boosts: SparseBoostsTable = {};
				boosts.def = -pokemon.m.windup;
				boosts.spd = -pokemon.m.windup;
				this.boost(boosts, pokemon, pokemon);
			}
			pokemon.deductPP('homerunswingwindup', 64);
			pokemon.m.windup = 0;
		},
		secondary: null,
		type: "Ground",
		target: "normal",
	},
	homerunswingwindup: {
		name: "Homerun Swing - Windup",
		category: "Physical",
		basePower: 0,
		accuracy: true,
		pp: 64,
		noPPBoosts: true,
		ignoreImmunity: true,
		ignoreAbility: true,
		desc: "Raises user's Defense and Special Defense by 1 stage and increases the power of Homerun Swing. After use, user is trapped and can only select Homerun Swing Windup and Homerun Swing until Homerun Swing is used successfully.",
		shortDesc: "+1 DEF/SPD/Z-Move power increases. Locks in until Z-move is used.",
		priority: 0,
		flags: {},
		onTryMove(target, source, move) {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source, move) {
			this.add('-anim', source, 'Dragon Dance', source);
		},
		onHit(target, source, move) {
			this.boost({ def: 1, spd: 1 }, source, source);
			if (!source.volatiles['homerunswingwindup']) source.addVolatile('homerunswingwindup');
			if (!source.m.windup) source.m.windup = 0;
			source.m.windup++;
			this.add('-message', `${source.name} is winding up!`);
		},
		condition: {
			onTrapPokemon(pokemon) {
				pokemon.tryTrap();
			},
			onDisableMove(pokemon) {
				for (const move of pokemon.moveSlots) {
					if (move.id !== 'homerunswingwindup' && move.id !== 'homerunswing') {
						pokemon.disableMove(move.id);
					}
				}
			},
			onAfterMove(pokemon, target, move) {
				if (move.id === 'homerunswing') {
					pokemon.removeVolatile('homerunswingwindup');
				}
			},
		},
		secondary: null,
		type: "Ground",
		target: "normal",
	},
	// PokeKart, o' PokeKart
	itembox: {
		name: "Item Box",
		basePower: 0,
		category: "Physical",
		accuracy: true,
		gen: 9,
		pp: 64,
		noPPBoosts: true,
		flags: { protect: 1, failmefirst: 1, nosleeptalk: 1, noassist: 1, failcopycat: 1, failinstruct: 1 },
		priority: 0,
		onTryMove() {
			this.attrLastMove('[still]');
		},
		beforeTurnCallback(pokemon) {
			// mario puncha da block weeheeeee HELP ME.
			this.add('-anim', pokemon, 'Sky Uppercut', pokemon);
			const items = ['megamushroom', 'triplemushroom', 'tripleredshell', 'star', 'triplebanana', 'boo', 'powblock', 'spinyshell', 'triplegreenshell', 'blooper', 'bulletbill'];
			const selectedItem = this.sample(items);
			pokemon.m.itemBox = selectedItem;
		},
		onPrepareHit(target, source, move) {
			if (!source.m.itemBox) {
				this.add('-fail', source, 'move: Item Box');
				this.hint(`Error: No item selected on the backend for Item Box.\nContact the developer if you see this.`);
				return null;
			}
			switch (source.m.itemBox) {
				case 'megamushroom':
					this.add(`raw|<b>Mega Mushroom!</b>`);
					source.addVolatile('megamushroom');
					move.basePower = 100;
					break;
				case 'triplemushroom':
					this.add(`raw|<b>Triple Mushroom!</b>`);
					this.add('-anim', source, 'Growth', source);
					move.basePower = 20;
					move.multihit = 3;
					move.onTryHit = function (t, s, m) {
						this.add('-anim', s, 'Quick Attack', t);
					};
					move.onHit = function (t, s, m) {
						this.boost({ spe: 1 }, s, s, m);
					};
					move.onAfterMoveSecondarySelf = function (p, t, m) {
						this.boost({ spe: -2 }, p, p, m);
					};
					break;
				case 'tripleredshell':
					this.add(`raw|<b>Triple Red Shell!</b>`);
					this.add('-anim', source, 'Searing Shot', target);
					move.basePower = 40;
					move.multihit = 3;
					move.onHit = function (t, s, m) {
						if (this.randomChance(1, 3)) this.boost({ spe: -1 }, t, s, m);
					};
					break;
				case 'star':
					this.add(`raw|<b>Star!</b>`);
					this.actions.useMove('Star', source, target);
					source.addVolatile('star');
					return this.NOT_FAIL;
					break;
				case 'lightning':
					this.add('-anim', target, 'Thunderbolt', target);
					this.add(`raw|<b>Lightning!</b>`);
					move.basePower = 100;
					move.onHit = function (t, s, m) {
						t.side.addSideCondition('lightning');
					};
					break;
				case 'triplebanana':
					this.add(`raw|<b>Triple Banana!</b>`);
					this.add('-anim', source, 'Teeter Dance', source);
					move.basePower = 1;
					move.multihit = 3;
					move.onHit = function (t, s, m) {
						if (this.randomChance(1, 3)) {
							this.add('-anim', t, 'Tickle', t);
							this.add('-message', `${t.name} slipped on a banana!`);
							if (!t.volatiles['mustrecharge']) t.addVolatile('mustrecharge');
						}
					};
					break;
				case 'boo':
					this.add(`raw|<b>Boo!</b>`);
					source.addVolatile('boo');
					return this.NOT_FAIL;
					break;
				case 'powblock':
					this.add(`raw|<b>POW!</b>`);
					this.add('-anim', source, 'Earthquake', target);
					this.add('-anim', target, 'Seismic Toss', target);
					move.basePower = 80;
					move.onHit = function (t, s, m) {
						if (!t.volatiles['flinch']) t.addVolatile('flinch');
						let item = t.takeItem();
						if (item) {
							this.add('-enditem', t, item.name, '[from] move: Item Box', '[of] ' + s);
						}
					};
					break;
				case 'spinyshell':
					this.add(`raw|<b>Spiny Shell!</b>`);
					this.add('-anim', source, 'Wish', source);
					target.side.addSideCondition('spinyshell');
					target.side.sideConditions['spinyshell'].effectSource = source;
					this.add('-message', `The spiny shell disappeared into the sky!`);
					return this.NOT_FAIL;
					break;
				case 'triplegreenshell':
					this.add(`raw|<b>Triple Green Shell!</b>`);
					this.add('-anim', source, 'Teeter Dance', source);
					this.add('-anim', source, 'Seed Bomb', target);
					move.basePower = 40;
					move.multihit = 3;
					move.onTryHit = function (t, s, m) {
						if (this.randomChance(1, 10)) {
							m.target = 'self';
						}
					};
					break;
				case 'blooper':
					this.add(`raw|<b>Blooper!</b>`);
					this.add('-anim', source, 'Acid Spray', target);
					move.basePower = 80;
					move.onHit = function (t, s, m) {
						if (!t.volatiles['blooper']) t.addVolatile('blooper');
					};
					break;
				case 'bulletbill':
					this.add(`raw|<b>Bullet Bill!</b>`);
					this.actions.useMove('Bullet Bill', source, target);
					source.addVolatile('bulletbill');
					return this.NOT_FAIL;
					break;
			}
		},
		secondary: null,
		type: "Steel",
		target: 'normal',
	},
	bulletbill: {
		name: "Bullet Bill",
		basePower: 120,
		category: "Physical",
		accuracy: 100,
		gen: 9,
		pp: 10,
		flags: { contact: 1, protect: 1 },
		priority: 4,
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source, move) {
			this.add('-anim', source, 'Explosion', source);
			this.add('-anim', source, 'Extreme Speed', target);
		},
		onHit(target) {
			target.forceSwitchFlag = true;
		},
		condition: {
			duration: 3,
			onStart(pokemon) {
				const oldBase = this.dex.moves.get(pokemon.moveSlots[3].id);
				this.effectState.oldMove = {
					move: oldBase.name,
					id: oldBase.id,
					pp: oldBase.pp,
					maxpp: oldBase.pp,
					target: oldBase.target,
					disabled: false,
					used: false,
					virtual: true,
				};
				const move = this.dex.moves.get('bulletbill');
				let itemBox = pokemon.moves.indexOf('itembox');
				// If for whatever reason, Item Box's Bullet Bill is triggered without having Item Box, it
				// will fill Bullet Bill into the fourth (signature) moveslot where Item Box should be.
				if (!itemBox || itemBox < 0) itemBox = 3;
				pokemon.moveSlots[itemBox] = {
					move: move.name,
					id: move.id,
					pp: move.pp,
					maxpp: move.pp,
					target: move.target,
					disabled: false,
					used: false,
					virtual: true,
				};
			},
			onDisableMove(pokemon) {
				for (const moveSlot of pokemon.moveSlots) {
					if (moveSlot.id !== 'bulletbill') {
						pokemon.disableMove(moveSlot.id);
					}
				}
			},
			onEnd(pokemon) {
				this.boost({ spe: -3 });
				this.add('-message', `${pokemon.name}'s Bullet Bill ran out of gas!`);
				pokemon.moveSlots[3] = this.effectState.oldMove;
			},
		},
		secondary: null,
		type: "Steel",
		target: "normal",
	},
	star: {
		name: "Star",
		basePower: 120,
		category: "Physical",
		accuracy: 100,
		gen: 9,
		pp: 10,
		flags: { contact: 1, protect: 1 },
		priority: 2,
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source, move) {
			this.add('-anim', source, 'Twinkle Tackle', target);
		},
		condition: {
			duration: 3,
			onStart(pokemon) {
				const oldBase = this.dex.moves.get(pokemon.moveSlots[3].id);
				this.effectState.oldMove = {
					move: oldBase.name,
					id: oldBase.id,
					pp: oldBase.pp,
					maxpp: oldBase.pp,
					target: oldBase.target,
					disabled: false,
					used: false,
					virtual: true,
				};
				const move = this.dex.moves.get('star');
				let itemBox = pokemon.moves.indexOf('itembox');
				// If for whatever reason, Item Box's Star is triggered without having Item Box, it
				// will fill Star into the fourth (signature) moveslot where Item Box should be.
				if (!itemBox || itemBox < 0) itemBox = 3;
				pokemon.moveSlots[itemBox] = {
					move: move.name,
					id: move.id,
					pp: move.pp,
					maxpp: move.pp,
					target: move.target,
					disabled: false,
					used: false,
					virtual: true,
				};
			},
			onDamage(damage, target, source, effect) {
				if (damage && effect.effectType === 'Move') {
					this.add('-message', `${target.name}'s Star Power protected it from ${source.name}'s ${effect.name}!`);
					return null;
				}
			},
			onDisableMove(pokemon) {
				for (const moveSlot of pokemon.moveSlots) {
					if (moveSlot.id !== 'star') {
						pokemon.disableMove(moveSlot.id);
					}
				}
			},
			onEnd(pokemon) {
				this.boost({ spe: -3 });
				this.add('-message', `${pokemon.name}'s Star Power wore off!`);
				pokemon.moveSlots[3] = this.effectState.oldMove;
			},
		},
		secondary: null,
		type: "Steel",
		target: "normal",
	},
	// Item Box integration only; not a real move
	blueshell: {
		name: "Blue Shell",
		basePower: 120,
		accuracy: 100,
		gen: 9,
		priority: 0,
		pp: 1,
		flags: {},
		noPPBoosts: true,
		secondary: null,
		category: "Physical",
		type: "Steel",
		target: "normal",
	},
	// Marvin
	emergencymeltdown: {
		name: "Emergency Meltdown",
		basePower: 0,
		category: "Status",
		shortDesc: "User faints. Target cannot move for 2 turns.",
		desc: "User faints. Target cannot move or switch until after the end of next turn.",
		accuracy: true,
		gen: 9,
		pp: 5,
		flags: { bypasssub: 1 },
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source, move) {
			this.add('-anim', source, 'Agility', source);
			this.add('-anim', source, 'V-create', source);
			this.add('-anim', source, 'Explosion', source);
		},
		selfdestruct: 'always',
		volatileStatus: 'emergencymeltdown',
		condition: {
			duration: 2,
			onStart(pokemon) {
				this.add('-anim', pokemon, 'Splash', pokemon);
				this.add('-message', `What?!`);
				this.add('-message', `${this.effectState.source.name} just melted away!`);
				this.add('-message', `${pokemon.name} is in shock!`);
			},
			onBeforeMovePriority: 6,
			onBeforeMove(attacker, defender, move) {
				this.add('cant', attacker, 'Meltdown', move);
				this.add('-message', `${attacker.name} is frozen in shock!`);
				return false;
			},
			onTrapPokemon(pokemon) {
				pokemon.tryTrap();
			},
			onEnd(pokemon) {
				this.add('-message', `${pokemon.name} shook off the meltdown!`);
			},
		},
		secondary: null,
		type: "Fire",
		target: "normal",
	},
	// Saint Deli
	giftoffortune: {
		name: "Gift of Fortune",
		basePower: 75,
		category: "Special",
		shortDesc: "High crit ratio. Random stat boost/volatile.",
		desc: "High critical hit ratio. This Pokemon receives a random stat boost and positive volatile effect.",
		accuracy: 100,
		gen: 9,
		pp: 10,
		priority: 0,
		onModifyPriority(priority, source) {
			if (source.item === 'giftsack' && source.m?.sack?.length) return priority - 1;
		},
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source, move) {
			this.add('-anim', source, 'Sweet Kiss', source);
			this.add('-anim', source, 'Present', target);
		},
		onHit(target, source, move) {
			const effectPool = [
				'miracleeye','aquaring','focusenergy','helpinghand','ingrain','laserfocus',
				'magnetrise','substitute','stockpile','charge','destinybond','dragoncheer','lockon'
			];
			const randomEffect = this.sample(effectPool);
			if (!source.volatiles[randomEffect]) source.addVolatile(randomEffect);
			const stats: BoostID[] = [];
			let stat: BoostID;
			for (stat in source.boosts) {
				if (stat === 'accuracy' || stat === 'evasion') continue;
				if (source.boosts[stat] < 6) stats.push(stat);
			}
			if (stats.length) {
				const randomStat = this.sample(stats);
				const boost: SparseBoostsTable = {};
				boost[randomStat] = 1;
				this.boost(boost, source);
			}
			if (!source.m) source.m = {} as any;
			if (!source.m.sack) source.m.sack = [];
			if (source.m.sack.length) {
				for (const storedMove of source.m.sack) {
					const m = this.dex.moves.get(storedMove);
					if (m?.exists) this.actions.useMove(m.id, source, target);
				}
				source.m.sack = [];
				this.add('-message', `${source.name} emptied its Gift Sack!`);
			}
		},
		critRatio: 2,
		type: "Water",
		target: "normal",
	},
	// Rooci Caxa
	rootreaper: {
		name: "Root Reaper",
		basePower: 80,
		category: "Physical",
		accuracy: 100,
		gen: 9,
		priority: 0,
		flags: { contact: 1, protect: 1, mirror: 1, metronome: 1 },
		desc: "Recovers 75% of damage dealt in HP. 30% chance to inflict the target with ingrain. If Root Reaper KOs the target, until end of next turn, this Pokemon's moves always crit.",
		shortDesc: "+75% damage in HP; 30% Ingrain; Laser Focus if KO.",
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source, move) {
			this.add('-anim', source, 'Horn Leech', target);
			this.add('-anim', source, 'Forest\'s Curse', target);
		},
		onAfterMoveSecondarySelf(pokemon, target, move) {
			if (!target || target.fainted || target.hp <= 0) {
				pokemon.addVolatile('laserfocus');
			}
		},
		pp: 10,
		drain: [3, 4],
		secondary: {
			chance: 30,
			volatileStatus: 'ingrain',
		},
		type: "Grass",
		target: "normal",
	},
	// Tao
	taiji: {
		name: "Taiji",
		shortDesc: "User focuses, then hits last at varying power.",
		desc: "User focuses, then moves last. If the user is not damaged by an attacking move while focusing, this move always results in a critical hit and forces the target to recharge; Otherwise, it hits at halved power.",
		basePower: 80,
		category: "Physical",
		accuracy: true,
		gen: 9,
		priority: -8,
		flags: { contact: 1, protect: 1, punch: 1, failmefirst: 1, nosleeptalk: 1, noassist: 1, failcopycat: 1, failinstruct: 1, metronome: 1 },
		pp: 5,
		breaksProtect: true,
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source, move) {
			this.add('-anim', source, 'Detect', source);
			this.add('-anim', source, 'Force Palm', target);
		},
		priorityChargeCallback(pokemon) {
			pokemon.addVolatile('taiji');
		},
		onModifyMove(move, pokemon) {
			if (!pokemon.volatiles['taiji']?.damaged) {
				this.debug('not hit while focusing; Taiji will crit and force recharge');
				move.willCrit = true;
				move.onHit = function (t, s, m) {
					t.addVolatile('mustrecharge');
				};
			} else {
				this.debug('hit while focusing; Taiji power halved');
				move.basePower = move.basePower / 2;
			}
		},
		condition: {
			duration: 1,
			onStart(pokemon) {
				this.add('-singleturn', pokemon, 'Taiji', '[silent]');
				this.add('-anim', pokemon, 'Laser Focus', pokemon);
				this.add('-message', `${pokemon.name} tightened their focus!`);
			},
			onDamage(damage, target, source, move) {
				if (target !== source && move && move.category !== 'Status') {
					this.effectState.damaged = true;
				}
			},
		},
		secondary: null,
		type: "Fighting",
		target: "normal",
	},
	wuji: {
		name: "Wuji",
		desc: "User focuses, then hits last, causing the target to recharge. Fails if the user is not attacked while charging.",
		shortDesc: "User focuses, then hits last if damaged first.",
		basePower: 80,
		category: "Physical",
		accuracy: true,
		gen: 9,
		priority: -8,
		flags: { contact: 1, protect: 1, failmefirst: 1, nosleeptalk: 1, noassist: 1, failcopycat: 1, failinstruct: 1, metronome: 1 },
		pp: 5,
		willCrit: true,
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source, move) {
			this.add('-anim', source, 'Detect', source);
			this.add('-anim', source, 'Sky Uppercut', target);
		},
		priorityChargeCallback(pokemon) {
			pokemon.addVolatile('wuji');
		},
		beforeMoveCallback(pokemon) {
			if (!pokemon.volatiles['wuji']?.damaged) {
				this.add('cant', pokemon, 'Wuji', 'Wuji');
				return true;
			}
		},
		onHit(target, source, move) {
			target.addVolatile('mustrecharge');
		},
		condition: {
			duration: 1,
			onStart(pokemon) {
				this.add('-singleturn', pokemon, 'Wuji', '[silent]');
				this.add('-anim', pokemon, 'Bulk Up', pokemon);
				this.add('-message', `${pokemon.name} stanced up!`);
			},
			onDamage(damage, target, source, move) {
				if (target !== source && move && move.category !== 'Status') {
					this.effectState.damaged = true;
					return damage / 2;
				}
			},
		},
		secondary: null,
		type: "Fighting",
		target: "normal",
	},
	ziran: {
		name: "Ziran",
		basePower: 80,
		category: "Physical",
		shortDesc: "Move data used for Shangqing.",
		accuracy: true,
		gen: 9,
		priority: 0,
		flags: { contact: 1, protect: 1, failmefirst: 1, nosleeptalk: 1, noassist: 1, failinstruct: 1 },
		pp: 10,
		willCrit: true,
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source, move) {
			this.add('-anim', source, 'Focus Punch', target);
		},
		secondary: null,
		type: "Fighting",
		target: "normal",
	},
	// Mink
	toxicdeluge: {
		name: "Toxic Deluge",
		basePower: 0,
		category: "Status",
		gen: 9,
		priority: 0,
		flags: {},
		accuracy: true,
		pp: 1,
		desc: "Summons Acid Rain for 5 turns, powering up Poison-type moves and poisoning active Pokemon.",
		shortDesc: "Summons Acid Rain for 5 turns.",
		weather: 'acidrain',
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source, move) {
			this.add('-anim', source, 'Barb Barrage', source);
			this.add('-anim', source, 'Acid Downpour', target);
		},
		secondary: null,
		type: "Dark",
		target: "all",
	},
	// Mink
	transfusetoxin: {
		name: "Transfuse Toxin",
		basePower: 0,
		category: "Status",
		gen: 9,
		priority: 0,
		flags: {},
		accuracy: 85,
		pp: 5,
		desc: "Badly poisons the foe, always starting at the fourth stage, regardless of its typing. Replaces existing status conditions.",
		shortDesc: "Very badly poisons the target. Ignores immunities.",
		ignoreImmunity: true,
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source, move) {
			this.add('-anim', source, 'Sludge Wave', target);
			this.add('-anim', source, 'Strength Sap', target);
		},
		onHit(target, source, move) {
			target.setStatus('tox', source, move, true);
		},
		// Stage advancement handled in ../../../conditions.ts
		secondary: null,
		type: "Dark",
		target: "normal",
	},
	// Genus
	starpull: {
		name: "Star Pull",
		basePower: 0,
		category: "Status",
		gen: 9,
		priority: 6,
		flags: {},
		accuracy: true,
		pp: 64,
		noPPBoosts: true,
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source, move) {
			this.add('-anim', source, 'Confuse Ray', source);
		},
		onHit(pokemon) {
			let starPool = [
				1, 1, 1, 1, 1, // 33.3%
				2, 2, 2, 2, // 26.6%
				3, 3, 3, // 20.0%
				4, 4, // 13.3%
				5 // 6.6%
			];
			let pullPool = [];
			let highRoll = 0;
			for (let i = 0; i < 10; i++) {
				switch (this.sample(starPool)) {
					case 1:
						pullPool.push(this.sample(Dex.species.all().filter(p => !pullPool.includes(p) && !p.isNonstandard && p.bst <= 200)));
						if (highRoll < 1) highRoll = 1;
						break;
					case 2:
						pullPool.push(this.sample(Dex.species.all().filter(p => !pullPool.includes(p) && !p.isNonstandard && p.bst <= 300 && p.bst >= 201)));
						if (highRoll < 2) highRoll = 2;
						break;
					case 3:
						pullPool.push(this.sample(Dex.species.all().filter(p => !pullPool.includes(p) && !p.isNonstandard && p.bst <= 400 && p.bst >= 301)));
						if (highRoll < 3) highRoll = 3;
						break;
					case 4:
						pullPool.push(this.sample(Dex.species.all().filter(p => !pullPool.includes(p) && !p.isNonstandard && p.bst <= 500 && p.bst >= 401)));
						if (highRoll < 4) highRoll = 4;
						break;
					case 5:
						pullPool.push(this.sample(Dex.species.all().filter(p => !pullPool.includes(p) && !p.isNonstandard && p.bst <= 600 && p.bst >= 501)));
						if (highRoll < 5) highRoll = 5;
						break;
				}
			}
			if (!pullPool || !pullPool.length) return false;
			pullPool.sort((a, b) => a.bst - b.bst);
			for (const pulledPokemon of pullPool) {
				pokemon.formeChange(pulledPokemon);
			}
			this.add('-message', `${highRoll}-Star Pull!`);
			this.add('-message', `${pokemon.name} transformed into ${pokemon.species.name}!`);
		},
		secondary: null,
		type: "???",
		target: "self",
	},
	// Morax
	planetbefall: {
		accuracy: true,
		basePower: 250,
		category: "Physical",
		name: "Planet Befall",
		gen: 9,
		pp: 1,
		isZ: 'hadeansoil',
		priority: 0,
		flags: {},
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source, move) {
			this.add('-anim', source, 'Draco Meteor', target);
			this.add('-anim', source, 'Continental Crush', target);
		},
		volatileStatus: 'planetbefall',
		onHit(target, source, move) {
			const sourceSide = source.side;
			sourceSide.addSideCondition('jadeshield');
		},
		condition: {
			onStart(pokemon) {
				this.add('-start', pokemon, 'Planet Befall', '[silent]');
				this.add('-message', `${pokemon.name} was petrified!`);
				if (!pokemon.hasType('Rock') && pokemon.addType('Rock')) this.add('-start', pokemon, 'typeadd', 'Rock', '[from] move: Planet Befall');
			},
			onResidual(pokemon) {
				this.add('-message', `${pokemon.name} is petrified!`);
			},
			onBeforeMovePriority: 2,
			onBeforeMove(pokemon, target, move) {
				this.add('-message', `${pokemon.name} couldn't move!`);
				return false;
			},
			onDamagingHit(damage, target, source, move) {
				if (target === source || !move || move.id === 'planetbefall') return;
				target.removeVolatile('planetbefall');
			},
			onEnd(pokemon) {
				this.add('-end', pokemon, 'Planet Befall', '[silent]');
				this.add('-message', `${pokemon.name} snapped out of it!`);
			},
		},
		secondary: null,
		target: "normal",
		type: "Rock",
	},
	dominuslapidis: {
		accuracy: true,
		basePower: 0,
		category: "Status",
		name: "Dominus Lapidis",
		shortDesc: "Summons Jade Shield. Always goes last.",
		desc: "User focuses, then summons Jade Shield for 5 turns after the opponent moves.",
		gen: 9,
		pp: 5,
		priority: -8,
		flags: {},
		sideCondition: 'jadeshield',
		beforeTurnCallback(pokemon) {
			this.add('-anim', pokemon, 'Mean Look', pokemon);
			this.add('-message', `${pokemon.name} tightened its focus!`);
		},
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source, move) {
			this.add('-anim', source, 'Bulk Up', source);
			this.add('-anim', source, 'Aqua Ring', source);
		},
		secondary: null,
		target: "allySide",
		type: "Ground",
	},
	// Morax
	// Visuals Only
	jadeshield: {
		accuracy: true,
		basePower: 0,
		category: "Status",
		name: "Jade Shield",
		shortDesc: "Summons Jade Shield. Always goes last.",
		desc: "User focuses, then summons Jade Shield for 5 turns after the opponent moves.",
		gen: 9,
		pp: 5,
		priority: -8,
		flags: {},
		sideCondition: 'jadeshield',
		condition: {
			onSideStart(side, source) {
				this.add('-sidestart', side, 'Jade Shield', source);
				this.effectState.hp = Math.floor(source.maxhp * 0.33);
			},
			onResidual(pokemon) {
				this.add('-anim', pokemon, 'Aqua Ring', pokemon);
			},
			onTryPrimaryHit(target, source, move) {
				// @ts-ignore
				let originalDamage = this.actions.getDamage(source, target, move);
				if (target === source || move.infiltrates || move.category === 'Status') return;
				if (!this.dex.getImmunity(move.type, 'Ground')) {
					this.add('-immune', target);
					return null;
				} else {
					move.onEffectiveness = function () {
						return this.dex.getEffectiveness(move.type, 'Ground');
					};
				}
				// @ts-ignore
				let damage = this.actions.getDamage(source, target, move);
				if (!damage && damage !== 0) {
					this.add('-fail', source);
					this.attrLastMove('[still]');
					return null;
				}
				damage = this.runEvent('SubDamage', target, source, move, damage);
				if (!damage) return damage;
				if (damage > target.side.sideConditions['jadeshield'].hp) {
					originalDamage -= target.side.sideConditions['jadeshield'].hp as number;
					target.side.sideConditions['jadeshield'].hp = 0;
					this.damage(originalDamage, target, source, move);
				} else {
					target.side.sideConditions['jadeshield'].hp -= damage;
				}
				source.lastDamage = damage;
				if (target.side.sideConditions['jadeshield'].hp <= 0) {
					if (move.ohko) this.add('-ohko');
					target.side.removeSideCondition('jadeshield');
				} else {
					this.add('-activate', target, 'move: Jade Shield', '[damage]');
				}
				if (move.recoil || move.id === 'chloroblast') this.damage(this.actions.calcRecoilDamage(damage, move, source), source, target, 'recoil');
				if (move.drain) this.heal(Math.ceil(damage * move.drain[0] / move.drain[1]), source, target, 'drain');
				let resSource = target.side.pokemon.filter(ally => ally.name === 'Morax')[0];
				if (resSource) {
					const resWave = {
						move: 'Mud-Slap',
						id: 'mudslap',
						basePower: 40,
						pp: 10,
						maxpp: 25,
						target: 'normal',
						disabled: false,
						used: false,
					};
					// @ts-ignore
					let resDamage = this.actions.getDamage(resSource, source, resWave);
					if (resDamage) {
						this.add('-anim', target, 'Power Gem', source);
						this.damage(resDamage, source, resSource, this.effect);
					}
				}
				return this.HIT_SUBSTITUTE;
			},
			onSideEnd(side) {
				this.add('-sideend', side, 'Jade Shield');
			},
		},
		secondary: null,
		target: "allySide",
		type: "Ground",
	},
	// Varnava
	ecosystemdrain: {
		accuracy: true,
		basePower: 0,
		category: "Status",
		name: "Ecosystem Drain",
		shortDesc: "Heals; Boosts power next turn; Grassy Terrain.",
		desc: "Heals the user, and boosts the power of the user's attacks next turn, by an amount dependent on the current Zygarde form. Complete: 25% Heal/Boost; 50%: 50% Heal/Boost; 10%: 25% Heal/Boost. Clears any active weather conditions, if present, and sets Grassy Terrain.",
		gen: 9,
		pp: 5,
		priority: 0,
		flags: { reflectable: 1, mirror: 1, protect: 1 },
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source, move) {
			this.add('-anim', source, 'Rototiller', source);
			this.add('-anim', source, 'Geomancy', source);
		},
		onHit(pokemon) {
			switch (pokemon.species.id) {
				case 'zygardecomplete':
					this.heal(pokemon.maxhp / 4, pokemon);
					pokemon.m.boostMod = 1.25;
					break;
				case 'zygarde':
					this.heal(pokemon.maxhp / 2, pokemon);
					pokemon.m.boostMod = 1.5;
					break;
				case 'zygarde10':
					this.heal(pokemon.maxhp * 0.75);
					pokemon.m.boostMod = 1.75;
					break;
			}
			this.field.clearWeather();
			this.field.setTerrain('grassyterrain');
		},
		volatileStatus: 'ecosystemdrain',
		condition: {
			duration: 2,
			onBasePower(basePower, source, target, move) {
				if (source.m.boostMod && source.m.boostMod > 1) {
					this.add('-anim', source, 'Absorb', source);
					this.add('-message', `${move.name} was powered up by Ecosystem Drain!`)
					return this.chainModify(boostMod);
				}
			},
			onAfterMove(pokemon) {
				pokemon.m.boostMod = false;
				pokemon.removeVolatile('ecosystemdrain');
			},
			onEnd(pokemon) {
				if (pokemon.m.boostMod) pokemon.m.boostMod = false;
			},
		},
		secondary: null,
		target: "self",
		type: "Grass",
	},
	southernislandslastdefense: {
		accuracy: true,
		basePower: 300,
		category: "Physical",
		name: "Southern Island's Last Defense",
		shortDesc: "See '/ssb Varnava' for more!",
		desc: "Fails if user has any remaining healthy allies, or if user has more than 1/4 of its max HP remaining. Transforms into Zygarde-Complete before attacking. Ignores weaknesses and resistances. Damage is calculated using the lower of the opposing Pokemon's two defense stats. If the opposing Pokemon is not knocked out by this attack, the user faints after damage is dealt. If the opposing Pokemon is knocked out by this attack, starts Endure lasting until the end of next turn.",
		gen: 9,
		pp: 1,
		priority: 6,
		flags: { bypasssub: 1 },
		ignoreImmunity: true,
		breaksProtect: true,
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source, move) {
			const remainingPokemon = source.side.pokemon.filter(pokemon => !pokemon.fainted);
			if (remainingPokemon.length > 1 || source.hp > source.maxhp / 4) return false;
			source.formeChange('Zygarde-Complete');
			this.add('-anim', source, 'Core Enforcer', target);
			this.add('-anim', source, 'Supersonic Skystrike', target);
		},
		onEffectiveness(typeMod, target, type) {
			return 0;
		},
		onAfterMove(pokemon, target, move) {
			if (!target.side.faintedThisTurn) {
				pokemon.faint();
				return;
			} else if (target.side.faintedThisTurn) {
				if (!pokemon.volatiles['endure']) pokemon.addVolatile('endure');
				pokemon.volatiles['endure'].duration = 2;
			}
		},
		secondary: null,
		target: "normal",
		type: "Dragon",
	},
	// Aevum
	genesisray: {
		accuracy: 100,
		basePower: 60,
		category: "Special",
		name: "Genesis Ray",
		desc: "After hitting, encases the target for 2 turns (cannot stack). If the encased Pokemon uses a contact move or switches out, Genesis Ray triggers for a second hit at double the original damage, then ends.",
		shortDesc: "Encases target; contact or switching triggers 2x damage hit.",
		gen: 9,
		pp: 10,
		priority: 0,
		flags: {mirror: 1, protect: 1},
		type: "Steel",
		target: "normal",
		secondary: null,
		volatileStatus: 'genesisray',
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Terrain Pulse', target);
		},
		onTryHit(target) {
			if (target.volatiles['genesisray']) {
				this.add('-message', `${target.name} is already encased by Genesis Ray!`);
				return null;
			}
		},
		onHit(target) {
			this.add('-message', `${target.name} was encased by Genesis Ray!`);
		},
		condition: {
			duration: 2,
			onStart(pokemon, source) {
				(this.effectState as any).source = source;
				(this.effectState as any).triggered = false;
			},
			// Detonate BEFORE the encased mon uses a contact move
			onBeforeMove(pokemon, target, move) {
				if (!move?.flags?.contact) return;
				const es: any = this.effectState;
				if (es.triggered) return;
				es.triggered = true;
				const src: Pokemon | undefined = es.source;
				const blastMove: any = {
					id: 'genesisrayblast',
					name: 'Genesis Ray',
					accuracy: true,
					basePower: 120,
					category: 'Special',
					priority: 0,
					flags: {protect: 1, mirror: 1},
					type: 'Steel',
					effectType: 'Move',
				};
				this.add('-anim', src || pokemon, 'Terrain Pulse', pokemon);
				const dmg = (this as any).getDamage
					? (this as any).getDamage(src || pokemon, pokemon, blastMove)
					: (this.actions as any).getDamage(src || pokemon, pokemon, blastMove);
				if (dmg) this.damage(dmg, pokemon, src, blastMove);
				this.add('-message', `${pokemon.name} was assaulted by Genesis Ray!`);
				pokemon.removeVolatile('genesisray');
			},
			// Detonate when the encased mon switches out (including most forced-switch flows)
			onSwitchOut(pokemon) {
				const es: any = this.effectState;
				if (es.triggered) return;
				es.triggered = true;
				const src: Pokemon | undefined = es.source;
				const blastMove: any = {
					id: 'genesisrayblast',
					name: 'Genesis Ray',
					accuracy: true,
					basePower: 120,
					category: 'Special',
					priority: 0,
					flags: {protect: 1, mirror: 1},
					type: 'Steel',
					effectType: 'Move',
				};
				this.add('-anim', src || pokemon, 'Terrain Pulse', pokemon);
				const dmg = (this as any).getDamage
					? (this as any).getDamage(src || pokemon, pokemon, blastMove)
					: (this.actions as any).getDamage(src || pokemon, pokemon, blastMove);
				if (dmg) this.damage(dmg, pokemon, src, blastMove);
				this.add('-message', `${pokemon.name} was assaulted by Genesis Ray!`);
				pokemon.removeVolatile('genesisray');
			},
		},
	},
	// Aevum
	temporalterrain: {
		accuracy: true,
		basePower: 0,
		category: "Status",
		name: "Temporal Terrain",
		desc: "Traps all Pokemon. Forces all Pokemon to switch upon ending. Roar of Time immediately ends the terrain.",
		shortDesc: "Traps; forces all to switch on-end. Roar of Time ends it early.",
		pp: 10,
		priority: 0,
		flags: {nonsky: 1, metronome: 1},
		terrain: 'temporalterrain',
		condition: {
			duration: 5,
			durationCallback(source, effect) {
				if (source?.hasItem('terrainextender')) return 8;
				return 5;
			},
			onFieldStart(field, source, effect) {
				if (effect?.effectType === 'Ability') {
					this.add('-fieldstart', 'move: Temporal Terrain', '[from] ability: ' + effect.name, '[of] ' + source);
				} else {
					this.add('-fieldstart', 'move: Temporal Terrain');
				}
			},
			// Roar of Time ends the terrain immediately (and forces all actives to switch once)
			onHit(target, source, move) {
				if (!move || move.id !== 'roaroftime') return;
				this.effectState.rotHit = true;
				for (const p of this.getAllActive()) {
					p.forceSwitchFlag = true;
				}
				this.add('-activate', source, 'move: Temporal Terrain');
				this.add('-message', `Roar of Time shattered the Temporal Terrain!`);
				// end terrain NOW
				if ((this.field as any).clearTerrain) {
					(this.field as any).clearTerrain();
				} else {
					this.field.setTerrain('');
				}
			},
			onTrapPokemon() {
				for (const pokemon of this.getAllActive()) {
					pokemon.tryTrap();
				}
			},
			onFieldResidualOrder: 27,
			onFieldResidualSubOrder: 7,
			onFieldEnd() {
				this.add('-fieldend', 'move: Temporal Terrain', '[silent]');
				if (!this.effectState.rotHit) {
					for (const pokemon of this.getAllActive()) {
						pokemon.forceSwitchFlag = true;
					}
				}
			},
		},
		secondary: null,
		target: "all",
		type: "Psychic",
	},
	// Ace - Attack Card
	attack: {
		accuracy: 100,
		basePower: 30,
		category: "Physical",
		name: "Attack",
		gen: 9,
		pp: 5,
		priority: 0,
		flags: { protect: 1 },
		secondary: null,
		target: "normal",
		type: "???",
	},
	// Suika Ibuki
	demi: {
		accuracy: 100,
		basePower: 75,
		category: "Physical",
		desc: "Infiltrates and forces foe to use Substitue.",
		shortDesc: "Infiltrates and substitutes foe.",
		name: "Demi",
		gen: 9,
		pp: 5,
		priority: 0,
		flags: { bypasssub: 1, mirror: 1, protect: 1 },
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source, move) {
			this.add('-anim', source, 'Shadow Ball', target);
		},
		onHit(target, source, move) {
			if (!target.volatiles['substitute'] && target.hp > target.maxhp / 4) {
				this.directDamage(target.maxhp / 4, target);
				target.addVolatile('substitute');
			}
		},
		secondary: null,
		target: "normal",
		type: "Rock",
	},
	// Journeyman
	newbeginnings: {
		accuracy: true,
		basePower: 0,
		category: "Status",
		desc: "User fully restores HP, status conditions, and the PP of it's moves, loses all moves and items obtained through Love of the Journey, and switches to an ally of choice. 30% chance to fail. Usually goes last.",
		shortDesc: "Restores HP/Status/PP, loses moves/items, switches.",
		name: "New Beginnings",
		pp: 1,
		noPPBoosts: true,
		priority: -1,
		flags: {},
		onTryHit() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Synthesis', source);
			this.add('-anim', source, 'Celebrate', source);
		},
		onHit(target, source, move) {
			if (this.randomChance(7, 10)) {
				this.add(`raw|It is never too late for <b>New Beginnings</b>!<br>Good luck, ${source.name}!`);
				this.heal(source.maxhp, source);
				source.cureStatus();
				for (const moveSlot of source.moveSlots) {
					let moveid = moveSlot.id;
					if (source.moves.indexOf(moveid) > 3) {
						this.add('-message', `${source.name} forgot ${moveSlot.move}!`);
						delete source.moveSlots[source.moves.indexOf(moveid)];
						delete source.baseMoveSlots[source.moves.indexOf(moveid)];
						delete source.moves[moveid];
					} else {
						moveSlot.pp = moveSlot.maxpp;
					}
				}
				if (source.item === 'colossuscarrier') source.m.carrierItems = [];
			} else {
				this.add('-anim', source, 'Wake-Up Slap', source);
				const ally = this.sample(source.side.pokemon);
				if (ally === source) {
					this.add('-message', `${source.name} found the motivation to keep going!`);
				} else {
					this.add('-message', `Wait! ${ally.name} encouraged ${source.name} to keep fighting!`);
				}
				this.add('-anim', source, 'Work Up', source);
				source.hp += source.hp / 3;
				this.boost({ spe: 1 }, source);
				this.add('-message', `That's the spirit, ${source.name}!`);
				move.selfSwitch = false;
			}
		},
		selfSwitch: true,
		secondary: null,
		target: "self",
		type: "Grass",
	},
	// Sakuya Izayoi
	misdirection: {
		accuracy: true,
		basePower: 0,
		category: "Status",
		desc: "Existing future moves are redirected towards foe and land immediately. User switches afterwards.",
		shortDesc: "Redirects future moves to foe. User switches.",
		name: "Misdirection",
		pp: 1,
		priority: -5,
		flags: {},
		onTryHit() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Floral Healing', source);
			this.add('-anim', source, 'Future Sight', source);
		},
		onHit(pokemon) {
			let success = false;
			const target = pokemon.side.foe.active[pokemon.side.foe.active.length - 1 - pokemon.position];
			for (const activePokemon of this.getAllActive()) {
				if (!activePokemon.side.slotConditions[activePokemon.position]['futuremove']) continue;
				const move = this.dex.getActiveMove(activePokemon.side.slotConditions[activePokemon.position]['futuremove'].move);
				// @ts-ignore
				const dmg = this.actions.getDamage(pokemon, activePokemon, move);
				delete activePokemon.side.slotConditions[activePokemon.position]['futuremove'];
				if (move === 'doomdesire') {
					this.add('-anim', activePokemon, 'Steel Beam', target);
				} else {
					this.add('-anim', activePokemon, move.name, target);
				}
				this.damage(dmg, target, pokemon, move);
				success = true;
			}
			if (success) this.add('-message', `${target.name} was assaulted with all active future moves!`);
		},
		secondary: null,
		target: "self",
		type: "Psychic",
	},
	// Sakuya Izayoi
	killingdoll: {
		accuracy: true,
		basePower: 0,
		category: "Status",
		desc: "User creates a substitute that disappears at the end of turn. Any damage it takes is dealt back to the foe.",
		shortDesc: "Creates a 1-turn substitute that damages the foe.",
		name: "Killing Doll",
		pp: 8,
		noPPBoosts: true,
		priority: 0,
		flags: { snatch: 1 },
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Hex', target);
		},
		onHit(target, source, move) {
			this.directDamage(target.maxhp / 4, target);
		},
		onTryHit(source) {
			if (source.volatiles['killingdoll']) {
				this.add('-fail', source, 'move: Killing Doll');
				return this.NOT_FAIL;
			}
			if (source.hp <= source.maxhp / 4 || source.maxhp === 1) {
				this.add('-fail', source, 'move: Killing Doll', '[weak]');
				return this.NOT_FAIL;
			}
		},
		volatileStatus: 'killingdoll',
		condition: {
			duration: 1,
			onStart(pokemon) {
				pokemon.m.dollhp = Math.floor(pokemon.maxhp / 4);
				this.add('-message', `${pokemon.name} summoned a Killing Doll!`);
				if (pokemon.volatiles['partiallytrapped']) {
					this.add('-end', pokemon, pokemon.volatiles['partiallytrapped'].sourceEffect, '[partiallytrapped]', '[silent]');
					delete pokemon.volatiles['partiallytrapped'];
				}
			},
			onTryPrimaryHitPriority: -1,
			onTryPrimaryHit(target, source, move) {
				if (target === source || move.flags['bypasssub'] || move.infiltrates || move.flags['futuremove']) {
					return;
				}
				// @ts-ignore
				let damage = this.actions.getDamage(source, target, move);
				if (!damage) {
					this.add('-fail', source);
					this.attrLastMove('[still]');
					return null;
				}
				this.add('-anim', target, 'Spectral Thief', source);
				this.damage(damage, source, target, 'move: Killing Doll');
				if (damage > target.m.dollhp) {
					damage = target.m.dollhp as number;
				}
				target.m.dollhp -= damage;
				source.lastDamage = damage;
				if (target.m.dollhp <= 0) {
					if (move.ohko) this.add('-ohko');
					target.removeVolatile('killingdoll');
					target.m.dollhp = 0;
				} else {
					this.add('-activate', target, 'move: Killing Doll', '[damage]');
				}
				if (move.recoil || move.id === 'chloroblast') {
					this.damage(this.actions.calcRecoilDamage(damage, move, source), source, target, 'recoil');
				}
				if (move.drain) {
					this.heal(0, source, target, 'drain');
				}
				return this.HIT_SUBSTITUTE;
			},
			onResidual(pokemon) {
				if (pokemon.m.dollhp > 0) {
					this.add('-anim', pokemon, 'Hex', pokemon);
					this.add('-message', `Killing Doll haunts the battlefield!`);
				} else if (!pokemon.m.dollhp || pokemon.m.dollhp <= 0) {
					this.add('-end', pokemon, 'Killing Doll', '[silent]');
					pokemon.removeVolatile('killingdoll');
					this.add('-anim', pokemon, 'Confuse Ray', pokemon);
					this.add('-message', `The Killing Doll vanished!`);
				}
			},
			onEnd(target) {
				this.add('-end', target, 'Killing Doll', '[silent]');
				this.add('-anim', target, 'Confuse Ray', target);
				this.add('-message', `The Killing Doll vanished!`);
			},
		},
		secondary: null,
		target: "self",
		type: "Dark",
	},
	// Emerl
	awakenedmode: {
		accuracy: true,
		basePower: 0,
		category: "Status",
		desc: "User fully restores HP and status conditions, starts Ingrain, and raises all stats by 1 stage (except acc/eva). User's item is replaced with Leftovers. This move is replaced with Gigaton Hammer. If this Pokemon learns U-turn, it is replaced with Bug Buzz.",
		shortDesc: "100% HP; Ingrain; +1 Stats; Leftovers/Gigaton Hammer/Bug Buzz.",
		name: "Awakened Mode",
		pp: 1,
		noPPBoosts: true,
		priority: 0,
		flags: { heal: 1 },
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Extreme Evoboost', target);
		},
		onHit(pokemon) {
			this.heal(pokemon.maxhp);
			pokemon.cureStatus();
			pokemon.setItem('Leftovers');
			const AMIndex = pokemon.moves.indexOf('awakenedmode');
			const UTIndex = pokemon.moves.indexOf('uturn');
			const GT = this.dex.moves.get('gigatonhammer');
			const GTF = {
				move: GT.name,
				id: GT.id,
				pp: GT.pp,
				maxpp: GT.pp,
				target: GT.target,
				disabled: false,
				used: false,
			};
			const BB = this.dex.moves.get('bugbuzz');
			const BBF = {
				move: BB.name,
				id: BB.id,
				pp: BB.pp,
				maxpp: BB.pp,
				target: BB.target,
				disabled: false,
				used: false,
			};
			pokemon.moveSlots[AMIndex] = GTF;
			pokemon.moveSlots[UTIndex] = BBF;
		},
		volatileStatus: 'ingrain',
		boosts: {
			atk: 1,
			def: 1,
			spa: 1,
			spd: 1,
			spe: 1,
		},
		secondary: null,
		target: "self",
		type: "Steel",
	},
	// Zeeb
	superknuckleshuffle: {
		accuracy: 90,
		basePower: 10,
		category: "Physical",
		name: "Super-Knuckle Shuffle",
		pp: 24,
		noPPBoosts: true,
		priority: 0,
		flags: { protect: 1, contact: 1 },
		secondary: null,
		multihit: [3, 4],
		target: "normal",
		type: "Normal",
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source, move) {
			this.add('-anim', source, 'Celebrate', source);
			this.add('-anim', source, 'Geomancy', source);
		},
		basePowerCallback(pokemon, target, move) {
			let power;
			switch (move.hit) {
				case 1:
					power = 10;
					this.add('-anim', pokemon, 'Body Slam', target);
					break;
				case 2:
					power = 20;
					this.add('-anim', pokemon, 'Rock Tomb', pokemon);
					this.add('-anim', pokemon, 'Accelerock', target);
					break;
				case 3:
					power = 40;
					this.add('-anim', pokemon, 'Shift Gear', pokemon);
					this.add('-anim', pokemon, 'Steel Wing', target);
					break;
				case 4:
					power = 80;
					this.add('-anim', pokemon, 'Eruption', pokemon);
					this.add('-anim', pokemon, 'Blaze Kick', target);
					break;
			}
			return power;
		},
		onHit(target, source, move) {
			if (this.randomChance(1, 10)) source.addVolatile('confusion');
		},
		onEffectiveness(typeMod, target, type, move) {
			let typing;
			switch (move.hit) {
				case 1:
					typing = 'Normal';
					break;
				case 2:
					typing = 'Rock';
					break;
				case 3:
					typing = 'Steel';
					break;
				case 4:
					typing = 'Fire';
					break;
			}
			if (typing && typing !== 'Normal') return typeMod + this.dex.getEffectiveness(typing, type);
		},
	},
	// Shifu Robot
	turbocharge: {
		accuracy: true,
		basePower: 0,
		category: "Status",
		name: "Turbocharge",
		pp: 1,
		noPPBoosts: true,
		priority: 6,
		flags: {},
		secondary: null,
		target: "self",
		type: "Electric",
		volatileStatus: 'turbocharge',
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Thunder', source);
			this.add('-anim', source, 'Agility', source);
		},
		onHit(pokemon) {

			const loss = pokemon.hp - 1;
			const max = pokemon.baseMaxhp / 10;

			let stacks = Math.floor(loss/max)
			if (stacks < 1) stacks = 1;
			if (stacks > 9) stacks = 9;
			pokemon.m.stacks = stacks;

			pokemon.addVolatile('protect');
			pokemon.addVolatile('turbocharge');
			this.damage(loss, pokemon);
			this.add('-message', `Level ${stacks} Turbocharge!`);
			// Permanent disabling of Auto-Repair handled in ../config.ts
		},
		condition: {
			duration: 9,
			onStart() {
				this.effectState.turnUsed = this.turn;
			},
			onModifyAtkPriority: 5,
			onModifyAtk(atk, pokemon) {
				if (pokemon.m.stacks <= 0) return;
				let boost = 1 + 0.1 * pokemon.m.stacks;
				return this.chainModify(boost);
			},
			onModifySpAPriority: 5,
			onModifySpA(spa, pokemon) {
				if (pokemon.m.stacks <= 0) return;
				let boost = 1 + 0.1 * pokemon.m.stacks;
				return this.chainModify(boost);
			},
			onModifySpe(spe, pokemon) {
				if (pokemon.m.stacks <= 0) return;
				let boost = 1 + 0.1 * pokemon.m.stacks;
				return this.chainModify(boost);
			},
			onTryHeal(damage, target, source, effect) {
				if ((effect?.id === 'zpower') || this.effectState.isZ) return damage;
				return false;
			},
			onResidual(pokemon) {
				// Prevent charge from wearing off immediately after Turbocharge is used
				// It should start at X stacks and should not begin to deplete until one
				// full turn cycle has passed.
				if (this.effectState.turnUsed !== this.turn) pokemon.m.stacks--;
				if (pokemon.m.stacks <= 0) {
					pokemon.m.stacks = 0;
					this.add('-message', `${pokemon.name}'s turbocharge wore off!`);
					pokemon.removeVolatile('turbocharge');
					return;
				}
				this.add('-anim', pokemon, 'Discharge', pokemon);
				this.add('-message', `${pokemon.name} is turbocharged!`);
			},
			onSwitchOut(pokemon) {
				pokemon.m.stacks = 0;
				pokemon.removeVolatile('turbocharge');
			},
		},
	},
	// Luminous
	rainbowmaxifier: {
		accuracy: 85,
		basePower: 80,
		category: "Special",
		name: "Rainbow Maxifier",
		shortDesc: "Water: +Fire-type; Light-type if transformed. Starts Rainbow.",
		desc: "If this move is Water-type, Fire-type is added to its type effectiveness. If used by Necrozma-Ultra, this move becomes Light-type instead. Starts a rainbow on the user's side upon hitting. 30% chance to burn. 30% chance to reduce the target's Attack and Special Attack by 1 stage.",
		pp: 16,
		noPPBoosts: true,
		priority: 0,
		flags: { protect: 1 },
		drain: [1, 2],
		secondaries: [
			{
				chance: 30,
				status: 'brn',
			}, {
				chance: 30,
				boosts: {
					atk: -1,
					spa: -1,
				},
			},
		],
		target: "normal",
		type: "Water",
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Tri Attack', target);
			this.add('-anim', source, 'Aurora Beam', target);
		},
		onModifyType(move, pokemon) {
			if (pokemon.species.id === 'necrozmaultra') {
				move.type = 'Light';
			} else {
				move.type = 'Water';
			}
		},
		onEffectiveness(typeMod, target, type, move) {
			return typeMod + this.dex.getEffectiveness('Fire', type);
		},
		onHit(target, source, move) {
			source.side.addSideCondition('waterpledge');
		},
	},
	// Luminous
	polaris: {
		accuracy: true,
		basePower: 170,
		category: "Special",
		name: "Polaris",
		pp: 1,
		isZ: "spectralprism",
		priority: 0,
		flags: { protect: 1, bypasssub: 1 },
		status: 'brn',
		target: "normal",
		type: "Light",
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Light That Burns the Sky', target);
			this.add('-anim', source, 'Flash', target);
		},
		onAfterMove(pokemon, target, move) {
			if (pokemon.species.id === 'necrozma') changeSet(this, pokemon, ssbSets['Luminous-N'], true);
			pokemon.setAbility('blindinglight');
			this.add('-anim', pokemon, 'Flash', pokemon);
			for (const targetPokemon of this.getAllActive()) {
				if (pokemon === targetPokemon) continue;
				targetPokemon.addVolatile('blindinglight');
			}
		},
	},
	// Fblthp
	bouncybubble: {
		inherit: true,
		basePower: 90,
	},
	// Fblthp
	blowandgo: {
		accuracy: 100,
		basePower: 0,
		category: "Status",
		name: "Blow and Go",
		desc: "Lowers target's Atk, Sp. Atk by 1, starts Aqua Ring on the target, changes the target's type to Water, then user switches to an ally of choice.",
		shortDesc: "Parting Shot + Soak; Starts Aqua Ring on target.",
		pp: 5,
		priority: 1,
		flags: { reflectable: 1, mirror: 1, protect: 1 },
		selfSwitch: true,
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Bubble Beam', target);
			this.add('-anim', source, 'Dive', source);
		},
		onHit(target, source, move) {
			this.boost({ atk: -1, spa: -1 }, target, source, this.effect);
			if (target.setType('Water')) this.add('-start', target, 'typechange', 'Water');
			target.addVolatile('aquaring');
		},
		secondary: null,
		target: "normal",
		type: "Water",
	},
	// Faust
	thehousealwayswins: {
		name: "The House Always Wins",
		category: "Physical",
		basePower: 60,
		accuracy: 100,
		pp: 1,
		priority: 1,
		flags: { bypasssub: 1 },
		target: "normal",
		type: "Dark",
		isZ: "crossroadsblues",
		stealsBoosts: true,
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Spectral Thief', source);
		},
		basePowerCallback(pokemon, target, move) {
			const bp = move.basePower + (20 * pokemon.positiveBoosts());
			this.debug('BP: ' + bp);
			return bp;
		},
		onHit(target, source, move) {
			source.clearBoosts();
			source.m.wagerStacks = 0;
			this.heal(source.baseMaxhp, source);
			changeSet(this, source, ssbSets['Croupier'], true);
		},
	},
	// Faust
	faustianbargain: {
		name: "Faustian Bargain",
		category: "Status",
		accuracy: 100,
		basePower: 0,
		pp: 8,
		noPPBoosts: true,
		priority: 1,
		flags: { protect: 1, reflectable: 1, mirror: 1 },
		target: "normal",
		type: "Dark",
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Hex', source);
			this.add('-anim', source, 'Coaching', source);
		},
		onHit(target, source, move) {

			let stat: BoostID;
			const myRoll = this.random(3, 18);
			const yourRoll = this.random(2, 12);
			this.add('-message', `${source.name} rolled a ${myRoll}!`);
			this.add('-message', `${target.name} rolled a ${yourRoll}!`);

			for (stat in source.boosts) {
				if (stat === 'accuracy' || stat === 'evasion') continue;
				if (source.boosts[stat] <= 0) {
					let boost: SparseBoostsTable = {};
					boost[stat] = 1 - source.boosts[stat];
					this.boost(boost, source);
				}
			}

			if (myRoll > yourRoll) {
				for (stat in source.boosts) {
					if (source.boosts[stat] > 0) {
						let boost: SparseBoostsTable = {};
						boost[stat] = source.boosts[stat];
						this.boost(boost, source);
					}
				}
				this.damage(target.hp / 2, target);

			} else {
				for (stat in source.boosts) {
					if (source.boosts[stat] > 0) {
						let boost: SparseBoostsTable = {};
						boost[stat] = source.boosts[stat];
						this.boost(boost, target);
					}
				}
				source.clearBoosts();
				this.add('-copyboost', target, source, '[from] move: Faustian Bargain');
			}
		},
	},
	// Faust
	kniffel: {
		name: "Kniffel",
		category: "Physical",
		accuracy: 100,
		basePower: 40,
		pp: 64,
		noPPBoosts: true,
		priority: 0,
		flags: { protect: 1 },
		target: "normal",
		type: "Dark",
		ignoreImmunity: true,
		ignoreDefensive: true,
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Coaching', source);
		},
		onModifyMove(move, pokemon) {
			let rollCount = 0;
			for (let total = 0; total < 6; total++) {
				total--;
				let roll = this.random(1, 6);
				this.add('-anim', pokemon, 'Wish', pokemon);
				this.add('-message', `${source.name} rolled a ${roll}!`);
				total += roll;
				rollCount++;
			}
			move.multihit = rollCount;
		},
		onEffectiveness() {
			return 0;
		},
	},
	// Croupier
	allin: {
		name: "All In",
		category: "Special",
		accuracy: 100,
		basePower: 1,
		pp: 1,
		priority: 0,
		flags: {},
		target: "normal",
		type: "Ghost",
		isZ: "staufensdie",
		onTryMove() {
			this.attrLastMove('[still]');
		},
		basePowerCallback(pokemon, target, move) {
			this.add('-anim', pokemon, 'Celebrate', pokemon);
			this.add('-anim', pokemon, 'Pay Day', pokemon);
			this.add('-anim', target, 'Pay Day', target);

			const myRoll = this.random(3, 18);
			const yourRoll = this.random(3, 18);

			this.add('-message', `${pokemon.name} rolled a ${myRoll}!`);
			this.add('-message', `${target.name} rolled a ${yourRoll}!`);

			if (myRoll >= yourRoll) {
				this.add('-message', `Better luck next time!`);
				pokemon.m.wagerStacks *= 3;
				if (pokemon.m.wagerStacks > 18) pokemon.m.wagerStacks = 18;
				this.add('-anim', pokemon, 'Celebrate', pokemon);
				this.add('-anim', pokemon, 'Shadow Ball', target);
				this.effectState.forcingSwitch = true;
				return 120;
			} else {
				this.add('-message', `Can't win 'em all!`);
				this.add('-anim', pokemon, 'Splash', pokemon);
				for (let i = 0; i < pokemon.m.wagerStacks; i++) {
					const stats: BoostID[] = [];
					let stat: BoostID;
					for (stat in target.boosts) {
						if (target.boosts[stat] < 6) {
							stats.push(stat);
						}
					}
					if (stats.length) {
						const randomStat = this.sample(stats);
						const boost: SparseBoostsTable = {};
						boost[randomStat] = 2;
						this.boost(boost, target);
					}
				}
				this.add('-message', `${target.name} received ${pokemon.m.wagerStacks} boosts for each of ${pokemon.name}'s ${pokemon.m.wagerStacks} wager stacks!`);
				this.add('-message', `${pokemon.name} lost their wager!`);
				pokemon.m.wagerStacks = 0;
				return 0;
			}
		},
		onHit(target, source, move) {
			if (this.effectState.forcingSwitch) target.forceSwitchFlag = true;
		},
	},
	// Croupier
	rollthedice: {
		name: "Roll the Dice",
		category: "Special",
		accuracy: 100,
		basePower: 1,
		pp: 64,
		noPPBoosts: true,
		priority: 0,
		flags: {},
		target: "normal",
		type: "Ghost",
		ignoreImmunity: true,
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Wish', source);
			this.add('-anim', source, 'Celebrate', source);
		},
		basePowerCallback(pokemon, target, move) {
			const roll = this.random(1, 6);
			this.add('-message', `${pokemon.name} rolled a ${roll}!`);
			this.add('-message', `${pokemon.name} scored ${roll} wager stacks!`);
			pokemon.m.wagerStacks += roll;
			switch (roll) {
				case 1:
					const stats: BoostID[] = [];
					let stat: BoostID;
					for (stat in target.boosts) {
						if (target.boosts[stat] < 6) {
							stats.push(stat);
						}
					}
					if (stats.length) {
						const randomStat = this.sample(stats);
						const boost: SparseBoostsTable = {};
						boost[randomStat] = 1;
						this.boost(boost, target);
					}
					return 1;
				case 2:
					return 40;
				case 3:
					return 60;
				case 4:
					return 80;
				case 5:
					return 100;
				case 6:
					pokemon.m.wagerStacks = 0;
					this.heal(pokemon.baseMaxhp, pokemon);
					this.boost({ atk: 1, def: 1, spa: 1, spd: 1, spe: 1 }, pokemon);
					pokemon.m.luckySix = true;
					changeSet(this, pokemon, ssbSets['Faust'], true);
					return 80;
			}
		},
		onEffectiveness() {
			return 0;
		},
	},
	// Croupier
	tapout: {
		name: "Tap Out",
		category: "Status",
		accuracy: 100,
		basePower: 0,
		pp: 16,
		noPPBoosts: true,
		priority: 0,
		flags: { reflectable: 1, protect: 1 },
		target: "normal",
		type: "Ghost",
		selfSwitch: true,
		ignoreImmunity: true,
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Belly Drum', source);
		},
		onHit(target, source, move) {
			source.m.wagerStacks++;
			this.add('-message', `${source.name} saved a wager stack!`);
			target.addVolatile('taunt');
			target.addVolatile('torment');
		},
	},
	// Flufi
	ripapart: {
		name: "Rip Apart",
		category: "Physical",
		basePower: 150,
		accuracy: true,
		shortDesc: "Supereffective against all types. User must recharge.",
		pp: 1,
		isZ: "epipen",
		priority: 0,
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Growth', source);
			this.add('-anim', source, 'Work Up', source);
			this.add('-anim', source, 'Fury Swipes', target);
		},
		onEffectiveness(typeMod, target, type) {
			return 1;
		},
		flags: { bypasssub: 1, contact: 1 },
		self: {
			volatileStatus: 'mustrecharge',
		},
		breaksProtect: true,
		secondary: null,
		target: "normal",
		type: "Fighting",
	},
	// Flufi
	cranberrycutter: {
		name: "Cranberry Cutter",
		category: "Physical",
		shortDesc: "Always results in a critical hit. Confuses the target.",
		basePower: 100,
		accuracy: 90,
		pp: 10,
		priority: 0,
		flags: { protect: 1, contact: 1, mirror: 1 },
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Topsy Turvy', target);
			this.add('-anim', source, 'Psycho Cut', source);
			this.add('-anim', source, 'Seismic Toss', target);
		},
		willCrit: true,
		secondary: {
			chance: 100,
			volatileStatus: 'confusion',
		},
		target: "normal",
		type: "Psychic",
	},
	// Toshiro
	sennenhyoro: {
		name: "Sennen Hyoro",
		gen: 9,
		accuracy: 100,
		basePower: 90,
		category: "Physical",
		type: "Ice",
		pp: 5,
		priority: 0,
		flags: {charge: 1, protect: 1},
		desc: "Charges for 1 turn, then strikes. Freezes the target for 7 turns (ignores freeze immunity). Can only be used once per switch-in.",
		shortDesc: "Charge 1 turn. 7T freeze ignoring immunity. 1/use per switch-in.",
		target: "normal",
		onTryMove(attacker, defender, move) {
			if (attacker.removeVolatile('sennenhyorocharge')) {
				return;
			}
			// TURN 1: once per switch-in gate
			if (attacker.m.sennenUsed) {
				this.add('-fail', attacker, move);
				return null;
			}
			attacker.m.sennenUsed = true;
			this.attrLastMove('[still]');
			this.add('-message', `${attacker.name} is gathering glacial energy!`);
			this.add('-anim', attacker, 'Haze', attacker);
			this.add('-anim', attacker, 'Cosmic Power', attacker);
			if (!this.runEvent('ChargeMove', attacker, defender, move)) return;
			attacker.addVolatile('twoturnmove', defender);
			attacker.addVolatile('sennenhyorocharge', defender);
			return null;
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Freeze Shock', target);
		},
		onHit(target, source, move) {
			(target as any).setStatus('frz', source, move, true);
			(target.statusState as any).ssbTurns = 7;
			this.add('-message', `${target.name} was sealed in ice!`);
		},
	},	
	// Quetzalcoatl
	bigthunder: {
		accuracy: true,
		basePower: 50,
		category: "Special",
		name: "Big Thunder",
		pp: 5,
		priority: 0,
		flags: { protect: 1, bypasssub: 1 },
		shortDesc: "Hits opposing Pokemon at end of each turn. Duration varies.",
		desc: "Hits all opposing Pokemon at the end of each turn. Number of turns is determined by the number of static counters the user has upon use.",
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source, move) {
			this.add('-anim', source, 'Hurricane', source);
			this.add('-anim', source, 'Thunder', target);
			if (!source.m.static) {
				this.debug('insufficient charge for big thunder');
				return false;
			}
		},
		onHit(target, source, move) {
			target.side.addSideCondition('bigthunder');
			target.side.sideConditions['bigthunder'].duration = source.m.static;
			target.side.sideConditions['bigthunder'].source = source;
			target.side.sideConditions['bigthunder'].move = move;
			source.m.static = null;
		},
		condition: {
			onResidual(pokemon) {
				this.add('-anim', pokemon, 'Thunder', pokemon);
				const damage = this.actions.getDamage(this.effectState.source, pokemon, this.effectState.move);
				if (!damage || pokemon.ability === 'pealofthunder') {
					if (pokemon.ability === 'pealofthunder') this.field.setTerrain('electricterrain');
					this.add('-immune', pokemon);
				} else {
					this.damage(damage, pokemon, this.effectState.source, this.dex.moves.get('bigthunder'));
				}
			},
			onSideEnd() {
				this.add('-message', `The thunderstorm petered out!`);
			},
		},
		secondary: null,
		target: "normal",
		type: "Electric",
	},
	// Cyclommatic Cell
	parabolicdischarge: {
		name: "Parabolic Discharge",
		category: "Special",
		gen: 9,
		desc: "Fails unless Electric Terrain is active. After dealing damage, Electric Terrain ends. Drains the user's Battery Life to 0 and changes its ability to Electromorphosis.",
		shortDesc: "Only in Electric Terrain. Ends Terrain. Gauges -> 0. Becomes Electromorphosis.",
		basePower: 150,
		accuracy: true,
		pp: 5,
		priority: 0,
		ignoreAbility: true,
		flags: {protect: 1, metronome: 1},
		type: "Electric",
		target: "normal",
		onTry(source, target, move) {
			const field: any = this.field;
			const isET = (field.isTerrain && field.isTerrain('electricterrain')) || field.terrain === 'electricterrain';
			if (!isET) {
				this.add('-fail', source, move, '[from] terrain');
				return null;
			}
		},
		onTryMove(target, source, move) {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source, move) {
			this.add('-anim', source, 'Parabolic Charge', target);
			this.add('-anim', source, 'Electro Shot', target);
		},
		onHit(target, source, move) {
			// Drain gauges to 0
			if (!source.gauges) (source as any).gauges = {};
			(source.gauges as any).gauges = 0;
			// End Electric Terrain immediately
			const field: any = this.field;
			if (field.clearTerrain) {
				field.clearTerrain();
			} else if (field.setTerrain) {
				field.setTerrain('');
			} else {
				field.terrain = '';
			}
			this.add('-message', `The Electric Terrain shorted out!`);
			// Become Electromorphosis
			if (source.ability !== 'electromorphosis') {
				source.setAbility('electromorphosis', source, move);
				this.add('-ability', source, 'Electromorphosis', '[from] move: Parabolic Discharge');
				this.add('-anim', source, 'Charge', source);
			}
		},
	},
	// Morte
	omenofdefeat: {
		accuracy: 100,
		basePower: 150,
		category: "Physical",
		name: "Omen of Defeat",
		shortDesc: "Endures, then hits after opponent. Mimikyu: Transforms.",
		pp: 16,
		noPPBoosts: true,
		priority: -8,
		flags: { contact: 1, protect: 1 },
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Hex', source);
			this.add('-anim', source, 'Spectral Thief', target);
		},
		priorityChargeCallback(pokemon) {
			if (pokemon.species.id !== 'mimikyubusted') pokemon.addVolatile('omenofdefeat');
		},
		condition: {
			duration: 1,
			onStart(pokemon) {
				this.add('-singleturn', pokemon, 'move: Omen of Defeat');
				this.add('-anim', pokemon, 'Confuse Ray', pokemon);
				this.add('-message', `${pokemon.name} prepared for defeat!`);
			},
			onDamage(damage, target, source, effect) {
				if (effect?.effectType === 'Move' && damage >= target.hp) {
					this.add('-activate', target, 'move: Omen of Defeat');
					return target.hp - 1;
				}
			},
			onEnd(pokemon) {
				if (pokemon.species.id === 'mimikyu') {
					const targetSide = pokemon.side.foe.active[0].side;
					pokemon.formeChange('Mimikyu-Busted');
					pokemon.m.dollDur = 3;
					pokemon.hp = pokemon.baseMaxhp;
					this.add('-heal', pokemon, pokemon.getHealth, '[silent]');
					targetSide.addSideCondition('Cursed Doll', pokemon);
				}
			},
		},
		secondary: null,
		target: "normal",
		type: "Ghost",
	},
	// Marisa Kirisame
	orbshield: {
		accuracy: true,
		basePower: 0,
		category: "Status",
		desc: "Creates a substitute without sacrificing HP. At the end of the same turn it is used, the substitute vanishes and deals damage equal to its current HP. Cannot be used twice in a row.",
		shortDesc: "Creates a substitute that damages end of turn; no twice in a row.",
		name: "Orb Shield",
		pp: 5,
		priority: 4,
		flags: { cantusetwice: 1, snatch: 1 },
		volatileStatus: 'orbshield',
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Defense Curl', source);
			this.add('-anim', source, 'Protect', source);
		},
		condition: {
			duration: 1,
			onStart(target, source, effect) {
				this.add('-start', target, 'Orb Shield');
				target.m.orbHp = Math.floor(target.maxhp / 4);
				if (target.volatiles['partiallytrapped']) {
					this.add('-end', target, target.volatiles['partiallytrapped'].sourceEffect, '[partiallytrapped]', '[silent]');
					delete target.volatiles['partiallytrapped'];
				}
			},
			onTryPrimaryHitPriority: -1,
			onTryPrimaryHit(target, source, move) {
				if (target === source || move.flags['bypasssub'] || move.infiltrates || !target.m.orbHp) return;
				// @ts-ignore
				const damage = this.actions.getDamage(source, target, move);
				if (!damage) {
					this.add('-message', `${target.name} was protected by Orb Shield!`);
					return null;
				}
				if (damage < target.m.orbHp) {
					target.m.orbHp -= damage;
					this.add('-activate', target, 'move: Orb Shield', '[damage]');
				} else if (damage >= target.m.orbHp) {
					target.m.orbHp = 0;
					target.removeVolatile('orbshield');
					this.add('-message', `${target.name}'s Orb Shield broke!`);
				}
				if (move.recoil || move.id === 'chloroblast') this.damage(this.actions.calcRecoilDamage(damage, move, source), source, target, 'recoil');
				if (move.drain) this.heal(Math.ceil(damage * move.drain[0] / move.drain[1]), source, target, 'drain');
				return null;
			},
			onEnd(pokemon) {
				const target = pokemon.side.foe.active[pokemon.side.foe.active.length - 1 - pokemon.position];
				if (pokemon.m.orbHp) this.damage(80, target, pokemon);
				this.add('-end', pokemon, 'Orb Shield');
				pokemon.m.orbHp = 0;
			},
		},
		secondary: null,
		target: "self",
		type: "Fairy",
	},
	// Sanae Kochiya
	miracle: {
		accuracy: true,
		basePower: 80,
		category: "Special",
		desc: "Summons a random weather condition, uses either Wish, Assist, Baton Pass, Aqua Ring, Reflect, Light Screen, Assist, Recycle, Laser Focus or Safeguard. Changes type to match weather condition.",
		shortDesc: "Summons random weather/status move. Typing matches weather.",
		name: "Miracle",
		gen: 9,
		pp: 8,
		noPPBoosts: true,
		priority: 0,
		flags: { mirror: 1, protect: 1 },
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Core Enforcer', target);
		},
		onHit(target, source, move) {
			// Random Weather
			let w = this.random(5);
			if (w === 0) this.field.setWeather('sunnyday');
			if (w === 1) this.field.setWeather('raindance');
			if (w === 2) this.field.setWeather('sandstorm');
			if (w === 3) this.field.setWeather('snowscape');

			// Random Status Move
			let r = this.random(9);
			if (r === 0) source.addVolatile('laserfocus', source);
			if (r === 1) this.actions.useMove('Wish', source);
			if (r === 2) {
				// Assist
				const moves = [];
				for (const pokemon of source.side.pokemon) {
					if (pokemon === source) continue;
					for (const moveSlot of pokemon.moveSlots) {
						const moveid = moveSlot.id;
						const move = this.dex.moves.get(moveid);
						if (move.flags['noassist'] || move.isZ || move.isMax) {
							continue;
						}
						moves.push(moveid);
					}
				}
				let randomMove = '';
				if (moves.length) randomMove = this.sample(moves);
				if (!randomMove) {
					return false;
				}
				this.actions.useMove(randomMove, source);
			}
			if (r === 3) this.actions.useMove('Baton Pass', source);
			if (r === 4) source.addVolatile('aquaring', source);
			if (r === 5) source.side.addSideCondition('reflect', source);
			if (r === 6) source.side.addSideCondition('lightscreen', source);
			if (r === 7) {
				// Recycle
				if (source.item || !source.lastItem) return false;
				const item = source.lastItem;
				source.lastItem = '';
				this.add('-item', source, this.dex.items.get(item), '[from] move: Recycle');
				source.setItem(item);
			}
			if (r === 8) source.side.addSideCondition('safeguard', source);
			if (r === 9) source.side.addSideCondition('tailwind', source);
		},
		onModifyType(move, pokemon) {
			// Type Changing
			switch (pokemon.effectiveWeather()) {
				case 'sunnyday':
				case 'desolateland':
					move.type = 'Fire';
					break;
				case 'raindance':
				case 'primordialsea':
					move.type = 'Water';
					break;
				case 'sandstorm':
					move.type = 'Rock';
					break;
				case 'hail':
				case 'snow':
					move.type = 'Ice';
					break;
			}
		},
		secondary: null,
		target: "normal",
		type: "Fairy",
	},
	// Shigeki
	bloodfeast: {
		name: "Bloodfeast",
		category: "Physical",
		gen: 9,
		basePower: 80,
		accuracy: 100,
		pp: 10,
		priority: 0,
		flags: {protect: 1, contact: 1, bite: 1, metronome: 1},
		type: "Dark",
		target: "normal",
		shortDesc: "1.3x vs Bleeding. If used on Bleeding in consecutive turns, user enters Frenzy.",
		desc: "Deals 1.3x damage to Bleeding targets. If the user hits a Bleeding target with Bloodfeast on consecutive turns, the user enters Frenzy. While under Illusion, this move has +1 priority and a high crit rate.",
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Jaw Lock', target);
		},
		onBasePower(basePower, source, target, move) {
			if (target?.volatiles?.bleeding) {
				return this.chainModify([5325, 4096]); // 1.3
			}
		},
		onModifyDamage(damage, source, target, move) {
			if (target?.volatiles?.bleeding) {
				return this.chainModify([5325, 4096]);
			}
		},
		onModifyPriority(priority, source) {
			if ((source as any).illusion) return priority + 1;
		},
		onModifyCritRatio(critRatio, source) {
			if ((source as any).illusion) return critRatio + 2;
		},
		onAfterHit(target, source, move) {
			// Trigger Frenzy if this is consecutive Bloodfeast on a Bleeding target
			if (target?.volatiles['bleeding']) {
				const lastTurn = (source as any).ssbBloodfeastBleedTurn as number | undefined;
				if (lastTurn === this.turn - 1 && !source.volatiles['frenzy']) {
					this.add('-message', `${source.name} hunger consumes him and enters a Frenzy!`);
					source.addVolatile('frenzy');
					(source as any).ssbBloodfeastBleedTurn = undefined;
				} else {
					(source as any).ssbBloodfeastBleedTurn = this.turn;
				}
			} else {
				(source as any).ssbBloodfeastBleedTurn = undefined;
			}
		},
	},
	glare: {
		num: 137,
		accuracy: 100,
		basePower: 0,
		category: "Status",
		name: "Glare",
		pp: 30,
		priority: 0,
		flags: {protect: 1, reflectable: 1, mirror: 1, metronome: 1},
		shortDesc: "Paralyzes. If user has Hemolust and target is already paralyzed, Brainwash it instead.",
		desc: "Paralyzes the target. If the user has Hemolust and the target is already paralyzed, this instead inflicts Brainwashed (Psychic-types are immune).",
		onTryHit(target, source, move) {
			// Shigeki tech: Paralyzed target -> Brainwash instead of failing
			if (source.hasAbility('hemolust') && target.status === 'par') {
				if (target.hasType('Psychic')) {
					this.add('-immune', target);
					return this.NOT_FAIL;
				}
				if (!target.volatiles['brainwashed']) {
					target.addVolatile('brainwashed', source);
					this.add('-anim', source, 'Hypnosis', target);
					this.add('-message', `${target.name} was brainwashed!`);
				}
				return this.NOT_FAIL; // IMPORTANT: prevents the "Already Paralyzed" fail path
			}
			if (target.status) return false;
		},
		onHit(target, source, move) {
			// Only paralyze if we didn't brainwash above
			if (source.hasAbility('hemolust') && target.status === 'par') return;
			target.trySetStatus('par', source, move);
		},
		type: "Normal",
		target: "normal",
	},	
	// Prince Smurf
	youfilthypeasant: {
		accuracy: 100,
		basePower: 0,
		category: "Status",
		shortDesc: "Target becomes Normal-type/Gains Normalize; Torments target.",
		desc: "Ignores Abilities; Makes the target Normal type and changes their ability to Normalize. Torments them. Cannot be used two turns in a row.",
		name: "You Filthy Peasant",
		pp: 15,
		noPPBoosts: true,
		priority: 0,
		flags: { protect: 1, mirror: 1, metronome: 1, cantusetwice: 1 },
		ignoreAbility: true,
		volatileStatus: 'torment',
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, "Hyper Voice", target);
			this.add('-anim', source, "Taunt", target);
		},
		onTryHit(target) {
			if (target.getAbility().flags['cantsuppress'] || target.ability === 'normalize' || target.ability === 'truant') return false;
		},
		onHit(target, pokemon) {
			if (target.getTypes().join() === 'Normal' || !target.setType('Normal')) {
				this.add('-fail', target);
				return null;
			}
			const oldAbility = target.setAbility('normalize');
			if (oldAbility) {
				this.add('-ability', target, 'Normalize', '[from] move: You Filthy Peasant');
			}
			this.add('-start', target, 'typechange', 'Normal');
			pokemon.m.turnLastUsed = this.turn;
			return oldAbility as false | null;
		},
		onDisableMove(pokemon) {
			if (this.turn - pokemon.m.turnLastUsed < 5) pokemon.disableMove('youfilthypeasant');
		},
		secondary: null,
		target: "normal",
		type: "Normal",
	},
	dynamicshift: {
		name: "Dynamic Shift",
		category: "Status",
		gen: 9,
		isZ: "smurfscrown",
		desc: "Sets a King’s Shield-like barrier for the rest of the turn: blocks Protect-blockable moves; lowers attacker Atk by 2 if Physical, SpA by 2 if Special. Permanently swaps Speed stats with the target (not boosts). Changes You Filthy Peasant to Last Resort.",
		shortDesc: "Z. Shield + -2 Atk/SpA on block. Permanently swaps Spe. Filthy -> Last Resort.",
		pp: 1,
		priority: 4,
		accuracy: true,
		flags: {noassist: 1, failcopycat: 1},
		stallingMove: true,
		volatileStatus: 'dynamicshift',
		type: "Normal",
		target: "normal",
		onPrepareHit(pokemon) {
			this.add('-anim', pokemon, "King's Shield", pokemon);
			return !!this.queue.willAct() && this.runEvent('StallMove', pokemon);
		},
		onTryMove(target, source) {
			this.attrLastMove('[still]');
		},
		onHit(target, source, move) {
			// Permanently swap Speed with the target (sticks after switching)
			const a: any = source;
			const b: any = target;
			const containers = ['baseStoredStats', 'storedStats', 'stats'] as const;
			let spe1: number | undefined;
			let spe2: number | undefined;
			for (const key of containers) {
				if (a[key]?.spe != null && b[key]?.spe != null) {
					spe1 = a[key].spe;
					spe2 = b[key].spe;
					break;
				}
			}
			if (spe1 != null && spe2 != null) {
				for (const key of containers) {
					if (a[key]?.spe != null) a[key].spe = spe2;
					if (b[key]?.spe != null) b[key].spe = spe1;
				}
				a.updateSpeed?.();
				b.updateSpeed?.();
				this.add('-message', `${source.name} turned the tides and swapped Speed with ${target.name}!`);
			}
			// Change You Filthy Peasant -> Last Resort
			const slot = source.moveSlots.findIndex(s => s.id === 'youfilthypeasant');
			if (slot >= 0) {
				const lr = this.dex.moves.get('lastresort');
				const s = source.moveSlots[slot];
				s.id = lr.id;
				s.move = lr.name;
				s.maxpp = lr.pp;
				if (s.pp > s.maxpp) s.pp = s.maxpp;
				this.add('-message', `You Filthy Peasant became Last Resort!`);
			}
		},
		condition: {
			duration: 1,
			onStart(target) {
				this.add('-singleturn', target, 'move: Dynamic Shift');
			},
			onTryHitPriority: 3,
			onTryHit(target, source, move) {
				if (!move.flags['protect']) {
					if (['gmaxoneblow', 'gmaxrapidflow'].includes(move.id)) return;
					if (move.isZ || move.isMax) target.getMoveHitData(move).zBrokeProtect = true;
					return;
				}
				if (move.smartTarget) {
					move.smartTarget = false;
				} else {
					this.add('-activate', target, 'move: Dynamic Shift');
				}
				const lockedmove = source.getVolatile('lockedmove');
				if (lockedmove) {
					if (source.volatiles['lockedmove'].duration === 2) {
						delete source.volatiles['lockedmove'];
					}
				}
				if (source && !source.fainted && move.category !== 'Status') {
					if (move.category === 'Physical') {
						this.boost({atk: -2}, source, target);
					} else if (move.category === 'Special') {
						this.boost({spa: -2}, source, target);
					}
				}
				return this.NOT_FAIL;
			},
		},
		secondary: null,
	},	
	// Kozuchi
	emergencyupgrades: {
		name: "Emergency Upgrades",
		category: "Status",
		basePower: 0,
		accuracy: true,
		pp: 1,
		priority: 0,
		flags: {},
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Rock Polish', source);
			this.add('-anim', source, 'Swords Dance', source);
		},
		volatileStatus: 'emergencyupgrades',
		condition: {
			duration: 5,
			onStart(pokemon) {
				this.add('-message', `${pokemon.name} made emergency upgrades!`);
			},
			onResidual(pokemon) {
				if (this.effectState.duration === 2) this.add('-message', `${pokemon.name}'s emergency upgrades wore off!`);
			},
			onBasePower(basePower, pokemon, target) {
				if (this.effectState.duration >= 3) return this.chainModify(2);
			},
		},
		isZ: "forgedhammer",
		target: "self",
		type: "Steel",
	},
	// Kozuchi
	weaponenhancement: {
		accuracy: true,
		basePower: 0,
		category: "Status",
		name: "Weapon Enhancement",
		pp: 3,
		noPPBoosts: true,
		priority: 0,
		flags: { snatch: 1 },
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Hone Claws', source);
			this.add('-anim', source, 'Splash', source);
		},
		onHit(pokemon) {
			if (!pokemon.m.enhancement) pokemon.m.enhancement = 0;
			if (pokemon.m.enhancement >= 3) {
				this.add('-message', `${pokemon.name}'s weapon is already at maximum enhancement!`);
				return;
			}
			if (pokemon.m.enhancement < 3) {
				pokemon.m.enhancement += 1;
				this.add('-message', `${pokemon.name} is strengthening their weapon!`);
			}
		},
		secondary: null,
		target: "self",
		type: "Steel",
	},
	// Urabrask
	terrorizethepeaks: {
		accuracy: 80,
		basePower: 100,
		category: "Special",
		desc: "Hits the opposing Pokemon and one random inactive Pokemon on the opposing side.",
		shortDesc: "Hits a random inactive opposing Pokemon.",
		name: "Terrorize the Peaks",
		gen: 9,
		pp: 8,
		noPPBoosts: true,
		priority: 0,
		flags: { protect: 1, mirror: 1 },
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Roar', target);
			this.add('-anim', source, 'Eruption', target);
		},
		onHit(target, source, move) {
			let possibleTargets = [];
			for (const pokemon of target.side.pokemon) {
				if (pokemon === target) continue;
				if (pokemon.hp) possibleTargets.push(pokemon);
			}
			if (!possibleTargets || !possibleTargets.length) return null;
			const newTarget = this.sample(possibleTargets);
			// @ts-ignore
			let dmg = this.actions.getDamage(source, newTarget, move);
			if (!dmg) {
				this.add('-message', `${newTarget.name} was unaffected by Terrorize the Peaks!`);
				return;
			}
			if (dmg > newTarget.hp) dmg = newTarget.hp;
			newTarget.hp -= dmg;
			this.add('-message', `${newTarget.name} took ${Math.round(dmg / newTarget.baseMaxhp * 100)}% from Terrorize the Peaks!`);
			if (newTarget.hp <= 0) {
				newTarget.faint();
				return;
			}
			if (this.randomChance(1, 5)) {
				newTarget.status === 'brn';
				newTarget.setStatus('brn', source);
				this.add('-message', `${newTarget.name} was burned!`);
			}
			return;
		},
		secondary: null,
		target: "normal",
		type: "Fire",
	},
	// Urabrask
	blasphemousact: {
		accuracy: 100,
		basePower: 0,
		category: "Physical",
		desc: "Steals 1/10-to-1/3 max HP from all allies with at least 1/3 max HP remaining. This Pokemon recovers HP equal to the stolen HP. This move's power is equal to (HP Stolen / 1.5). 30% chance to burn each Pokemon hit, replacing existing status conditions.",
		shortDesc: "All foes: 30% burn. Steals allies' HP to determine power.",
		name: "Blasphemous Act",
		gen: 9,
		pp: 1,
		priority: 0,
		flags: { contact: 1 },
		breaksProtect: true,
		isZ: "braidoffire",
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Inferno', source);
			this.add('-anim', source, 'G-Max Fireball', target);
		},
		basePowerCallback(pokemon, target, move) {
			this.effectState.totaldrain = 0;
			for (const ally of pokemon.side.pokemon) {
				if (ally === pokemon) continue;
				if (ally.hp <= ally.baseMaxhp / 3) continue;
				let dmg = ally.baseMaxhp / this.random(3, 10);
				ally.hp -= dmg;
				this.effectState.totaldrain += dmg;
			}
			if (!this.effectState.totaldrain) return false;
			this.heal(this.effectState.totaldrain, pokemon, pokemon, move);
			return this.effectState.totaldrain / 1.5;
		},
		onAfterHit(target, source) {
			for (const pokemon of target.side.pokemon) {
				if (pokemon.fainted || pokemon.hp <= 0) continue;
				if (this.randomChance(3, 10)) pokemon.setStatus('brn', source);
			}
		},
		secondary: null,
		target: "normal",
		type: "Fire",
	},
	// Sariel
	thehandsresisthim: {
		accuracy: true,
		basePower: 0,
		category: "Status",
		shortDesc: "See '/ssb Sariel' for more!",
		desc: "Permanently inflicts Curse of the Hands on the opposing side. User faints. (Curse of the Hands: Affected side's Pokemon are prevented from healing in any form. Affected side's active Pokemon loses 1/16 max HP at the end of each turn.)",
		name: "The Hands Resist Him",
		gen: 9,
		pp: 1,
		noPPBoosts: true,
		priority: 0,
		flags: {},
		selfdestruct: 'always',
		sideCondition: 'thehandsresisthim',
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Glare', target);
			this.add('-anim', target, 'Dark Void', target);
		},
		onHit(target, source, move) {
			target.side.addSideCondition('thehandsresisthim', source, move)
		},
		condition: {
			onSideStart(targetSide) {
				this.add('-sidestart', targetSide, 'The Hands Resist Him', '[silent]');
				this.add('-message', `The opposing side was cursed!`);
			},
			onResidual(pokemon) {
				this.add('-anim', pokemon, "Spectral Thief", pokemon);
				this.damage(pokemon.maxhp / 16, pokemon, pokemon, this.dex.conditions.get('The Hands Resist Him'));
			},
			onTryHeal(damage, target, source, effect) {
				this.add('-anim', target, 'Tickle', target);
				this.add('-message', `${target.name} couldn't muster up the strength to heal!`);
				return false;
			},
		},
		secondary: null,
		target: "normal",
		type: "Dark",
	},
	// Mima
	reincarnation: {
		accuracy: true,
		basePower: 0,
		category: "Status",
		desc: "User fully restores HP and status condition and resets boosts before permanently transforming into foe.",
		shortDesc: "Full restore & boost reset; transformation.",
		name: "Reincarnation",
		gen: 9,
		pp: 1,
		priority: 0,
		flags: { defrost: 1 },
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Revival Blessing', source);
		},
		onHit(target, pokemon) {
			pokemon.clearBoosts();
			pokemon.cureStatus();
			let move: Move | ActiveMove | null = pokemon.lastMove;
			changeSet(this, pokemon, ssbSets[target.name]);
			this.heal(pokemon.baseMaxhp, pokemon, pokemon, move);
		},
		isZ: "crescentstaff",
		secondary: null,
		target: "normal",
		type: "Ghost",
	},
	// Mima
	completedarkness: {
		accuracy: 100,
		basePower: 90,
		category: "Special",
		desc: "The target's positive stat changes are stolen and applied to the user before dealing damage.",
		shortDesc: "Steals target's boosts before dealing damage.",
		name: "Complete Darkness",
		gen: 9,
		pp: 16,
		noPPBoosts: true,
		priority: 0,
		flags: { bypasssub: 1, mirror: 1, protect: 1 },
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Spectral Thief', target);
		},
		stealsBoosts: true,
		secondary: null,
		target: "normal",
		type: "Dark",
	},
	// Gizmo
	coinclash: {
		accuracy: 80,
		basePower: 25,
		category: "Physical",
		name: "Coin Clash",
		desc: "Hits 3-5 times. Flings coin at target after use. 50% chance to gain +2 crit ratio and 1.25x evasion until switch/faint. Fails if not holding Inconspicuous Coin.",
		shortDesc: "Hits 3-5(+1) times. 50%: +2 Crit/1.25x EVA. -Inconspicuous Coin: Fails.",
		pp: 5,
		priority: 0,
		flags: { contact: 1 },
		onTryMove(pokemon, target, move) {
			this.attrLastMove('[still]');
			if (!pokemon.item) {
				this.add('-anim', pokemon, 'Splash', pokemon);
				this.add('-message', `${pokemon.name} couldn't find their coin!`);
				return false;
			}
		},
		onPrepareHit(target, source) {
			if (!source.item) return;
			this.add('-anim', source, 'Magnetic Flux', source);
			this.add('-anim', source, 'Pay Day', target);
		},
		onAfterMove(source, target, move) {
			this.add('-message', `${source.name} tossed the Inconspicuous Coin at ${target.name}!`);
			this.damage(target.maxhp / this.random(6, 10), target, source);
			source.addVolatile('coinclash');
			source.m.recallActive = true;
			if (this.randomChance(1, 2)) {
				this.add('-message', `Hey! The coin landed on heads!`);
				this.add('-message', `${source.name} is fired up!`);
				this.heal(source.maxhp / this.random(4, 8));
				source.m.firedUp = true;
			}
		},
		condition: {
			duration: 2,
			onStart(pokemon) {
				const item = pokemon.getItem();
				pokemon.setItem('');
				pokemon.lastItem = item.id;
				pokemon.usedItemThisTurn = true;
				this.add('-enditem', pokemon, item.name, '[from] move: Coin Clash');
				this.runEvent('AfterUseItem', pokemon, null, null, item);
			},
			onEnd(pokemon) {
				if (pokemon.item || pokemon.name !== 'Gizmo') return;
				pokemon.setItem('inconspicuouscoin');
				this.add('-item', pokemon, pokemon.getItem(), '[from] item: Inconspicuous Coin');
				pokemon.m.recallActive = false;
			},
		},
		multihit: [3, 5],
		secondary: null,
		target: "normal",
		type: "Steel",
	},
	// Gadget
	capitalcannon: {
		accuracy: 100,
		basePower: 0,
		category: "Physical",
		name: "Capital Cannon",
		desc: "+10 base power for each coin the user has collected through Cash Grab, up to 300 base power. Neutral effectiveness against all types.",
		shortDesc: "+10 bp per coin, max 300; Neutral vs. all types.",
		pp: 5,
		flags: { protect: 1 },
		onTryMove(pokemon, target, move) {
			this.attrLastMove('[still]');
			if (!pokemon.m.coins) {
				this.add('-message', `${pokemon.name} used Capital Cannon...`)
				this.add('-anim', pokemon, 'Splash', pokemon);
				this.add('-message', `...but couldn't fire from an empty cannon!`);
				return false;
			}
		},
		onPrepareHit(target, source) {
			if (!source.m.coins) return;
			this.add('-anim', source, 'Taunt', target);
			this.add('-anim', source, 'Spirit Shackle', source);
			this.add('-anim', source, 'Hyper Beam', target);
		},
		basePowerCallback(pokemon, target, move) {
			if (!pokemon.m.coins) return;
			if (pokemon.m.coins >= 30) {
				return 300;
			} else {
				return 100 * pokemon.m.coins;
			}
		},
		onEffectiveness(typeMod, target, type) {
			return 0;
		},
		onHit(target, source, move) {
			if (source.m.coins > 10) {
				source.m.coins -= 10;
			} else {
				source.m.coins = 0;
			}
		},
		secondary: null,
		target: "normal",
		type: "Steel",
	},
	// Glint
	gigameld: {
		accuracy: true,
		basePower: 65,
		category: "Physical",
		name: "GigaMeld",
		pp: 5,
		noPPBoosts: true,
		flags: { contact: 1, protect: 1 },
		ignoreImmunity: true,
		priorityChargeCallback(pokemon) {
			pokemon.addVolatile('gigameld');
		},
		onPrepareHit(target, source) {
			this.add('-anim', pokemon, 'Swagger', target);
			this.add('-anim', pokemon, 'Flame Charge', target);
		},
		onHit(target, source, move) {
			const lstats = ['atk', 'def', 'spa', 'spd', 'spe'];
			const rstats = ['atk', 'def', 'spd', 'spe'];
			const loweredStat = this.sample(lstats);
			const raisedStat = this.sample(rstats);

			if (!source.addType(target.getTypes()[0])) return false;
			if (!target.addType('Steel')) return false;
			this.add('-start', target, 'typeadd', 'Steel', '[from] move: GigaMeld');
			this.add('-start', source, 'typeadd', target.getTypes()[0], '[from] move: GigaMeld');
			target.storedStats[loweredStat] -= 50;
			source.storedStats[raisedStat] += 50;
			this.add('-message', `${target.name}'s ${loweredStat.toUpperCase()} was decreased to ${target.storedStats[loweredStat]} by ${move.name}!`);
			this.add('-message', `${source.name}'s ${raisedStat.toUpperCase()} was increased to ${source.storedStats[raisedStat]} by ${move.name}!`);
		},
		condition: {
			duration: 1,
			onStart(pokemon) {
				this.add('-singleturn', pokemon, 'move: GigaMeld');
				this.add('-anim', pokemon, 'Work Up', pokemon);
				this.add('-message', `${pokemon.name} is preparing to meld!`);
			},
		},
		secondary: null,
		target: "normal",
		type: "Steel",
	},
	megametronome: {
		accuracy: true,
		basePower: 0,
		category: "Status",
		name: "Mega Metronome",
		desc: "Uses two-to-five randomly selected moves.",
		pp: 5,
		noPPBoosts: true,
		priority: 0,
		flags: { failencore: 1, nosleeptalk: 1, noassist: 1, failcopycat: 1, failmimic: 1, failinstruct: 1 },
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source) {
			this.add('-anim', target, 'Geomancy', target);
			this.add('-anim', target, 'Metronome', target);
		},
		onHit(target, source, effect) {
			// Metronome
			const moves = this.dex.moves.all().filter(move => (
				(![2, 4].includes(this.gen) || !source.moves.includes(move.id)) &&
				(!move.isNonstandard || move.isNonstandard === 'Unobtainable') &&
				move.flags['metronome']
			));
			let randomMove = '';
			if (moves.length) {
				moves.sort((a, b) => a.num - b.num);
				randomMove = this.sample(moves).id;
			}
			if (!randomMove) return false;
			source.side.lastSelectedMove = this.toID(randomMove);
			this.actions.useMove(randomMove, target);

			// Check if metronome count exists, add 1 to it, then exit the function
			// unless mCount is more than or equal to 5
			if (!target.mCount) target.mCount = 0;
			target.mCount++;
			if (!target.mCount || target.mCount < 5) return;
			if (target.ftfActivated) return;

			// Replaces Mega Metronome with Fear the Finger if mCount >= 5
			const mmIndex = target.moves.indexOf('megametronome');
			if (mmIndex < 0) return;
			const ftf = {
				move: 'Fear the Finger',
				id: 'fearthefinger',
				pp: 1,
				maxpp: 1,
				target: 'normal',
				disabled: false,
				used: false,
			};
			target.moveSlots[mmIndex] = ftf;
			target.baseMoveSlots[mmIndex] = ftf;
			target.ftfActivated = true;
			this.add('-activate', target, 'move: Mega Metronome', 'Fear the Finger');
		},
		secondary: null,
		multihit: [2, 5],
		target: "self",
		type: "Normal",
	},
	// Finger
	fearthefinger: {
		accuracy: true,
		basePower: 0,
		category: "Status",
		name: "Fear the Finger",
		shortDesc: "Uses ten randomly selected moves. Breaks protection.",
		pp: 1,
		noPPBoosts: true,
		priority: 0,
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source) {
			this.add('-anim', target, 'Springtide Storm', target);
		},
		onHit(target, source, effect) {
			// Metronome
			const moves = this.dex.moves.all().filter(move => (
				(![2, 4].includes(this.gen) || !source.moves.includes(move.id)) &&
				(!move.isNonstandard || move.isNonstandard === 'Unobtainable') &&
				move.flags['metronome']
			));
			for (let i = 0; i < 10; i++) {
				let randomMove = '';
				if (moves.length) {
					moves.sort((a, b) => a.num - b.num);
					randomMove = this.sample(moves).id;
				}
				if (!randomMove) return false;
				source.side.lastSelectedMove = this.toID(randomMove);
				this.actions.useMove(randomMove, target);
			}

			// Turns Fear the Finger back into Mega Metronome after use
			const ftfIndex = target.moves.indexOf('fearthefinger');
			if (ftfIndex < 0) return;
			const mm = {
				move: 'Mega Metronome',
				id: 'megametronome',
				pp: 8,
				maxpp: 8,
				target: 'self',
				disabled: false,
				used: false,
			};
			target.moveSlots[ftfIndex] = mm;
			target.baseMoveSlots[ftfIndex] = mm;
			this.add('-activate', target, 'move: Fear the Finger', 'Mega Metronome');
		},
		flags: {},
		breaksProtect: true,
		secondary: null,
		target: "self",
		type: "Dark",
	},
	// Pablo
	plagiarize: {
		accuracy: 100,
		basePower: 0,
		category: "Status",
		desc: "Replaces this move with target's last move. Lowers that move's PP to 0.",
		name: "Plagiarize",
		gen: 9,
		pp: 16,
		noPPBoosts: true,
		priority: 0,
		// Plagiarize
		onHit(target, source) {
			const move = target.lastMove;
			if (!move || source.moves.includes(move.id)) return false;
			if (move.isZ || move.isMax) return false;
			const plgIndex = source.moves.indexOf('plagiarize');
			if (plgIndex < 0) return false;

			source.moveSlots[plgIndex] = {
				move: move.name,
				id: move.id,
				pp: move.pp,
				maxpp: move.pp,
				target: move.target,
				disabled: false,
				used: false,
				virtual: true,
			};
			this.add('-start', source, 'Plagiarize', move.name, '[silent]');
			this.add('-message', `${source.name} plagiarized ${target.name}'s ${move.name}!`);
		},
		// PP Nullification
		onTryHit(target) {
			let move: Move | ActiveMove | null = target.lastMove;
			if (!move || move.isZ) return false;
			if (move.isMax && move.baseMove) move = this.dex.moves.get(move.baseMove);
			const ppDeducted = target.deductPP(move.id, 64);
			if (!ppDeducted) return false;
			this.add('-activate', target, 'move: Plagiarize', move.name, ppDeducted, '[silent]');
			this.add('-message', `${move.name}'s PP was nullified!`);
		},
		flags: {},
		target: "normal",
		type: "Normal",
	},
	// Pablo
	sketch: {
		num: 166,
		accuracy: true,
		basePower: 0,
		category: "Status",
		name: "Sketch",
		pp: 16,
		noPPBoosts: true,
		priority: 0,
		flags: {
			bypasssub: 1, allyanim: 1, failencore: 1, nosleeptalk: 1, noassist: 1,
			failcopycat: 1, failmimic: 1, failinstruct: 1, nosketch: 1,
		},
		onHit(target, source, move) {
			const lmove = target.lastMove;
			source.addVolatile('sketch');
			if (source.transformed || !lmove || source.moves.includes(lmove.id)) return;
			if (lmove.flags['nosketch'] || lmove.isZ || lmove.isMax) return;
			const sketchIndex = source.moves.indexOf('sketch');
			if (sketchIndex < 0) return;
			const sketchedMove = {
				move: lmove.name,
				id: lmove.id,
				pp: lmove.pp,
				maxpp: lmove.pp,
				target: lmove.target,
				disabled: false,
				used: false,
			};
			source.moveSlots[sketchIndex] = sketchedMove;
			this.add('-activate', source, 'move: Sketch', lmove.name);
		},
		onAfterMove(pokemon, target, move) {
			pokemon.storedStats.atk = target.storedStats.atk;
			pokemon.storedStats.def = target.storedStats.def;
			pokemon.storedStats.spa = target.storedStats.spa;
			pokemon.storedStats.spd = target.storedStats.spd;
			pokemon.storedStats.spe = target.storedStats.spe;
			this.add('-message', `${pokemon.name} sketched ${target.name}'s base stats!`);
		},
		condition: {
			duration: 1,
			onStart(pokemon) {
				this.add('-start', pokemon, 'move: Sketch', '[silent]');
			},
			onEnd(pokemon) {
				this.add('-end', pokemon, 'move: Sketch', '[silent]');
			},
			onTryHit(pokemon, target, move) {
				if (['sketch', 'plagiarize'].includes(move.id)) return;
				const newMove = this.dex.getActiveMove(move.id);
				newMove.hasBounced = true;
				newMove.pranksterBoosted = false;
				this.actions.useMove(newMove, pokemon, target);
				this.add('-immune', pokemon, '[from] move: Sketch');
				return null;
			},
		},
		secondary: null,
		target: "normal",
		type: "Normal",
		zMove: { boost: { atk: 1, def: 1, spa: 1, spd: 1, spe: 1 } },
		contestType: "Clever",
	},
	// Trey
	burstdelta: {
		accuracy: true,
		basePower: 50,
		category: "Physical",
		desc: "User heals equal to 1/3 of damage dealt and lowers target's Defense by 1 stage but this move cannot be used twice in a row.",
		shortDesc: "Heal 1/3 damage and lower Defense by 1 stage but can't use twice in a row.",
		name: "Burst Delta",
		gen: 9,
		pp: 5,
		noPPBoosts: true,
		priority: 1,
		flags: { mirror: 1, protect: 1, cantusetwice: 1 },
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Aeroblast', target);
		},
		onDamagePriority: 22,
		onDamage(damage, target, source, effect) {
			if (target.volatiles['substitute'] || target.volatiles['killingdoll'] || target.volatiles['orbshield']) {
				this.damage(damage, target, source, effect);
			}
		},
		drain: [1, 3],
		critRatio: 2,
		secondary: {
			chance: 100,
			boosts: {
				def: -1,
				atk: -1,
				spa: -1,
			},
		},
		target: "normal",
		type: "Flying",
	},
	// Trey
	granddelta: {
		accuracy: true,
		basePower: 120,
		category: "Physical",
		desc: "Charges, then hits turn 2. If the user is targeted by an attacking move while charging, Grand Delta's base power is halved; If not attacked, always results in a critical hit. User recoves 100% of the damage dealt.",
		shortDesc: "Charges, then hits turn 2. Halved power if hit during charge; Guaranteed crit if not.",
		name: "Grand Delta",
		gen: 9,
		pp: 1,
		noPPBoosts: true,
		priority: 6,
		isZ: "yoichisbow",
		onTryMove(attacker, defender, move) {
			if (attacker.removeVolatile(move.id)) {
				return;
			}
			this.add('-prepare', attacker, move.name);
			// @ts-ignore
			if (!this.runEvent('ChargeMove', attacker, defender, move)) {
				return;
			}
			// @ts-ignore
			attacker.addVolatile('twoturnmove', defender);
			attacker.addVolatile('deltacharge');
			return null;
		},
		onPrepareHit(target, source, move) {
			this.add('-anim', source, 'Thousand Arrows', target);
			this.add('-anim', source, 'Heal Pulse', target);
		},
		onDamage(damage, target, source, effect) {
			if (target.volatiles['substitute'] || target.volatiles['killingdoll'] || target.volatiles['orbshield']) {
				this.damage(damage, target, source, effect);
			}
			source.removeVolatile('deltacharge');
			target.side.addSideCondition('deltadrop');
		},
		drain: [1, 1],
		flags: { charge: 1 },
		target: "normal",
		type: "Flying",
	},
	// Trey
	dynamitearrow: {
		accuracy: true,
		basePower: 50,
		category: "Physical",
		desc: "Hits the next turn after being used.",
		shortDesc: "Hits next turn.",
		name: "Dynamite Arrow",
		gen: 9,
		pp: 40,
		noPPBoosts: true,
		priority: 0,
		sideCondition: 'dynamitearrow',
		flags: { mirror: 1, protect: 1, futuremove: 1 },
		condition: {
			duration: 2,
			onSideStart(targetSide) {
				this.add('-sidestart', targetSide, 'Dynamite Arrow', '[silent]');
			},
			onSideEnd(targetSide) {
				let source; let pokemon = targetSide.active[0];

				if (pokemon.fainted || !pokemon.hp) {
					this.add('-sideend', targetSide, 'Dynamite Arrow', '[silent]');
					return;
				}
				
				pokemon.addVolatile('cannotBeCrit');
				
				this.add('-anim', pokemon, 'Thousand Arrows', pokemon);
				let possibleSources = pokemon.side.foe.pokemon.filter(ally => ally.name === 'Trey' || ally.ability === 'concentration');
				if (!possibleSources || !possibleSources.length) {
					source = pokemon.side.foe.active[pokemon.side.foe.active.length - 1 - pokemon.position];
				} else {
					source = possibleSources[0];
				}

				const move = this.dex.getActiveMove('dynamitearrow');
				// @ts-ignore
				const dmg = this.actions.getDamage(source, pokemon, move);
				// @ts-ignore
				this.damage(dmg, pokemon);
				this.boost({ spe: -1 }, pokemon);

				pokemon.removeVolatile('cannotBeCrit');
				this.add('-sideend', targetSide, 'Dynamite Arrow', '[silent]');
			},
		},
		secondary: null,
		target: "normal",
		type: "Fire",
	},
	// Yukari Yakumo
	ranyakumo: {
		accuracy: true,
		basePower: 40,
		category: "Special",
		name: "Ran Yakumo",
		pp: 64,
		priority: 0,
		flags: {},
		overrideDefensiveStat: 'def',
		target: "normal",
		type: "???",
	},
	// Yukari Yakumo
	shikigamiran: {
		accuracy: true,
		basePower: 0,
		category: "Status",
		shortDdesc: "Damages foe every turn until switch/faint.",
		desc: "Damages the foe using Defense stat in calculation at the end of every turn until that Pokemon faints or another Pokemon is affected by this move.",
		name: "Shikigami Ran",
		pp: 40,
		noPPBoosts: true,
		priority: 0,
		flags: { bypasssub: 1 },
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Glare', target);
		},
		onHit(target, source, move) {
			for (const foe of target.side.pokemon) {
				if (foe.m.ran) foe.m.ran = false;
			}
			target.addVolatile('shikigamiran');
			target.m.ran = true;
		},
		condition: {
			onResidual(pokemon) {
				// Butt ugly short-term solution
				// Samples for literally every mon in the game capable of copying moves
				let sources = pokemon.side.foe.pokemon.filter(ally => ally.name === 'Yukari Yakumo' || ally.name === 'Pablo' || ally.name === 'Emerl' || ally.name === 'Finger');
				let source;
				if (!sources) {
					source = pokemon.side.foe.active[0];
				} else {
					source = sources[0];
				}
				const move = this.dex.getActiveMove('ranyakumo');
				// @ts-ignore
				const dmg = this.actions.getDamage(source, pokemon, move);
				this.add('-anim', pokemon, 'Hex', pokemon);
				this.damage(dmg, pokemon, source, this.dex.conditions.get('Ran Yakumo'));
				this.add('-message', `${pokemon.name} was buffeted by Ran Yakumo!`);
			},
		},
		secondary: null,
		target: "normal",
		type: "Fairy",
	},
	// Aeri
	blissfulbreeze: {
		accuracy: 100,
		basePower: 80,
		category: "Special",
		name: "Blissful Breeze",
		shortDesc: "Cures the party of status ailments.",
		gen: 9,
		pp: 16,
		noPPBoosts: true,
		priority: 0,
		flags: { protect: 1, mirror: 1 },
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Petal Dance', target);
		},
		onHit(target, source, move) {
			this.add('-activate', source, 'move: Blissful Breeze');
			let success = false;
			const allies = [...source.side.pokemon, ...source.side.allySide?.pokemon || []];
			for (const ally of allies) {
				if (ally.cureStatus()) success = true;
			}
			return success;
		},
		secondary: null,
		target: "normal",
		type: "Flying",
	},
};
