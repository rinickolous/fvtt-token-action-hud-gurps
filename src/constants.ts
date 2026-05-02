export const MODULE = {
	ID: "token-action-hud-gurps" as const,
}

/* ---------------------------------------- */

export const CORE_MODULE = {
	ID: "token-action-hud-core",
}

/* ---------------------------------------- */

export const REQUIRED_CORE_MODULE_VERSION = "2.1"

/* ---------------------------------------- */

export const ACTION_TYPE = {
	attribute: "tokenActionHud.gurps.attribute",
	otf: "tokenActionHud.gurps.otf",
	maneuver: "tokenActionHud.gurps.maneuver",
	utility: "tokenActionHud.utility",
}

/* ---------------------------------------- */

export const GROUP = {
	attributes: { id: "attributes", name: "tokenActionHud.gurps.attributes", type: "system" },
	conditionalModifiers: {
		id: "conditionalModifiers",
		name: "tokenActionHud.gurps.conditionalModifiers",
		type: "system",
	},
	defenses: { id: "defenses", name: "tokenActionHud.gurps.defenses", type: "system" },
	dodges: { id: "dodges", name: "tokenActionHud.gurps.dodges", type: "system" },
	equipment: { id: "equipment", name: "tokenActionHud.gurps.equipment", type: "system" },
	maneuvers: { id: "maneuvers", name: "tokenActionHud.gurps.maneuvers", type: "system" },
	melee: { id: "melee", name: "tokenActionHud.gurps.melee", type: "system" },
	poolModifiers: { id: "poolModifiers", name: "tokenActionHud.gurps.poolModifiers", type: "system" },
	posture: { id: "posture", name: "tokenActionHud.gurps.posture", type: "system" },
	quickNotes: { id: "quickNotes", name: "tokenActionHud.gurps.quickNotes", type: "system" },
	ranged: { id: "ranged", name: "tokenActionsHud.gurps.ranged", type: "system" },
	reactions: { id: "reactions", name: "tokenActionHud.gurps.reactions", type: "system" },
	senses: { id: "senses", name: "tokenActionHud.gurps.senses", type: "system" },
	skills: { id: "skills", name: "tokenActionHud.gurps.skills", type: "system" },
	spells: { id: "spells", name: "tokenActionHud.gurps.spells", type: "system" },
	traits: { id: "traits", name: "tokenActionHud.gurps.traits", type: "system" },
	utility: { id: "utility", name: "tokenActionHud.utility", type: "system" },
}

/* ---------------------------------------- */

export const ITEM_TYPE = {}
