export {}

declare module "fvtt-types/configuration" {
	namespace Hooks {
		interface HookConfig {
			tokenActionHudCoreApiReady: (coreModule: any) => void | Promise<void>
			tokenActionHudSystemReady: (module: any) => boolean | void
		}
	}

	interface SettingConfig {
		"token-action-hud-gurps.displayUnequipped": boolean
		"gurps.use-quintessence": boolean
	}
}
