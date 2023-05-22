const { createServerRole, manageRoles, BotStorage, Initializer } = require('./../styling/gui.js')
const { Events, ChannelType, PermissionsBitField, Client } = require('discord.js')

module.exports = {
    name: Events.GuildCreate,
    async execute(guild) {
        console.log("Guild Created!")
        let storage = BotStorage.getValue() // Store the server data
        if (!(guild.id in storage)) { // The server hasn't been added
            console.log("Creating New Server Directory")
            storage[guild.id] = {} // Add the Category/IDs object
        }
        console.log("Creating Channel")
        guild.channels.create({ // Create a private channel, for server owner only to do setup for the bot
            name: Client.name, 
            type: ChannelType.GuildText,
            permissionOverwrites: [
                { 
                    id: guild.ownerId,
                    allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
                },
                {
                    id: guild.roles.everyone,
                    deny: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages]
                }
            ]
        }).then((channel) => { // Create a new channel
            console.log("Sending Message")
            channel.send({ content: "Move the 'ReactionRole Bot' role to the highest position under 'Owner'.\nOnce done, click this button to initialize.", components: [Initializer]}).then((message) => {
                message.awaitMessageComponent().then((interaction) => {
                    console.log("Interaction Detected")
                    BotStorage.setValue(storage) // Update the storage data
                    let m = createServerRole(guild, "Member" + "", "#2f3136") // The Member Role
                    let b = createServerRole(guild, "Bot" + "", "#2f3136") // The Bot Role
                    m.then((role) => { // Once the role is created
                        manageRoles(guild.id, role, role.id) // Create the categories of the roles, and such
                        guild.members.fetch().then((members) => { // Get all members
                            members.forEach((member) => { // Loop through each member
                                if (member.user.bot == false) { // Member is not a bot
                                    console.log("Added '" + role.name + "' to member roles")
                                    member.roles.add(role) // Add the Member Role
                                }
                            })
                        })
                    })
                    b.then((role) => { // Once the role is created
                        manageRoles(guild.id, role, role.id) // Create the categories of the roles, and such
                        guild.members.fetch().then((members) => { // Get all members
                            members.forEach((member) => { // Loop through each member
                                if (member.user.bot == true) { // Member is a bot
                                    console.log("Added '" + role.name + "' to member roles")
                                    member.roles.add(role) // Add the Member Role
                                }
                            })
                        })
                    })
                    interaction.deferUpdate()
                })
            })
        })
        
    }
}