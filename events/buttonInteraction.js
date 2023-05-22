const { ButtonComponent } = require('discord.js')
const {
    manageRoles,
    createServerRole,
    updateInteraction,
    getIndex,
    CreateMenu,
    RoleBuilderData
} = require('../styling/gui.js')

module.exports = {
    createdCategory: false,
    createdRole: false,
    async buttonInteraction(interaction) {
        let CreateModal = RoleBuilderData[getIndex()] == "Create" // The user is creating a role or category
        let ColorMenu = getIndex()%2 == 1 // The user interacted with a color menu
        let SkippedColor = !this.createdCategory && getIndex() == 2
        if (interaction.customId == 'Role-Confirm') {
            if (RoleBuilderData[getIndex()] == null || RoleBuilderData[getIndex()] == []) { // The User Hasn't Selected Anything
                let type = ColorMenu ? "color" : (getIndex() == 0 ? "category" : "role")
                console.error("SelectionError: No " + type + " selection found.")
                return
            }
            if (CreateModal) { // The bot should prompt the user with a modal
                interaction.showModal(CreateMenu) // Display the build menu
                this.createdCategory = getIndex() == 0 // Creating category?
                return // Quit the method
            }
            else if (ColorMenu) {
                let role = createServerRole(interaction.guild, RoleBuilderData[getIndex() - 1], "#" + RoleBuilderData[getIndex()])
                role.then((role) => {
                    RoleBuilderData[getIndex() - 1] = role.id // The user created a role, started on the previous menu
                    manageRoles(interaction.guild.id, role, RoleBuilderData[0]) // Manage the role in the global record 
                    updateInteraction(interaction, null, RoleBuilderData[0]) // Update the interaction
                    if (getIndex() == 0) { // The UI went full circle, back to the start
                        this.createdCategory = false // Reset info
                        this.createdRole = false // Reset info
                        RoleBuilderData[0] = null // Clear the first index
                        RoleBuilderData[1] = null // Clear the second index
                        RoleBuilderData[2] = [] // Clear the third index
                        RoleBuilderData[3] = null // Clear the fourth index
                    }
                })
                return // Quit the method
            }
            updateInteraction(interaction, !ColorMenu && getIndex() == 0 ? 2 : null, isNaN(RoleBuilderData[0]) ? null : RoleBuilderData[0]) // Update the interaction
            return // Quit the method
        }
        else if (interaction.customId == "Role-Cancel") { // User went to the previous page.
            if (getIndex() == 0) { // There's no previous page
                console.log("Closing Menu")
                this.createdCategory = false // Reset info
                this.createdRole = false // Reset info
                RoleBuilderData[0] = null // Clear the first index
                RoleBuilderData[1] = null // Clear the second index
                RoleBuilderData[2] = [] // Clear the third index
                RoleBuilderData[3] = null // Clear the fourth index
                console.log("Deleted Data")
                interaction.message.delete()
                return // Quit the method
            }
            // May want to check if RoleBuilderData[0] isNaN()
            console.log("Going Back...")
            updateInteraction(interaction, SkippedColor ? -2 : -1, RoleBuilderData[0]) // Update the interaction
            return // Quit the method
        }
    }
}