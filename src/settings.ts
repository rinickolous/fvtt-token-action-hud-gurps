import { MODULE } from "./constants.ts"

export function register(coreUpdate: any): void {
	game.settings.register(MODULE.ID, "displayUnequipped", {
		name: game.i18n.localize("tokenActionHud.gurps.settings.displayUnequipped.name"),
		hint: game.i18n.localize("tokenActionHud.gurps.settings.displayUnequipped.hint"),
		scope: "client",
		config: true,
		type: Boolean,
		default: true,
		onChange: value => {
			coreUpdate(value)
		},
	})
}
