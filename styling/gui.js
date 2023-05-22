const { balanceString, extendString, formatString, measureString } = require('./format.js') // Import the String formatting methods
const { Item } = require('./../item.js') // Import the Item class
const { 
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
	StringSelectMenuBuilder,
	EmbedBuilder 
} = require('discord.js')


const storage = {
	guild: {
		category: {
			id: "12345"
		}
	}
}


const BotStorage = new Item('storage', {}) // Storage to tell what servers the bot is a part of

const RoleCategories = new Item('categories', []) // Default reaction-roles categories
const RoleIDs = new Item('IDs', { }) // Default role IDs to store

console.log(BotStorage.getValue())

//BotStorage.setValue({ })

function selectMenu(options, id, terms) {
	console.log("******************************\n*   Creating A Select Menu   *\n******************************")
	let menu = new StringSelectMenuBuilder() // Create the string menu
		.setCustomId(id)
		.setPlaceholder('Nothing selected')
		.setMaxValues(1)
	let types = options[0] // The option titles
	let noTerms = terms.length == null // Determine if terms exist
	if (terms.label != null) { // There is a default option set
		menu.addOptions(terms) // Add the default option as the first one
	}

	for (var i=0; (noTerms ? i == 0 : i < terms.length); i++) { // Loop through the sub-options & terms
		console.log("*\tTerm Loop: " + i)
		for (var j=0; j<types.length; j++) { // Loop through each Option Type
			var option = { label: " ", description: " ", value: " " } // Default SelectMenu option
			if (types[j].constructor.name == "Role") { // The object is of type Role
				console.log("\t* TypeOf Role")
				option.label = options[noTerms ? i : i + 1][j].name // Display the Name attribute as the label
				option.value = options[noTerms ? i : i + 1][j].id + "" // Set the value as the ID, to make it fetchable
			}
			else { // The list doesn't hold Role objects
				option.label = (noTerms ? "" : terms[i] + " ") + types[j] // Set the Option Label
				option.description = noTerms ? " " : terms[i] // Set the Option Description
				option.value = options[noTerms ? i : i + 1][j] + "" // Set the identifying value
			}
			menu.addOptions(option) // Add the option to the menu
			console.log("\t*Added: " + option.label + " ==> " + option.value)
		}
		console.log("*\tTerm Loop Callback: " + (noTerms ? i+1 == 0 : i+1 < terms.length))
	}
	console.log("*\tReturned SelectMenu: " + id)
	console.log()
	return(menu) // Return the created menu
}

function grabRoles(guild, id_list) { // Retrieves a list of roles from given IDs
	console.log("*******************************\n*    Retrieving Roles...     *\n******************************")
	console.log(id_list)
	let results = [] // List of roles to be returned
	for (var i=0; i<id_list.length; i++) { // Loop through each Role ID
		if ("Create" == id_list[i]) { // User is creating a new role / category
			console.log("*\tFound New Creation\n")
			return(["Create"]) // Only return the created role / category
		}
		let role = guild.roles.cache.get(id_list[i]) // Find the proper Role
		if (role != null) { // The role was found
			results.push(role) // Add the role to the list (as a number, to allow numbered role names)
		}
	}
	console.log("*\tReturned Found Roles\n")
	return(results) // Return the list of roles
}

const Colors = [ // List of all colors ordered from Light and Dark default Discord role colors
	/* Colors */ ["Cyan",   "Green",  "Blue",   "Purple", "Red/Pink", "Yellow", "Gold/Brown", "Orange/Brown", "Grey"],
	/* Light  */ ["1abc9c", "2ecc71", "3498db", "9b59b6", "e91e63",   "f1c40f", "e67e22",     "e74c3c",       "95a5a6"],
	/* Dark   */ ["11806a", "1f8b4c", "206694", "71368a", "ad1457",   "c27c0e", "a84300",     "992d22",       "979c9f"]
]

const ColorMenu = selectMenu(Colors, "Color-Menu", ["Light", "Dark"]) // Create the Select Menu for Role Colors
ColorMenu.setMaxValues(14)
// Make Constant and just update Options each time new Category / Role created?
let CategoryMenu = new StringSelectMenuBuilder() // Create the category menu (Gets reinitialized when called)
let RoleMenu = new StringSelectMenuBuilder() // Create the Role menu (Gets reinitialized when called
const RoleMenus = [CategoryMenu, ColorMenu, RoleMenu, ColorMenu] // Array to order the Select Menus in order of appearance

const RoleBuilderData = [null, null, [], null] // Stores the role data for role creation
const RoleBuilderWidth = 419 // The width of the Role Builder interface

function defaultColor(desc) {
	return({
		embed: {
			title: "Select Color",
			desc: desc, 
			fields: [],
		},
		message: "content",
	})
}

const gui = {
	Category: {
		create: "CreateModal",
		color: defaultColor("What color should the category have?"),
	},
	Role: {
		create: "Hi",
		color: defaultColor("What color should the role have?"),
		default: {
			embed: {
				title: "Choose Role",
				desc: "Which role(s) are you configuring?",
				fields: [],
			},
			message: "content",
		},
		//auto: "AutoGrantMenu", // Debating whether to have auto-add or not
		member: {
			add: {
				embed: {
					title: "Add Member(s)",
					desc: "Who do you want to grant the role to?",
					fields: [],
				},
				message: "content",
			},
			remove: {
				embed: {
					title: "Remove Member(s)",
					desc: "Who should lose the role?",
					fields: [],
				},
				message: "content",
			},
		},
	}
}

function updateDisplay(type, subtype) { // Need multiple args...
	let object = gui[type] // Store either Role or Category
	subtype = object.getType(subtype) // Store the subtype 
	RoleBuilder.setTitle(object[subtype].title) // Set the title
	RoleBuilder.setDescription(object[subtype].desc) // Set the description
	RoleBuilder.setFields(object[subtype].fields) // Set the fields
	return(object[subtype].message) // Return the message content to be updated.
	// May want the confirm/cancel objects in the message property, to be changed there.
	// The message would then be constructed right here.
	// Maybe a message.initialize() method?
}

const CreateMenu = new ModalBuilder() // Modal UI for creating roles / categories
	.setCustomId('Create-Modal') // Set ID
	.setTitle('Create') // Set Title
	.setComponents(new ActionRowBuilder())

const TitleInput = new TextInputBuilder() // Text Input for role / category title
	.setCustomId('Title-Input') // Set ID
	.setStyle(TextInputStyle.Short)

const TitleLabels = ["What should the category be called?", "What should the role be called?", " "] // List of title labels for the create menu

const MenuTitles = ["Choose Category", "Choose Role", /* Need Middle Option For Emoji/Title/Color Editing */ "Choose Color"] // Array of RoleBuilder Embed Titles
const MenuDesc = [ "What category does the role belong to?", "What color should the category be?", "Which role(s) are you configuring?", "What color should the role(s) have?"] // Array of RoleBuilder Embed Descriptions
const MenuFields = [ // Array of fields for the RoleBuilder Embed
	[ // Embed Fields For Category Selection
		[extendString('Options:', RoleBuilderWidth), ' '],
		[' ', '1) Create a new category.'],
		[' ', '2) Select one from the list below.'],
	],
	// There'll be a second option here, same as the last Color Selection Field
	[ // Embed Fields For Role Selection
		[extendString('Options:', RoleBuilderWidth), ' '],
		[' ', '1) Create a new role.'],
		[' ', '2) Select one from the list below.'],
	],
	[ // Embed Fields For Color Selection
		[extendString('Options:', RoleBuilderWidth), ' '],
		[' ', '1) Set the color in server settings.'],
		[' ', '2) Select one from the list below.'],
	]
]
MenuFields.splice(1, 0, MenuFields[MenuFields.length - 1]) // Embed Fields For New Category Color Selection
MenuTitles.splice(1, 0, MenuTitles[MenuTitles.length - 1]) // Embed Fields For New Category Color Selection
TitleLabels.splice(1, 0, TitleLabels[TitleLabels.length - 1]) // Embed Fields For New Category Color Selection

const ConfirmLabels = ["Next", "Next", "Next", "Done"] // Labels for the Confirm button
const CancelLabels = ["Quit", "Back", "Back", "Back"] // Labels for the Cancel button

const RoleBuilder = new EmbedBuilder() // Role Builder Embed
	.setAuthor({ name: 'Role Builder' }) // Set Author
	.setColor(0x0099FF) // Set Embed Color
const RoleSpacer = new ButtonBuilder() // Spacer Button to separate the others
	.setCustomId('Role-Spacer') // Identifier
	.setStyle(ButtonStyle.Secondary) // Button Style
	.setDisabled(true) // Disable Button
	.setStyle('Secondary')

const RoleInitialize = new ButtonBuilder() // Button to start Guild Initialization
	.setCustomId('Role-Initializer')
	.setStyle(ButtonStyle.Primary)
	.setLabel("Initialize")

const Initializer = new ActionRowBuilder() // Row to initialize Guild settings
	.addComponents(RoleInitialize)

const RoleConfirm = new ButtonBuilder() // Confirm Button to be used to submit / continue
	.setCustomId('Role-Confirm') // Identifier
const RoleCancel = new ButtonBuilder() // Cancel Button to be used to quit / go back
	.setCustomId('Role-Cancel') // Identifier

let index = 0 // Stores the current index of the Role Builder Embed

function manageRoles(guild_id, role, category_id) {
	category_id = category_id + "" // Make it a string, to be processed properly
	console.log("******************************\n* Updating Role / Categories *\n******************************")
	let storage = BotStorage.getValue() // Store all the data
	let server = storage[guild_id] // Store the server data
	if (!(category_id in server)) { // The Role Category doesn't exist
		console.log("*\tCreating Category")
		server[category_id] = [] // Create a new category listing
	}
	console.log("*\tRole In Category: " + (server[category_id].includes(role.id)))
	if (!(server[category_id].includes(role.id))) {
		console.log("Adding Role To Category")
		server[category_id].unshift(role.id) // Add the new Role to the category
	}
	else { // The Role Already Exists
		console.log("*\tRole Already Exits!")
	}
	if (server[category_id].length > 1) { // More than one role in the category
		console.log("*\tRepositioned Topmost Role")
		let primary = server[category_id][1] // Store the previous topmost role
		server[category_id].splice(1, 1) // Remove the previous topmost role
		server[category_id].unshift(primary) // Re-Add the role to the top
	}
	storage[guild_id] = server // Update the storage
	BotStorage.setValue(storage) // Update the total storage
	console.log("*\tUpdated Role IDs\n")
}

function createServerRole(guild, name, color) {
	console.log("******************************\n*  Creating New Server Role  *\n******************************")
	let role = typeof name == "string" ? guild.roles.cache.find(role => role.name == name) : guild.roles.cache.find(role => role.id == "" + name) // Temporarily store the 'found' role
	if (!(typeof name == "string")) {
		console.log("*\tChanging Existing Role: " + name)
	}
	if (role != null) { // A Member role already exists
		console.log("*\tRole Exists")
		console.log("*\tUpdated Role Color\n")
		return(role.edit({ color: color })) // Update the role's color
	}
	else { // There is no existing Member role
		console.log("*\tCreating New Role\n")
		return(guild.roles.create({ name: name, color: color })) // Return true, since role creation was attempted
	}
}

function shiftRoleBuilder(n) { // Shifts the page displayed on the Role Builder
	console.log("******************************\n*  Changing UI Page Display  *\n******************************")	
	if (n >= 0 && n != null) { // The index parameter wasn't given
		index = n // Overwrite the calculated index
		console.log("*\tSet Page To: " + n)
	}
	else { // The index parameter is null or negative
		if (n == null) {
			console.log("*\tMoved To Next Page. (Page " + (index+1)%MenuTitles.length + ")")
		}
		else {
			console.log("*\tChanged Page By " + n + ". (Page " + (index + n)%MenuTitles.length + ")")
		}
		index += n != null ? n : 1 // Shift the index
	}

	if (index > 3) { // Reached the end of the UI
		console.log("*\tSubmitted Edits")
		index = 0 // Return to start page
	}
	
	index %= MenuTitles.length // Keep the index within the valid bounds
	
	console.log("*\tUpdating UI Embed Fields")	
	RoleBuilder.setTitle('__' + formatString(MenuTitles[index], RoleBuilderWidth - 27) + '__') // Update Title
	RoleBuilder.setDescription(formatString(MenuDesc[index], RoleBuilderWidth - 27)) // Update Description
	RoleBuilder.setFields({ name: ' ', value: ' ' }) // Erase Fields
	for (let i=0; i<MenuFields[index].length; i++) { // Loop through Embed Fields
		RoleBuilder.addFields({ name: formatString(MenuFields[index][i][0], RoleBuilderWidth - 27), value: formatString(MenuFields[index][i][1], RoleBuilderWidth - 27) }) // Add each Field
	}
	
	console.log("*\tUpdating Navigation Buttons")
	RoleConfirm.setLabel(ConfirmLabels[index]) // Update Label
	RoleConfirm.setStyle(index + 1 == MenuTitles.length ? ButtonStyle.Success : ButtonStyle.Primary) // Update Style
	
	RoleCancel.setLabel(balanceString(CancelLabels[index], measureString(ConfirmLabels[index]))) // Update Label
	RoleCancel.setStyle(index == 0 ? ButtonStyle.Danger : ButtonStyle.Primary) // Update Style
	
	// RoleCancel & RoleConfirm widths are roughly 100px each.
	// There is about 12.5px of space separating each button // 236 Px is the smallest for Samsung Galaxy S7 Edge, where fully displayed.
	RoleSpacer.setLabel(extendString("", RoleBuilderWidth - 236)) // Update Label

	console.log("*\tUpdating Modal Fields")
	TitleInput.setLabel(TitleLabels[index]) // Update the Create Menu's input
	CreateMenu.setComponents(new ActionRowBuilder().setComponents(TitleInput)) 
	
	console.log()
}

function updateMenus(guild, category_id) { // Keep the switch menus up to date
	console.log("******************************\n*   Updating Select Menus    *\n******************************")
	let newCat = { label: "New", description: "Create a category", value: "Create" } // Option for creating a new category
	CategoryMenu = selectMenu([grabRoles(guild, Object.getOwnPropertyNames(BotStorage.getValue()[guild.id]))], "Category-Menu", newCat) // Update the category menu
	console.log("*\tCreated Category Menu")
	if (category_id != null) { // There's a valid category provided
		let newRole = { label: "New", description: "Create a role", value: "Create" } // Option for creating a new role
		console.log("*\tCategory: " + category_id)
		RoleMenu = selectMenu([grabRoles(guild, BotStorage.getValue()[guild.id][category_id])], "Role-Menu", newRole) // Update the role menu
		console.log("*\tCreated Role Menu")
	}
	RoleMenus[0] = CategoryMenu // Update the Menu array
	RoleMenus[2] = RoleMenu // Update the Menu array
	console.log("*\tUpdated UI Menus")

	console.log()
}

function updateInteraction(interaction, shift_value, category_id) { // Update the interaction
	category_id = (category_id == null ? category_id : category_id + "") // Convert to string to process properly
	updateMenus(interaction.guild, category_id) // Update the Select Menus
	shiftRoleBuilder(shift_value) // Update the UI Page
	interaction.update(getReactionUI()) // Update the initial reply message
}

function getReactionUI() { // Return the message content of the UI
    return({ embeds: [RoleBuilder], components: [new ActionRowBuilder().addComponents(RoleMenus[index]), new ActionRowBuilder().addComponents(RoleCancel, RoleSpacer, RoleConfirm)] }) // Return the message components
}

function getIndex() {
    return(index)
}

module.exports = {
    RoleIDs,
    RoleCategories,
    grabRoles,
    createServerRole,
	manageRoles,
	updateInteraction,
    shiftRoleBuilder,
    updateMenus, 
    getReactionUI, 
    getIndex,
    CreateMenu,
    RoleBuilderData,
	BotStorage,
	Initializer
}