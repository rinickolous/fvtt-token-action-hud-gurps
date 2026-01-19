// System Module Imports
import { ACTION_TYPE } from "./constants.js"

export let ActionHandler = null

Hooks.once("tokenActionHudCoreApiReady", async coreModule => {
	/**
	 * Extends Token Action HUD Core's ActionHandler class and builds system-defined actions for the HUD
	 */
	ActionHandler = class ActionHandler extends coreModule.api.ActionHandler {
		/**
		 * Build system actions
		 * Called by Token Action HUD Core
		 * @override
		 * @param {array} groupIds
		 */
		async buildSystemActions(_groupIds) {
			// If the GURPS global is not initialized, return early
			if (!GURPS) return

			// Set actor and token variables
			// this.actors = this.actor ? [this.actor] : []
			this.actorType = this.actor?.type

			// Set items variable
			if (this.actor) {
				let items = this.actor.items
				this.items = items
			}

			if (this.actorType === "character" || this.actorType === "enemy") {
				await this.#buildCharacterActions()
			} else if (!this.actor) {
				this.#buildMultipleTokenActions()
			}
		}

		/* ---------------------------------------- */

		/**
		 * Build character actions
		 * @private
		 */
		async #buildCharacterActions() {
			this.#buildAttributeActions()
			this.#buildDefenseActions()
			this.#buildMeleeActions()
			this.#buildRangedActions()
			this.#buildSkillActions()
			this.#buildTraitActions()
			this.#buildSpellActions()
			this.#buildQuickNoteActions()
			this.#buildManeuverActions()
			this.#buildPostureActions()
		}

		/* ---------------------------------------- */

		/**
		 * Build multiple token actions
		 * @private
		 * @returns {object}
		 */
		#buildMultipleTokenActions() {}

		/* ---------------------------------------- */

		/** Build attribute actions
		 * @private
		 */
		#buildAttributeActions() {
			this.#buildAttributeRollActions()
			this.#buildPoolModifierActions()
			this.#buildSenseActions()
			this.#buildReactionActions()
			this.#buildConditionalModifierActions()
		}

		/* ---------------------------------------- */

		/** Build defense actions
		 *
		 * */
		#buildDefenseActions() {
			const actionType = ACTION_TYPE.otf

			const dodges = [
				{
					id: "defense-dodge",
					name: `${coreModule.api.Utils.i18n("GURPS.dodge")} (${this.actor.system.currentdodge})`,
					encodedValue: `@${this.actor.id}@ DODGE`,
					system: { actionType, actionId: "defense-dodge" },
				},
				{
					id: "defense-retreat-dodge",
					name: `${coreModule.api.Utils.i18n("tokenActionHud.gurps.dodgeRetreating")} (${this.actor.system.currentdodge + 3})`,
					encodedValue: `@${this.actor.id}@ DODGE +3 ${coreModule.api.Utils.i18n("GURPS.modifiers_.dodgeRetreat")}`,
					system: { actionType, actionId: "defense-retreat-dodge" },
				},
			]

			this.addActions(dodges, { id: "dodges", type: "system" })

			if (this.actor.system.equippedparry) {
				const parries = [
					{
						id: "defense-parry",
						name: `${coreModule.api.Utils.i18n("GURPS.parry")} (${this.actor.system.equippedparry})`,
						encodedValue: `@${this.actor.id}@ PARRY`,
						system: { actionType, actionId: "defense-parry" },
					},
				]

				if (this.actor.system.equippedparryisfencing) {
					parries.push({
						id: "defense-retreat-parry-fencing",
						name: `${coreModule.api.Utils.i18n("tokenActionHud.gurps.parryFencingRetreating")} (${this.actor.system.equippedparry + 3})`,
						encodedValue: `@${this.actor.id}@ PARRY +3 ${coreModule.api.Utils.i18n("GURPS.modifiers_.fencingRetreat")}`,
						system: { actionType, actionId: "defense-retreat-parry" },
					})
				} else {
					parries.push({
						id: "defense-retreat-parry",
						name: `${coreModule.api.Utils.i18n("tokenActionHud.gurps.parryRetreating")} (${this.actor.system.equippedparry + 1})`,
						encodedValue: `@${this.actor.id}@ PARRY +1 ${coreModule.api.Utils.i18n("GURPS.modifiers_.blockRetreat")}`,
						system: { actionType, actionId: "defense-retreat-parry" },
					})
				}

				this.addActions(parries, { id: "parries", type: "system" })
			}

			if (this.actor.system.equippedblock) {
				const blocks = [
					{
						id: "defense-block",
						name: `${coreModule.api.Utils.i18n("GURPS.block")} (${this.actor.system.equippedblock})`,
						encodedValue: `@${this.actor.id}@ BLOCK`,
						system: { actionType, actionId: "defense-block" },
					},
					{
						id: "defense-retreat-block",
						name: `${coreModule.api.Utils.i18n("tokenActionHud.gurps.blockRetreating")} (${this.actor.system.equippedblock + 1})`,
						// GURPS.modifiers_.blockRetreat is generally rendered as "Retreating Block/Parry" so this is ok.
						encodedValue: `@${this.actor.id}@ BLOCK +1 ${coreModule.api.Utils.i18n("GURPS.modifiers_.blockRetreat")}`,
						system: { actionType, actionId: "defense-retreat-block" },
					},
				]

				this.addActions(blocks, { id: "blocks", type: "system" })
			}
		}

		/* ---------------------------------------- */

		#buildAttributeRollActions() {
			const actionType = ACTION_TYPE.attribute

			const useQuintessence = game.settings?.get("gurps", "use-quintessence") === true

			const attributeActions = Object.entries(this.actor.system.attributes).reduce((acc, [key, value]) => {
				if (key.toLowerCase() === "qn" && !useQuintessence) return acc

				acc.push({
					id: key,
					name: `${key} (${value.value})`,
					listName: `LIST ${key}`,
					system: { actionType, actionId: key },
				})

				return acc
			}, [])
			this.addActions(attributeActions, { id: "attributes", type: "system" })
		}

		/* ---------------------------------------- */

		#buildPoolModifierActions() {
			const actionType = ACTION_TYPE.otf

			function getModifierActions(key, _value) {
				return [
					{
						id: `increase-${key}`,
						name: `${key.toUpperCase()} +1`,
						listName: `${key.toUpperCase()} +1`,
						system: { actionType, actionId: key },
						encodedValue: `/${key} +1`,
					},
					{
						id: `decrease-${key}`,
						name: `${key.toUpperCase()} -1`,
						listName: `${key.toUpperCase()} -1`,
						system: { actionType, actionId: key },
						encodedValue: `/${key} -1`,
					},
				]
			}

			const poolModifierActions = []
			poolModifierActions.push(...getModifierActions("hp", this.actor.system.HP))
			poolModifierActions.push(...getModifierActions("fp", this.actor.system.FP))

			if (game.settings?.get("gurps", "use-quintessence") === true) {
				poolModifierActions.push(...getModifierActions("qp", this.actor.system.QP))
			}

			this.addActions(poolModifierActions, { id: "poolModifiers", type: "system" })
		}

		/* ---------------------------------------- */

		#buildSenseActions() {
			const actionType = ACTION_TYPE.otf

			const senses = {
				vision: this.actor.system.vision,
				hearing: this.actor.system.hearing,
				tasteSmell: this.actor.system.tastesmell,
				touch: this.actor.system.touch,
			}

			const senseActions = Object.entries(senses).reduce((acc, [key, value]) => {
				const name = coreModule.api.Utils.i18n("tokenActionHud.gurps." + key)
				acc.push({
					id: key,
					name: `${name} (${value})`,
					encodedValue: `@${this.actor.id}@${name}`,
					system: { actionType, actionId: key },
				})

				return acc
			}, [])

			this.addActions(senseActions, { id: "senses", type: "system" })
		}

		/* ---------------------------------------- */

		/** Build reaction actions
		 * @private
		 */
		#buildReactionActions() {
			if (Object.keys(this.actor.system.reactions).length === 0) return

			const actionType = ACTION_TYPE.otf
			const reactions = []

			GURPS.recurselist(this.actor.system.reactions, (e, k, _d) => {
				if (isNaN(parseInt(e.modifier))) return
				const modifier = parseInt(e.modifier) > 0 ? `+${e.modifier}` : e.modifier

				reactions.push({
					id: `reaction-${k}`,
					name: `${modifier} ${e.situation}`,
					encodedValue: `@${this.actor.id}@[${modifier} ${e.situation}]`,
					system: { actionType, actionId: `reaction-${k}` },
				})
			})

			this.addActions(reactions, { id: "reactions", type: "system" })
		}

		/* ---------------------------------------- */

		/** Build reaction actions
		 * @private
		 */
		#buildConditionalModifierActions() {
			if (Object.keys(this.actor.system.conditionalmods).length === 0) return

			const actionType = ACTION_TYPE.otf
			const conditionalModifiers = []

			GURPS.recurselist(this.actor.system.conditionalmods, (e, k, _d) => {
				if (isNaN(parseInt(e.modifier))) return
				const modifier = parseInt(e.modifier) > 0 ? `+${e.modifier}` : e.modifier

				conditionalModifiers.push({
					id: `conditionalModifier-${k}`,
					name: `${modifier} ${e.situation}`,
					encodedValue: `@${this.actor.id}@ ${modifier} ${e.situation}`,
					system: { actionType, actionId: `conditionalModifier-${k}` },
				})
			})

			this.addActions(conditionalModifiers, { id: "conditionalModifiers", type: "system" })
		}

		/* ---------------------------------------- */

		/** Build melee attack actions
		 * @private
		 */
		#buildMeleeActions() {
			if (Object.keys(this.actor.system.melee).length === 0) return

			const actionType = ACTION_TYPE.otf

			GURPS.recurselist(this.actor.system.melee, (e, k, _d) => {
				const q = e.name.includes('"') ? "'" : '"'
				const usage = e.mode ? ` (${e.mode})` : ""
				const name = `${e.name}${usage}`

				const itemGroup = {
					id: `melee-${k}`,
					name: name,
					type: "system",
				}
				this.addGroup(itemGroup, { id: "melee", type: "system" }, true)
				const notes = this.#getActionsFromNotes(e.notes, `melee-${k}`)

				this.addActions(
					[
						{
							id: `melee-${k}-attack`,
							name: `${coreModule.api.Utils.i18n("tokenActionHud.gurps.attack")} (${e.level})`,
							encodedValue: `@${this.actor.id}@M:${q + name + q}|@system.melee.${k}`,
							system: { actionType, actionId: `melee-${k}-attack` },
						},
					],
					itemGroup
				)

				if (!isNaN(parseInt(e.parry))) {
					this.addActions(
						[
							{
								id: `melee-${k}-parry`,
								name: `${coreModule.api.Utils.i18n("tokenActionHud.gurps.parry")} (${e.parry})`,
								encodedValue: `@${this.actor.id}@P:${q + name + q}|@system.melee.${k}`,
								system: { actionType, actionId: `melee-${k}-parry` },
							},
						],
						itemGroup
					)
				}

				if (!isNaN(parseInt(e.block))) {
					this.addActions(
						[
							{
								id: `melee-${k}-block`,
								name: `${coreModule.api.Utils.i18n("tokenActionHud.gurps.block")} (${e.block})`,
								encodedValue: `@${this.actor.id}@B:${q + name + q}|@system.melee.${k}`,
								system: { actionType, actionId: `melee-${k}-block` },
							},
						],
						itemGroup
					)
				}

				this.addActions(
					[
						{
							id: `melee-${k}-damage`,
							name: `${coreModule.api.Utils.i18n("tokenActionHud.gurps.damage")} (${e.damage})`,
							encodedValue: `@${this.actor.id}@D:${q + name + q}|@system.melee.${k}`,
							system: { actionType, actionId: `melee-${k}-damage` },
						},
						...notes,
					],
					itemGroup
				)
			})
		}

		/* ---------------------------------------- */

		/** Build ranged attack actions
		 * @private
		 * */
		#buildRangedActions() {
			if (Object.keys(this.actor.system.ranged).length === 0) return

			const actionType = ACTION_TYPE.otf

			GURPS.recurselist(this.actor.system.ranged, (e, k, _d) => {
				const q = e.name.includes('"') ? "'" : '"'
				const usage = e.mode ? ` (${e.mode})` : ""
				const name = `${e.name}${usage}`

				const itemGroup = {
					id: `ranged-${k}`,
					name: name,
					type: "system",
				}
				this.addGroup(itemGroup, { id: "ranged", type: "system" }, true)
				const notes = this.#getActionsFromNotes(e.notes, `ranged-${k}`)

				this.addActions(
					[
						{
							id: `ranged-${k}-attack`,
							name: `${coreModule.api.Utils.i18n("tokenActionHud.gurps.attack")} (${e.level})`,
							encodedValue: `@${this.actor.id}@R:${q + name.trim() + q}|@system.ranged.${k}`,
							system: { actionType, actionId: `ranged-${k}-attack` },
						},
					],
					itemGroup
				)

				if (!isNaN(parseInt(e.acc))) {
					const acc = parseInt(e.acc) > 0 ? `+${e.acc}` : e.acc
					this.addActions(
						[
							{
								id: `ranged-${k}-acc`,
								name: `${coreModule.api.Utils.i18n("tokenActionHud.gurps.acc")} (${acc})`,
								encodedValue: `@${this.actor.id}@${acc} Acc for ${e.name}`,
								system: { actionType, actionId: `ranged-${k}-acc` },
							},
						],
						itemGroup
					)
				}

				if (!isNaN(parseInt(e.bulk))) {
					const bulk = parseInt(e.bulk) > 0 ? `+${e.bulk}` : e.bulk
					this.addActions(
						[
							{
								id: `ranged-${k}-bulk`,
								name: `${coreModule.api.Utils.i18n("tokenActionHud.gurps.bulk")} (${bulk})`,
								encodedValue: `@${this.actor.id}@${bulk} Bulk for ${e.name}`,
								system: { actionType, actionId: `ranged-${k}-bulk` },
							},
						],
						itemGroup
					)
				}

				this.addActions(
					[
						{
							id: `ranged-${k}-damage`,
							name: `${coreModule.api.Utils.i18n("tokenActionHud.gurps.damage")} (${e.damage})`,
							encodedValue: `@${this.actor.id}@D:${q + name + q}|@system.ranged.${k}`,
							system: { actionType, actionId: `ranged-${k}-damage` },
						},
						...notes,
					],
					itemGroup
				)
			})
		}

		/* ---------------------------------------- */

		/** Get actions from notes
		 * @returns {array} The actions
		 * @private
		 */
		#getActionsFromNotes(notes, prefix) {
			const actions = []

			if (notes && notes.length > 0) {
				GURPS.gurpslink(notes, false, true).forEach(action => {
					const id = `${prefix}-note-${actions.length}`

					const parser = new DOMParser()
					const doc = parser.parseFromString(action.text, "text/html")
					const text = doc.body.firstChild.innerText

					actions.push({
						id,
						name: text,
						cssClass: "gurps-otf",
						encodedValue: action.action.orig,
						system: {
							actionType: ACTION_TYPE.otf,
							actionId: id,
						},
					})
				})
			}

			return actions
		}

		/* ---------------------------------------- */

		/** Build skill actions
		 * @private
		 */
		#buildSkillActions() {
			const actionType = ACTION_TYPE.otf

			const rootList = { id: "skills", type: "system" }
			const uncategorizedList = {
				id: "skills_uncategorized",
				name: coreModule.api.Utils.i18n("tokenActionHud.gurps.uncategorized"),
				type: "system",
			}

			this.addGroup(uncategorizedList, rootList)

			if (Object.keys(this.actor.system.skills).length === 0) return

			GURPS.recurselist(this.actor.system.skills, (e, _k, _d) => {
				const q = e.name.includes('"') ? "'" : '"'
				const id = e.uuid

				if (Object.keys(e.contains).length > 0) {
					const list = e.parentuuid !== "" ? { id: e.parentuuid, type: "system" } : rootList
					this.addGroup({ id, name: e.name, type: "system" }, list, true)
				} else {
					const list = e.parentuuid !== "" ? { id: e.parentuuid, type: "system" } : uncategorizedList
					const notes = this.#getActionsFromNotes(e.notes, `skill-${id}`)

					this.addActions(
						[
							{
								id,
								name: `${e.name} (${e.level})`,
								encodedValue: `@${this.actor.id}@Sk:${q + e.name + q}`,
								system: { actionType, actionId: id },
							},
							...notes,
						],
						list
					)
				}
			})
		}

		/* ---------------------------------------- */

		/** Build trait actions
		 * @private
		 */
		#buildTraitActions() {
			const actionType = ACTION_TYPE.otf

			if (Object.keys(this.actor.system.ads).length === 0) return

			GURPS.recurselist(this.actor.system.ads, (e, k, _d) => {
				const actions = this.#getActionsFromNotes(e.notes, `trait-${k}`)
				if (actions.length > 0) {
					const id = `trait-${k}`

					this.addGroup({ id, name: e.name, type: "system" }, { id: "traits", type: "system" }, true)
					this.addActions(
						actions.map(action => ({
							...action,
							id: `${id}-${action.id}`,
							system: { actionType, actionId: `${id}-${action.id}` },
						})),
						{ id, name: e.name, type: "system" }
					)
				}
			})
		}

		/* ---------------------------------------- */

		/** Build spell actions
		 * @private
		 */
		#buildSpellActions() {
			const actionType = ACTION_TYPE.otf

			const rootList = { id: "spells", type: "system" }
			const uncategorizedList = { id: "spells_uncategorized", name: "Uncategorized", type: "system" }
			this.addGroup(uncategorizedList, rootList)

			if (Object.keys(this.actor.system.spells).length === 0) return

			GURPS.recurselist(this.actor.system.spells, (e, _k, _d) => {
				const q = e.name.includes('"') ? "'" : '"'
				const id = e.uuid

				if (Object.keys(e.contains).length > 0) {
					const list = e.parentuuid !== "" ? { id: e.parentuuid, type: "system" } : rootList
					this.addGroup({ id, name: e.name, type: "system" }, list, true)
				} else {
					const list = e.parentuuid !== "" ? { id: e.parentuuid, type: "system" } : uncategorizedList
					const notes = this.#getActionsFromNotes(e.notes, `spell-${id}`)

					this.addActions(
						[
							{
								id,
								name: `${e.name} (${e.level})`,
								encodedValue: `@${this.actor.id}@Sp:${q + e.name + q}`,
								system: { actionType, actionId: id },
							},
							...notes,
						],
						list
					)
				}
			})
		}

		/* ---------------------------------------- */

		/** Build skill actions
		 * @private
		 */
		#buildQuickNoteActions() {
			const rootList = { id: "quickNotes", type: "system" }
			const uncategorizedList = {
				id: "quickNotes_uncategorized",
				name: coreModule.api.Utils.i18n("tokenActionHud.gurps.quickNotes"),
				type: "system",
			}
			this.addGroup(uncategorizedList, rootList)

			const notes = this.#getActionsFromNotes(this.actor.system.additionalresources.qnotes, "quickNote")
			this.addActions(notes, uncategorizedList)
		}

		/* ---------------------------------------- */

		#buildManeuverActions() {
			if (!this.actor.inCombat) return

			const actions = Object.entries(GURPS.Maneuvers.getAllData()).map(([id, maneuver]) => {
				const name = coreModule.api.Utils.i18n(maneuver.label)

				return {
					id: `maneuver-${id}`,
					name,
					img: maneuver.icon,
					encodedValue: `@${this.actor.id}@ /man ${name}`,
					system: {
						actionType: ACTION_TYPE.otf,
						actionId: `maneuver-${id}`,
					},
				}
			})

			this.addActions(actions, { id: "maneuvers", type: "system" })
		}

		/* ---------------------------------------- */

		#buildPostureActions() {
			const actions = Object.entries(GURPS.StatusEffect.getAllPostures()).map(([id, posture]) => {
				return {
					id: `posture-${id}`,
					name: coreModule.api.Utils.i18n(posture.name),
					img: posture.img,
					encodedValue: `@${this.actor.id}@ /st + ${id}`,
					system: {
						actionType: ACTION_TYPE.otf,
						actionId: `posture-${id}`,
					},
				}
			})

			this.addActions(
				[
					{
						id: "posture-standing",
						name: coreModule.api.Utils.i18n("GURPS.status.Standing"),
						img: "systems/gurps/icons/statuses/dd-condition-standing.webp",
						encodedValue: `@${this.actor.id}@ /st + standing`,
						system: {
							actionType: ACTION_TYPE.otf,
							actionId: "posture-standing",
						},
					},
					...actions,
				],
				{ id: "posture", type: "system" }
			)
		}
	}
})
