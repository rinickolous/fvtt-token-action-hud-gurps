import { MODULE } from "./constants.ts"

export let Utils: any = null

Hooks.once("tokenActionHudCoreApiReady", async (coreModule: any) => {
	Utils = class Utils {
		static getSetting(key: string, defaultValue: any = null): any {
			let value = defaultValue ?? null
			try {
				value = (game.settings as any).get(MODULE.ID, key) ?? defaultValue
			} catch {
				coreModule.api.Logger.debug(`Setting '${key}' not found`)
			}
			return value
		}

		static async setSetting(key: string, value: any): Promise<any> {
			try {
				value = await (game.settings as any).set(MODULE.ID, key, value)
				coreModule.api.Logger.debug(`Setting '${key}' set to '${value}'`)
			} catch {
				coreModule.api.Logger.debug(`Setting '${key}' not found`)
			}
		}
	}
})
