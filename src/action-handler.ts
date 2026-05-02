import { ACTION_TYPE } from "./constants.ts"

export let ActionHandler: any = null

Hooks.once("tokenActionHudCoreApiReady", async (coreModule: any) => {
	ActionHandler = class ActionHandler extends coreModule.api.ActionHandler {
		async buildSystemActions(_groupIds: string[]): Promise<void> {
			if (!GURPS) return

			this.actorType = this.actor?.type

			if (this.actor) {
				this.items = this.actor.items
			}

			if (this.actorType === "character" || this.actorType === "enemy") {
				await this.#buildCharacterActions()
			} else if (!this.actor) {
				this.#buildMultipleTokenActions()
			}
		}

		/* ---------------------------------------- */

		async #buildCharacterActions(): Promise<void> {
			this.#buildAttributeActions()
			this.#buildDefenseActions()
			this.#buildMeleeActions()
			this.#buildRangedActions()
			this.#buildTraitActions()
			this.#buildSkillActions()
			this.#buildSpellActions()
			this.#buildEquipmentActions()
			this.#buildQuickNoteActions()
			this.#buildManeuverActions()
			this.#buildPostureActions()
		}

		/* ---------------------------------------- */

		#buildMultipleTokenActions(): void {}

		/* ---------------------------------------- */

		#buildAttributeActions(): void {
			this.#buildAttributeRollActions()
			this.#buildPoolModifierActions()
			this.#buildSenseActions()
			this.#buildReactionActions()
			this.#buildConditionalModifierActions()
		}

		/* ---------------------------------------- */

		#buildDefenseActions(): void {
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

			GURPS.recurselist(this.actor.system.melee, (e: any, k: string, _d: any) => {
				const q = e.name.includes('"') ? "'" : '"'
				const usage = e.mode ? ` (${e.mode})` : ""
				const name = `${e.name}${usage}`
				const itemGroup = {
					id: `defense-${k}`,
					name: name,
					type: "system",
				}

				this.addGroup(itemGroup, { id: "defenses", type: "system" }, true)

				if (!isNaN(parseInt(e.parry))) {
					const parry = parseInt(e.parry)
					this.addActions(
						[
							{
								id: `defense-${k}-parry`,
								name: `${coreModule.api.Utils.i18n("tokenActionHud.gurps.parry")} (${parry})`,
								encodedValue: `@${this.actor.id}@P:${q + name + q}|@system.melee.${k}`,
								system: { actionType, actionId: `defense-${k}-parry` },
							},
						],
						itemGroup
					)

					const isFencing = e.parry.toString().toLowerCase().endsWith("f")
					if (isFencing) {
						this.addActions(
							[
								{
									id: `defense-${k}-parry-fencing`,
									name: `${coreModule.api.Utils.i18n("tokenActionHud.gurps.parryFencingRetreating")} (${parry + 3})`,
									encodedValue: `@${this.actor.id}@P:${q + name + q} +3 ${coreModule.api.Utils.i18n("GURPS.modifiers_.fencingRetreat")}|@system.melee.${k}`,
									system: { actionType, actionId: `defense-${k}-parry-fencing` },
								},
							],
							itemGroup
						)
					} else {
						this.addActions(
							[
								{
									id: `defense-${k}-parry-retreat`,
									name: `${coreModule.api.Utils.i18n("tokenActionHud.gurps.parryRetreating")} (${parry + 1})`,
									encodedValue: `@${this.actor.id}@P:${q + name + q} +1 ${coreModule.api.Utils.i18n("GURPS.modifiers_.blockRetreat")}|@system.melee.${k}`,
									system: { actionType, actionId: `defense-${k}-parry-retreat` },
								},
							],
							itemGroup
						)
					}
				}

				if (!isNaN(parseInt(e.block))) {
					const block = parseInt(e.block)
					this.addActions(
						[
							{
								id: `defense-${k}-block`,
								name: `${coreModule.api.Utils.i18n("tokenActionHud.gurps.block")} (${block})`,
								encodedValue: `@${this.actor.id}@B:${q + name + q}|@system.melee.${k}`,
								system: { actionType, actionId: `defense-${k}-block` },
							},
							{
								id: `defense-${k}-block-retreat`,
								name: `${coreModule.api.Utils.i18n("tokenActionHud.gurps.blockRetreating")} (${block + 1})`,
								encodedValue: `@${this.actor.id}@B:${q + name + q} +1 ${coreModule.api.Utils.i18n("GURPS.modifiers_.blockRetreat")}|@system.melee.${k}`,
								system: { actionType, actionId: `defense-${k}-block` },
							},
						],
						itemGroup
					)
				}
			})
		}

		/* ---------------------------------------- */

		#buildAttributeRollActions(): void {
			const actionType = ACTION_TYPE.attribute

			const useQuintessence = (game.settings?.get("gurps", "use-quintessence") as unknown as boolean) === true

			const attributeActions = Object.entries(this.actor.system.attributes).reduce(
				(acc: any[], [key, value]: [string, any]) => {
					if (key.toLowerCase() === "qn" && !useQuintessence) return acc

					acc.push({
						id: key,
						name: `${key} (${value.value})`,
						listName: `LIST ${key}`,
						system: { actionType, actionId: key },
					})

					return acc
				},
				[]
			)
			this.addActions(attributeActions, { id: "attributes", type: "system" })
		}

		/* ---------------------------------------- */

		#buildPoolModifierActions(): void {
			const actionType = ACTION_TYPE.otf

			function getModifierActions(key: string, _value: any): any[] {
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

			const poolModifierActions: any[] = []
			poolModifierActions.push(...getModifierActions("hp", this.actor.system.HP))
			poolModifierActions.push(...getModifierActions("fp", this.actor.system.FP))

			if ((game.settings?.get("gurps", "use-quintessence") as unknown as boolean) === true) {
				poolModifierActions.push(...getModifierActions("qp", this.actor.system.QP))
			}

			this.addActions(poolModifierActions, { id: "poolModifiers", type: "system" })
		}

		/* ---------------------------------------- */

		#buildSenseActions(): void {
			const actionType = ACTION_TYPE.otf

			const senses: Record<string, any> = {
				vision: this.actor.system.vision,
				hearing: this.actor.system.hearing,
				tasteSmell: this.actor.system.tastesmell,
				touch: this.actor.system.touch,
			}

			const senseActions = Object.entries(senses).reduce((acc: any[], [key, value]) => {
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

		#buildReactionActions(): void {
			if (!this.actor.system.reactions || Object.keys(this.actor.system.reactions).length === 0) return

			const actionType = ACTION_TYPE.otf
			const reactions: any[] = []

			GURPS.recurselist(this.actor.system.reactions, (e: any, k: string, _d: any) => {
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

		#buildConditionalModifierActions(): void {
			if (!this.actor.system.conditionalmods || Object.keys(this.actor.system.conditionalmods).length === 0) return

			const actionType = ACTION_TYPE.otf
			const conditionalModifiers: any[] = []

			GURPS.recurselist(this.actor.system.conditionalmods, (e: any, k: string, _d: any) => {
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

		#buildMeleeActions(): void {
			if (Object.keys(this.actor.system.melee).length === 0) return

			const actionType = ACTION_TYPE.otf

			GURPS.recurselist(this.actor.system.melee, (e: any, k: string, _d: any) => {
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

		#buildRangedActions(): void {
			if (Object.keys(this.actor.system.ranged).length === 0) return

			const actionType = ACTION_TYPE.otf

			GURPS.recurselist(this.actor.system.ranged, (e: any, k: string, _d: any) => {
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

		#getActionsFromNotes(notes: string, prefix: string): any[] {
			const actions: any[] = []

			if (notes && notes.length > 0) {
				GURPS.gurpslink(notes, false, true).forEach((action: any) => {
					const id = `${prefix}-note-${actions.length}`

					const parser = new DOMParser()
					const doc = parser.parseFromString(action.text, "text/html")
					const text = (doc.body.firstChild as HTMLElement)?.innerText

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

		#buildTraitActions(): void {
			const actionType = ACTION_TYPE.otf

			if (Object.keys(this.actor.system.ads).length === 0) return

			GURPS.recurselist(this.actor.system.ads, (e: any, k: string, _d: any) => {
				const actions = this.#getActionsFromNotes(e.notes, `trait-${k}`)
				if (actions.length > 0) {
					const id = `trait-${k}`

					this.addGroup({ id, name: e.name, type: "system" }, { id: "traits", type: "system" }, true)
					this.addActions(
						actions.map((action: any) => ({
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

		#buildSkillActions(): void {
			const actionType = ACTION_TYPE.otf

			const rootList = { id: "skills", type: "system" }
			const uncategorizedList = {
				id: "skills_uncategorized",
				name: coreModule.api.Utils.i18n("tokenActionHud.gurps.uncategorized"),
				type: "system",
			}

			this.addGroup(uncategorizedList, rootList)

			if (Object.keys(this.actor.system.skills).length === 0) return

			GURPS.recurselist(this.actor.system.skills, (e: any, _k: string, _d: any) => {
				const q = e.name.includes('"') ? "'" : '"'
				const id = e.uuid

				const isContainer = Object.keys(e.contains).length > 0 || e.level === ""

				if (isContainer) {
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

		#buildSpellActions(): void {
			const actionType = ACTION_TYPE.otf

			const rootList = { id: "spells", type: "system" }
			const uncategorizedList = { id: "spells_uncategorized", name: "Uncategorized", type: "system" }
			this.addGroup(uncategorizedList, rootList)

			if (Object.keys(this.actor.system.spells).length === 0) return

			GURPS.recurselist(this.actor.system.spells, (e: any, _k: string, _d: any) => {
				const q = e.name.includes('"') ? "'" : '"'
				const id = e.uuid

				const isContainer = Object.keys(e.contains).length > 0 || e.level === ""

				if (isContainer) {
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

		#buildEquipmentActions(): void {
			const actionType = ACTION_TYPE.otf

			if (
				Object.keys(this.actor.system.equipment.carried).length === 0 &&
				Object.keys(this.actor.system.equipment.other).length === 0
			)
				return

			GURPS.recurselist(this.actor.system.equipment.carried, (e: any, k: string, _d: string) => {
				const actions = this.#getActionsFromNotes(e.notes, `equipment-carried-${k}`)

				if (actions.length > 0) {
					const id = `equipment-carried-${k}`

					console.log(id)

					this.addGroup({ id, name: e.name, type: "system" }, { id: "equipment", type: "system" }, true)
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

			GURPS.recurselist(this.actor.system.equipment.other, (e: any, k: string, _d: string) => {
				const actions = this.#getActionsFromNotes(e.notes, `equipment-other-${k}`)

				if (actions.length > 0) {
					const id = `equipment-other-${k}`

					this.addGroup({ id, name: e.name, type: "system" }, { id: "equipment", type: "system" }, true)
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

		#buildQuickNoteActions(): void {
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

		#buildManeuverActions(): void {
			if (!this.actor.inCombat) return

			const actions = Object.entries(GURPS.Maneuvers.getAllData()).map(([id, maneuver]: [string, any]) => {
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

		#buildPostureActions(): void {
			const actions = Object.entries(GURPS.StatusEffect.getAllPostures()).map(([id, posture]: [string, any]) => {
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
