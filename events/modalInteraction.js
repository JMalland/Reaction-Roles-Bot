let { createdCategory, createdRole } = require('./buttonInteraction.js')
const {
    getIndex,
    updateInteraction,
    RoleBuilderData
} = require('../styling/gui.js')

module.exports = {
    async modalSubmitInteraction(interaction) {
        if (interaction.isModalSubmit()) { // The user submitted a modal
            RoleBuilderData[getIndex()] = "" + interaction.fields.getTextInputValue('Title-Input') // Store the created category / role title
            createdCategory = getIndex() == 0 // Set the category creation
            createdRole = getIndex() == 2 // Set the role creation
            console.log("Stored Role Creation: " + RoleBuilderData[getIndex()])
            updateInteraction(interaction, null, isNaN(RoleBuilderData[0]) ? null : RoleBuilderData[0]) // Update the interaction
        }
    }
}