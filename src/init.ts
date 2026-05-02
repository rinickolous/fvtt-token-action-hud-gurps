import { SystemManager } from "./system-manager.ts"
import { MODULE, REQUIRED_CORE_MODULE_VERSION } from "./constants.ts"

Hooks.on("tokenActionHudCoreApiReady", async () => {
	const module = game.modules.get(MODULE.ID)
	;(module as any).api = {
		requiredCoreModuleVersion: REQUIRED_CORE_MODULE_VERSION,
		SystemManager,
	}
	Hooks.call("tokenActionHudSystemReady", module)
})
