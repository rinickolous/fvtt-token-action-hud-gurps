import { ACTION_TYPE } from "./constants.js"

export let RollHandler = null

Hooks.once("tokenActionHudCoreApiReady", async coreModule => {
	/**
	 * Extends Token Action HUD Core's RollHandler class and handles action events triggered when an action is clicked
	 */
	RollHandler = class RollHandler extends coreModule.api.RollHandler {
		/**
		 * Handle action click
		 * Called by Token Action HUD Core when an action is left or right-clicked
		 * @override
		 * @param {object} event        The event
		 * @param {string} encodedValue The encoded value
		 */
		async handleActionClick(event, encodedValue) {
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

		/**
		 * Handle action hover
		 * Called by Token Action HUD Core when an action is hovered on or off
		 * @override
		 * @param {object} event        The event
		 * @param {string} encodedValue The encoded value
		 */
		async handleActionHover(_event, _encodedValue) {}

		/* ---------------------------------------- */

		/**
		 * Handle group click
		 * Called by Token Action HUD Core when a group is right-clicked while the HUD is locked
		 * @override
		 * @param {object} event The event
		 * @param {object} group The group
		 */
		async handleGroupClick(_event, _group) {}

		/* ---------------------------------------- */

		async #handleAction(event, actionType, actor, _token, actionId, encodedValues = []) {
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

		async #rollAttribute(event, actor, attributeId) {
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

		async #rollOTF(event, actor, encodedValues, rightClickDamage = false) {
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
