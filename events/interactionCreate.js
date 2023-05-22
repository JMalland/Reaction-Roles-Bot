const { Events } = require('discord.js') // Import the Event
const { buttonInteraction } = require('./buttonInteraction.js')
const { modalSubmitInteraction } = require('./modalInteraction.js')
const { stringSelectMenuInteraction } = require('./stringSelectMenuInteraction.js')

module.exports = {
    name: Events.InteractionCreate,
    createdCategory: false, // If the user created a category, during the session
    createdRole: false, // If the user created a role, during the session
    async execute(interaction) {
        console.log("Interaction Found")
        if (interaction.isButton()) { // The user clicked a button
            buttonInteraction(interaction) // Run the button interaction
        }
        else if (interaction.isModalSubmit()) { // The user submitted a modal
            modalSubmitInteraction(interaction) // Run the modal interaction
        }
        else if (interaction.isStringSelectMenu()) { // The user selected a menu item
            stringSelectMenuInteraction(interaction) // Run the menu interaction
        }
        else {
            console.log("Unknown Interaction")
        }
    }
}