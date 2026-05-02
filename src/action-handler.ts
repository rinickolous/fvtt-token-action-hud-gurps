import { ACTION_TYPE } from "./constants.ts"
import { ActorType } from "./enum.ts"

export let ActionHandler: any = null

Hooks.once("tokenActionHudCoreApiReady", async (coreModule: any) => {
	ActionHandler = class ActionHandler extends coreModule.api.ActionHandler {
		async buildSystemActions(_groupIds: string[]): Promise<void> {
			if (!GURPS) return

			this.actorType = this.actor?.type

			if (this.actor) {
				this.items = this.actor.items
			}

			if (this.actorType === ActorType.Character) {
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

			this.actor.system.meleeV2.forEach((melee: any) => {
				const id = melee.id
				const displayItem = melee.toDisplayItem()

				const itemGroup = {
					id: `defense-${id}`,
					name: melee._displayName,
					type: "system",
				}

				this.addGroup(itemGroup, { id: "defenses", type: "system" }, true)

				if (melee.parry.canParry) {
					const parry = melee.parryLevel

					const fencingId = melee.parry.fencing ? `defense-${id}-parry-fencing` : `defense-${id}-parry-retreat`

					const fencingName = melee.parry.fencing
						? `${coreModule.api.Utils.i18n("tokenActionHud.gurps.parryFencingRetreating")} (${parry + 3})`
						: `${coreModule.api.Utils.i18n("tokenActionHud.gurps.parryRetreating")} (${parry + 1})`

					this.addActions(
						[
							{
								id: `defense-${id}-parry`,
								name: `${coreModule.api.Utils.i18n("tokenActionHud.gurps.parry")} (${parry})`,
								encodedValue: displayItem.otf.parry,
								system: { actionType, actionId: `defense-${id}-parry` },
							},
							{
								id: fencingId,
								name: fencingName,
								encodedValue: displayItem.otf.parryFencing,
								system: { actionType, actionId: `defense-${id}-parry` },
							},
						],
						itemGroup
					)
				}

				if (melee.block.canBlock) {
					const block = melee.blockLevel

					this.addActions(
						[
							{
								id: `defense-${id}-block`,
								name: `${coreModule.api.Utils.i18n("tokenActionHud.gurps.block")} (${block})`,
								encodedValue: melee.otf.block,
								system: { actionType, actionId: `defense-${id}-block` },
							},
							{
								id: `defense-${id}-block-retreat`,
								name: `${coreModule.api.Utils.i18n("tokenActionHud.gurps.blockRetreating")} (${block + 1})`,
								encodedValue: melee.otf.blockRetreat,
								system: { actionType, actionId: `defense-${id}-block` },
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
			const actionType = ACTION_TYPE.otf
			const reactions: any[] = []

			this.actor.system.reactions.forEach((reaction: any) => {
				if (reaction.modifier === 0) return
				const modifier = reaction.modifier.signedString()
				const displayItem = reaction.toDisplayItem()

				reactions.push({
					id: `reaction-${reaction.id}`,
					name: `${modifier} ${reaction.situation}`,
					encodedValue: displayItem.otf.modifier,
					system: { actionType, actionId: `reaction-${reaction.id}` },
				})
			})

			this.addActions(reactions, { id: "reactions", type: "system" })
		}

		/* ---------------------------------------- */

		#buildConditionalModifierActions(): void {
			const actionType = ACTION_TYPE.otf
			const conditionalModifiers: any[] = []

			this.actor.system.conditionalmods.forEach((condMod: any) => {
				if (condMod.modifier === 0) return
				const modifier = condMod.modifier.signedString()
				const displayItem = condMod.toDisplayItem()

				conditionalModifiers.push({
					id: `conditionalModifier-${condMod.id}`,
					name: `${modifier} ${condMod.situation}`,
					encodedValue: displayItem.otf.modifier,
					system: { actionType, actionId: `conditionalModifier-${condMod.id}` },
				})
			})

			this.addActions(conditionalModifiers, { id: "conditionalModifiers", type: "system" })
		}

		/* ---------------------------------------- */

		#buildMeleeActions(): void {
			const actionType = ACTION_TYPE.otf

			this.actor.system.meleeV2.forEach((melee: any) => {
				const id = melee.id
				const displayItem = melee.toDisplayItem()

				const itemGroup = {
					id: `melee-${id}`,
					name: melee._displayName,
					type: "system",
				}

				this.addGroup(itemGroup, { id: "melee", type: "system" }, true)

				this.addActions(
					[
						{
							id: `melee-${id}-attack`,
							name: `${coreModule.api.Utils.i18n("tokenActionHud.gurps.attack")} (${melee.level})`,
							encodedValue: displayItem.otf.level,
							system: { actionType, actionId: `melee-${id}-attack` },
						},
					],
					itemGroup
				)

				if (melee.parry.canParry) {
					const parry = melee.parryLevel

					const fencingId = melee.parry.fencing ? `defense-${id}-parry-fencing` : `defense-${id}-parry-retreat`

					const fencingName = melee.parry.fencing
						? `${coreModule.api.Utils.i18n("tokenActionHud.gurps.parryFencingRetreating")} (${parry + 3})`
						: `${coreModule.api.Utils.i18n("tokenActionHud.gurps.parryRetreating")} (${parry + 1})`

					this.addActions(
						[
							{
								id: `defense-${id}-parry`,
								name: `${coreModule.api.Utils.i18n("tokenActionHud.gurps.parry")} (${parry})`,
								encodedValue: displayItem.otf.parry,
								system: { actionType, actionId: `defense-${id}-parry` },
							},
							{
								id: fencingId,
								name: fencingName,
								encodedValue: displayItem.otf.parryFencing,
								system: { actionType, actionId: `defense-${id}-parry` },
							},
						],
						itemGroup
					)
				}

				if (melee.block.canBlock) {
					const block = melee.blockLevel

					this.addActions(
						[
							{
								id: `defense-${id}-block`,
								name: `${coreModule.api.Utils.i18n("tokenActionHud.gurps.block")} (${block})`,
								encodedValue: melee.otf.block,
								system: { actionType, actionId: `defense-${id}-block` },
							},
							{
								id: `defense-${id}-block-retreat`,
								name: `${coreModule.api.Utils.i18n("tokenActionHud.gurps.blockRetreating")} (${block + 1})`,
								encodedValue: melee.otf.blockRetreat,
								system: { actionType, actionId: `defense-${id}-block` },
							},
						],
						itemGroup
					)
				}

				const notes = this.#getActionsFromNotes(melee.notes, `melee-${id}`)

				this.addActions(
					[
						{
							id: `melee-${id}-damage`,
							name: `${coreModule.api.Utils.i18n("tokenActionHud.gurps.damage")} (${[...melee.damage].join(" ")})`,
							encodedValue: displayItem.otf.damage,
							system: { actionType, actionId: `melee-${id}-damage` },
						},
						...notes,
					],
					itemGroup
				)
			})
		}

		/* ---------------------------------------- */

		#buildRangedActions(): void {
			const actionType = ACTION_TYPE.otf

			this.actor.system.rangedV2.forEach((ranged: any) => {
				const id = ranged.id
				const displayItem = ranged.toDisplayItem()

				const itemGroup = {
					id: `ranged-${id}`,
					name: ranged._displayName,
					type: "system",
				}

				this.addGroup(itemGroup, { id: "ranged", type: "system" }, true)

				this.addActions(
					[
						{
							id: `ranged-${id}-attack`,
							name: `${coreModule.api.Utils.i18n("tokenActionHud.gurps.attack")} (${ranged.level})`,
							encodedValue: displayItem.otf.level,
							system: { actionType, actionId: `ranged-${id}-attack` },
						},
					],
					itemGroup
				)

				if (ranged.acc.base !== 0 || ranged.acc.scope !== 0) {
					const acc = ranged.accText

					this.addActions(
						[
							{
								id: `ranged-${id}-acc`,
								name: `${coreModule.api.Utils.i18n("tokenActionHud.gurps.acc")} (${acc})`,
								encodedValue: `@${this.actor.id}@${acc} ${coreModule.api.Utils.i18n("GURPS.accForWeapon", { weapon: ranged._displayName })}`,
								system: { actionType, actionId: `ranged-${id}-acc` },
							},
						],
						itemGroup
					)
				}

				if (ranged.bulk.normal !== 0 || ranged.bulk.giant !== 0) {
					const bulk = ranged.bulkText

					this.addActions(
						[
							{
								id: `ranged-${id}-bulk`,
								name: `${coreModule.api.Utils.i18n("tokenActionHud.gurps.bulk")} (${bulk})`,
								encodedValue: `@${this.actor.id}@${bulk} ${coreModule.api.Utils.i18n("GURPS.bulkForWeapon", { weapon: ranged._displayName })}`,
								system: { actionType, actionId: `ranged-${id}-bulk` },
							},
						],
						itemGroup
					)
				}

				const notes = this.#getActionsFromNotes(ranged.notes, `ranged-${id}`)

				this.addActions(
					[
						{
							id: `ranged-${id}-damage`,
							name: `${coreModule.api.Utils.i18n("tokenActionHud.gurps.damage")} (${[...ranged.damage].join(" ")})`,
							encodedValue: displayItem.otf.damage,
							system: { actionType, actionId: `ranged-${id}-damage` },
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
				GURPS.gurpslink(notes, true)?.forEach((action: any) => {
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

			this.actor.system.allAdsV2.forEach((trait: any) => {
				const id = `trait-${trait.id}`
				const actions = this.#getActionsFromNotes(trait.system.notes, id)

				if (trait.system.cr !== null) {
					const displayItem = trait.system.toDisplayItem()

					actions.push({
						id: `${id}-cr`,
						name: coreModule.api.Utils.i18n(displayItem.cr),
						encodedValue: displayItem.otf.cr,
						system: { actionType, actionId: `${id}-cr` },
					})
				}

				if (actions.length > 0) {
					this.addGroup({ id, name: trait.name, type: "system" }, { id: "traits", type: "system" }, true)
					this.addActions(
						actions.map((action: any) => ({
							...action,
							id: `${id}-${action.id}`,
							system: { actionType, actionId: `${id}-${action.id}` },
						})),
						{ id, name: trait.name, type: "system" }
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

			const addActionsForSkill = (skill: any) => {
				const id = skill.id

				if (skill.system.isContainer) {
					const list = skill.system.containedBy ? { id: skill.system.containedBy, type: "system" } : rootList
					this.addGroup({ id, name: skill.name, type: "system" }, list, true)

					skill.system.children.forEach((childSkill: any) => {
						addActionsForSkill(childSkill)
					})
				} else {
					console.log("Adding skill action", skill.name, skill.system.containedBy)

					const displayItem = skill.system.toDisplayItem()
					const list = skill.system.containedBy ? { id: skill.system.containedBy, type: "system" } : uncategorizedList
					const notes = this.#getActionsFromNotes(skill.system.notes, `skill-${id}`)

					this.addActions(
						[
							{
								id,
								name: displayItem.fullName,
								encodedValue: displayItem.otf.level,
								system: { actionType, actionId: id },
							},
							...notes,
						],
						list
					)
				}
			}

			this.actor.system.skillsV2.forEach((skill: any) => {
				addActionsForSkill(skill)
			})
		}

		/* ---------------------------------------- */

		#buildSpellActions(): void {
			const actionType = ACTION_TYPE.otf

			const rootList = { id: "spells", type: "system" }
			const uncategorizedList = { id: "spells_uncategorized", name: "Uncategorized", type: "system" }
			this.addGroup(uncategorizedList, rootList)

			const addActionsForSpell = (spell: any) => {
				const id = spell.id

				if (spell.system.isContainer) {
					const list = spell.system.containedBy ? { id: spell.system.containedBy, type: "system" } : rootList
					this.addGroup({ id, name: spell.name, type: "system" }, list, true)
					spell.system.children.forEach((childSpell: any) => {
						addActionsForSpell(childSpell)
					})
				} else {
					const displayItem = spell.system.toDisplayItem()
					const list = spell.system.containedBy ? { id: spell.system.containedBy, type: "system" } : uncategorizedList
					const notes = this.#getActionsFromNotes(spell.system.notes, `spell-${id}`)

					this.addActions(
						[
							{
								id,
								name: displayItem.fullName,
								encodedValue: displayItem.otf.level,
								system: { actionType, actionId: id },
							},
							...notes,
						],
						list
					)
				}
			}

			this.actor.system.spellsV2.forEach((spell: any) => {
				addActionsForSpell(spell)
			})
		}

		/* ---------------------------------------- */

		#buildEquipmentActions(): void {
			const actionType = ACTION_TYPE.otf

			this.actor.system.allEquipmentCarried.forEach((equipment: any) => {
				const id = `equipment-carried-${equipment.id}`
				const actions = this.#getActionsFromNotes(equipment.system.notes, id)

				if (actions.length > 0) {
					this.addGroup({ id, name: equipment.name, type: "system" }, { id: "equipments", type: "system" }, true)
					this.addActions(
						actions.map((action: any) => ({
							...action,
							id: `${id}-${action.id}`,
							system: { actionType, actionId: `${id}-${action.id}` },
						})),
						{ id, name: equipment.name, type: "system" }
					)
				}
			})

			this.actor.system.allEquipmentOther.forEach((equipment: any) => {
				const id = `equipment-other-${equipment.id}`
				const actions = this.#getActionsFromNotes(equipment.system.notes, id)

				if (actions.length > 0) {
					this.addGroup({ id, name: equipment.name, type: "system" }, { id: "equipments", type: "system" }, true)
					this.addActions(
						actions.map((action: any) => ({
							...action,
							id: `${id}-${action.id}`,
							system: { actionType, actionId: `${id}-${action.id}` },
						})),
						{ id, name: equipment.name, type: "system" }
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
