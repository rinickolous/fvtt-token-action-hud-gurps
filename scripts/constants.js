/**
 * Module-based constants
 */
export const MODULE = {
	ID: "token-action-hud-gurps",
}

/**
 * Core module
 */
export const CORE_MODULE = {
	ID: "token-action-hud-core",
}

/**
 * Core module version required by the system module
 */
export const REQUIRED_CORE_MODULE_VERSION = "2.0"

/**
 * Action types
 */
export const ACTION_TYPE = {
	attribute: "tokenActionHud.gurps.attribute",
	otf: "tokenActionHud.gurps.otf",
	maneuver: "tokenActionHud.gurps.maneuver",
	utility: "tokenActionHud.utility",
}

/**
 * Groups
 */
export const GROUP = {
	poolModifiers: { id: "poolModifiers", name: "tokenActionHud.gurps.poolModifiers", type: "system" },
	attributes: { id: "attributes", name: "tokenActionHud.gurps.attributes", type: "system" },
	senses: { id: "senses", name: "tokenActionHud.gurps.senses", type: "system" },
	reactions: { id: "reactions", name: "tokenActionHud.gurps.reactions", type: "system" },
	conditionalModifiers: {
		id: "conditionalModifiers",
		name: "tokenActionHud.gurps.conditionalModifiers",
		type: "system",
	},
	defenses: { id: "defenses", name: "tokenActionHud.gurps.defenses", type: "system" },
	dodges: { id: "dodges", name: "tokenActionHud.gurps.dodges", type: "system" },
	melee: { id: "melee", name: "tokenActionHud.gurps.melee", type: "system" },
	ranged: { id: "ranged", name: "tokenActionsHud.gurps.ranged", type: "system" },
	skills: { id: "skills", name: "tokenActionHud.gurps.skills", type: "system" },
	quickNotes: { id: "quickNotes", name: "tokenActionHud.gurps.quickNotes", type: "system" },
	spells: { id: "spells", name: "tokenActionHud.gurps.spells", type: "system" },
	traits: { id: "traits", name: "tokenActionHud.gurps.traits", type: "system" },
	maneuvers: { id: "maneuvers", name: "tokenActionHud.gurps.maneuvers", type: "system" },
	posture: { id: "posture", name: "tokenActionHud.gurps.posture", type: "system" },
	utility: { id: "utility", name: "tokenActionHud.utility", type: "system" },
}

/**
 * Item types
 */
export const ITEM_TYPE = {
	// armor: { groupId: 'armor' },
	// backpack: { groupId: 'containers' },
	// consumable: { groupId: 'consumables' },
	// equipment: { groupId: 'equipment' },
	// treasure: { groupId: 'treasure' },
	// weapon: { groupId: 'weapons' },
}
