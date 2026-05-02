import { ActionHandler } from "./action-handler.ts"
import { RollHandler as Core } from "./roll-handler.ts"
import { MODULE } from "./constants.ts"
import { DEFAULTS } from "./defaults.ts"
import * as systemSettings from "./settings.ts"

export let SystemManager: any = null

Hooks.once("tokenActionHudCoreApiReady", async (coreModule: any) => {
	SystemManager = class SystemManager extends coreModule.api.SystemManager {
		getActionHandler(): any {
			return new ActionHandler()
		}

		getAvailableRollHandlers(): Record<string, string> {
			const coreTitle = "Core Template"
			const choices = { core: coreTitle }
			return choices
		}

		getRollHandler(rollHandlerId: string): any {
			let rollHandler: any
			switch (rollHandlerId) {
				case "core":
				default:
					rollHandler = new Core()
					break
			}
			return rollHandler
		}

		async registerDefaults(): Promise<any> {
			return DEFAULTS
		}

		registerSettings(coreUpdate: any): void {
			systemSettings.register(coreUpdate)
		}

		registerStyles(): Record<string, any> {
			return {
				template: {
					class: "tah-gurps",
					file: "tah-gurps",
					moduleId: MODULE.ID,
					name: "Template Style",
				},
			}
		}
	}
})
