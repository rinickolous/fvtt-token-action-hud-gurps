import { ACTION_TYPE } from "./constants.ts"

export let RollHandler: any = null

Hooks.once("tokenActionHudCoreApiReady", async (coreModule: any) => {
	RollHandler = class RollHandler extends coreModule.api.RollHandler {
		async handleActionClick(event: any, encodedValue: string): Promise<void> {
			const { actionType, actionId } = this.action.system

			const encodedValues = encodedValue?.split("|") ?? []

			if (!this.actor) {
				for (const token of coreModule.api.Utils.getControlledTokens()) {
					const actor = token.actor
					await this.#handleAction(event, actionType, actor, token, actionId, encodedValues)
				}
			} else {
				await this.#handleAction(event, actionType, this.actor, this.token, actionId, encodedValues)
			}
		}

		/* ---------------------------------------- */

		async handleActionHover(_event: any, _encodedValue: string): Promise<void> {}

		/* ---------------------------------------- */

		async handleGroupClick(_event: any, _group: any): Promise<void> {}

		/* ---------------------------------------- */

		async #handleAction(
			event: any,
			actionType: string,
			actor: any,
			_token: any,
			actionId: string,
			encodedValues: string[] = []
		): Promise<void> {
			switch (actionType) {
				case ACTION_TYPE.attribute:
					await this.#rollAttribute(event, actor, actionId)
					break
				case ACTION_TYPE.otf:
					await this.#rollOTF(event, actor, encodedValues)
					break
				default:
					console.warn(
						`Unhandled action type: ${actionType} with actionId: ${actionId} for actor: ${actor?.name || "No Actor"}`
					)
			}
		}

		/* ---------------------------------------- */

		async #rollAttribute(event: any, actor: any, attributeId: string): Promise<void> {
			await GURPS.performAction(
				{
					attribute: attributeId,
					attrkey: attributeId,
					blindroll: event.type === "contextmenu",
					name: attributeId,
					orig: attributeId,
					path: `attributes.${attributeId}.value`,
					spantext: `${attributeId} `,
					type: "attribute",
				},
				actor,
				event
			)
		}

		/* ---------------------------------------- */

		async #rollOTF(event: any, actor: any, encodedValues: string[], rightClickDamage = false): Promise<void> {
			if (rightClickDamage && event.type === "contextmenu") {
				const otfText = encodedValues[0]

				const otfAction = GURPS.parselink(otfText)
				otfAction.action.calcOnly = true

				const formula = await GURPS.performAction(otfAction.action, actor)

				GURPS.resolveDamageRoll(event, actor, formula, "", game.user?.isGM, true)
			} else {
				const saved = GURPS.LastActor
				GURPS.SetLastActor(actor)

				const action = GURPS.parselink(encodedValues[0]).action

				delete action.sourceId
				if (action.type === "attack" && encodedValues.length > 1) {
					action.itemPath = encodedValues[1]
				}

				GURPS.performAction(action, actor, event).then(() => {
					GURPS.SetLastActor(saved)
				})
			}
		}
	}
})
