import { GROUP } from "./constants.js"

/**
 * Default layout and groups
 */
export let DEFAULTS = null

Hooks.once("tokenActionHudCoreApiReady", async coreModule => {
	const groups = GROUP
	Object.values(groups).forEach(group => {
		group.name = coreModule.api.Utils.i18n(group.name)
		group.listName = `Group: ${coreModule.api.Utils.i18n(group.listName ?? group.name)}`
	})
	const groupsArray = Object.values(groups)
	DEFAULTS = {
		layout: [
			{
				id: "attributes",
				nestId: "attributes",
				name: coreModule.api.Utils.i18n("tokenActionHud.gurps.attributes"),
				type: "system",
				groups: [
					{ ...groups.poolModifiers, nestId: "attributes_poolModifiers" },
					{ ...groups.attributes, nestId: "attributes_attributes" },
					{ ...groups.senses, nestId: "attributes_senses" },
					{ ...groups.reactions, nestId: "attributes_reactions" },
					{ ...groups.conditionalModifiers, nestId: "attributes_conditionalModifiers" },
				],
			},
			{
				id: "defenses",
				nestId: "defenses",
				name: coreModule.api.Utils.i18n("tokenActionHud.gurps.defenses"),
				type: "system",
				groups: [
					{ ...groups.dodges, nestId: "defenses_dodges" },
					{ ...groups.parries, nestId: "defenses_parries" },
					{ ...groups.blocks, nestId: "defenses_blocks" },
				],
			},
			{
				id: "melee",
				nestId: "melee",
				name: coreModule.api.Utils.i18n("tokenActionHud.gurps.melee"),
				type: "system",
			},
			{
				id: "ranged",
				nestId: "ranged",
				name: coreModule.api.Utils.i18n("tokenActionHud.gurps.ranged"),
				type: "system",
			},
			{
				id: "traits",
				nestId: "traits",
				name: coreModule.api.Utils.i18n("tokenActionHud.gurps.traits"),
				type: "system",
			},
			{
				id: "skills",
				nestId: "skills",
				name: coreModule.api.Utils.i18n("tokenActionHud.gurps.skills"),
				type: "system",
			},
			{
				id: "spells",
				nestId: "spells",
				name: coreModule.api.Utils.i18n("tokenActionHud.gurps.spells"),
				type: "system",
			},
			{
				id: "quickNotes",
				nestId: "quickNotes",
				name: coreModule.api.Utils.i18n("tokenActionHud.gurps.quickNotes"),
				type: "system",
			},
			{
				id: "maneuvers",
				nestId: "maneuvers",
				name: coreModule.api.Utils.i18n("tokenActionHud.gurps.maneuvers"),
				type: "system",
				groups: [{ ...groups.maneuvers, nestId: "maneuvers_maneuvers" }],
			},
			{
				id: "posture",
				nestId: "posture",
				name: coreModule.api.Utils.i18n("tokenActionHud.gurps.posture"),
				type: "system",
				groups: [{ ...groups.posture, nestId: "posture_posture" }],
			},
		],
		groups: groupsArray,
	}
})
