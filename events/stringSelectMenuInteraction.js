const {
    grabRoles,
    getIndex,
    RoleBuilderData
} = require('../styling/gui.js')

module.exports = {
    async stringSelectMenuInteraction(interaction) {
        let selected = getIndex()%2 == 1 ? interaction.values : grabRoles(interaction.guild, interaction.values) // Get the selected items
        RoleBuilderData[getIndex()] = getIndex()%2 == 1 ? selected[0] : selected[0] // May Want To Make Multiple Roles Selectable (Exclude colors)
        console.log("Selected Item: " + selected[0])
        console.log("Saved Item: " + RoleBuilderData[0])
        interaction.deferUpdate() // Don't update the interaction yet
        return // Quit the method
    }
}