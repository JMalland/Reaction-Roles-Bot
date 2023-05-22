/*
const https = require('https')

const url = 'https://example.com/quiz'

fetch(url)
	.then(response => response.text())
	.then(htmlText => {
		const dummyElement = document.createElement('html')
		dummyElement.innerHTML = htmlText

		// Find the "show answers" button
		const showAnswersButton = dummyElement.querySelector('#show-answers-button)

		// Get the quiz questions and answers
		const questions = dummyElement.querySelectorAll('.question')
		const answers = dummyElement.querySelectorAll('.answer')

		// Save the HTML page
		const htmlPage = dummyElement.outerHTML
		fs.writeFileSync('quiz.html', htmlPage)
	})
*/

// Require the necessary discord.js classes
const {
	shiftRoleBuilder, 
	updateMenus, 
	getReactionUI, 
	RoleBuilderData
} = require('./styling/gui.js') // Import the GUI class
const { 
	Client, 
	GatewayIntentBits,
} = require('discord.js')
const { token } = require('./config.json')

// Create a new client instance
const client = new Client({
	intents: [
		GatewayIntentBits.GuildPresences,
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildEmojisAndStickers,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMessageReactions,
	]
});

const eventPaths = ['./events/interactionCreate.js', './events/guildCreate.js']

// When the client is ready, run this code (only once)
client.once('ready', () => {
	console.log('Ready')
	return
})

//function verifyRoles() {
//	for (var key in RoleIDs.getValue()) { // All Guilds
//		console.log(key) // Loop through all Categories In Guild
//								 Loop through all Roles In Each Category In Each Guild
//	}
//}

function grabQuotes(content) {
	var results = [] // Stores the list of quotes from the content
	var myRegexp = /[^\s"]+|"(?:\\"|[^"])*"/g // https://stackoverflow.com/questions/2817646/javascript-split-string-on-space-or-on-quotes-to-array
	do {
	    // Each call to exec returns the next regex match as an array
	    var match = myRegexp.exec(content)
	    if (match != null) {
	        // Index 1 in the array is the captured group if it exists
	        // Index 0 is the matched text, which we use if no captured group exists
	        var string = match[1] ? match[1] : match[0] // Store the quotes string
            results.push(string.charAt(0) == '"' ? string = string.substring(1, string.length - 1) : string)
	    }
	} while (match != null)
	return(results)
}

shiftRoleBuilder(0) // Shift The Role Builder Page

/* Have a channel manager, to manage which channels are watched.*/

/* When the user selects a role, move to a new page with a select menu.
		Options: Add/Remove/Manage Members, Change Color, Manage Auto-Grant
	The chosen option would respectively lead to the next pages.
	The 'pages' would have their own respective embed and fields, like in the gui.js 
		
		May want to make gui.js components in a class heiarchy. Use the object property to get the next page:
			Category.["Create"] --> Points to create modal
		 // Category.[id] --> Points to actual component. (Maybe a better way):
		 // 	Category.get(id) --> Points to Category.["Color"] after running the ID method
			Category.["Color"] --> Points to color component. (Maybe a better way / secondary class)
			Role.["Create"] --> Points to create modal
			Role.["Color"] --> Points to color component. (Maybe a better way / secondary class)
		 // Role.[id] --> Points to actual component. (Maybe a better way):
		 // 	Role.get(id) --> Poins to Role.["Color"] after running ID method
			Role.["Members"] --> Points to add/remove member page.
			Role.["Auto"] --> Points to auto-grant page.

	*/

/* Have a list of applicable member selections:
	Select Members by Category, Role, or All:
		Would have pages for each '25' of the items.
		Storing results per selection-page until user heads back to member selections page, then add to list per that page.

	After, list of all selected members:
		Pages for each '25' of them.
		Prompt selection for members to remove from the role-applying list.
		Each time selected 'n' amount, click Remove, and remove per each sub-page.
		Stay on updated page until none selected.
*/

/*  Have a member role applier, that applies the role to 'n' members. (Side Option)
	Have a list of MemberMenus, each page being 25 of max length. 
	For each menu, allow the user to select 'n' members. Adding those to a list.
	Store the list, per page. (If going back to previous, restore results)
	Store each member, per their ID.
	At the end of the selection, make the user go through each page, state who was selected. (Embed or hidden? Reference using '@User')
	Apply the role to the selected members.
*/
for (const file of eventPaths) { // Loop through each Event script
	const event = require(file) // Import the script
	if (event.once) { // Tell if the event runs once
		client.once(event.name, (...args) => event.execute(...args)) // Execute the method
	}
	else { // The event runs periodicaly
		client.on(event.name, (...args) => event.execute(...args)) // Execute the method
	}
}

client.on("messageCreate", async (message) => {
	try {
		if (message.author.bot) {
			return
		}
		var content = message.content // Simplify message content
		console.log("Content")
		// !Roles [--category | -cat] <role_category>
		if (content.includes("!Roles")) {
			console.log(content)
			var channel = client.channels.cache.find(channel => channel.name === "roles")
            var quotes = grabQuotes(content)
            if (quotes[1] == "create") { // User is attempting to create a role
				console.log("Starting Role Configuration")

				updateMenus(message.guild, RoleBuilderData[0]) // Reinitialize the Category & Role Menus
				
				message.reply(getReactionUI()).then((msg) => {
					console.log("Responded.")
				})
			}
        }
	}
	catch (e) {
		console.log(e)
	}
})

// Need to comb through all the sub-roles in the deleted category and remove them
client.on("messageDelete", async (message) => {
	//var messages = bot_messages.getValue().split("|") // Store the role category messages
	//var categories = role_titles.getValue().split("|") // Store the category titles
	//if (messages.includes(message.id)) { // The message was a role category
//		role_titles.setValue(role_titles.getValue().replace(categories[messages.indexOf(message.id)] + "|", "")) // Remove the role category from the list
//		bot_messages.setValue(bot_messages.getValue().replace(message.id + "|", "")) // Remove the message id from the list
//		console.log("Role Category Deleted")
//	}
})

client.on("messageReactionAdd", async (reaction, user) => {
//	if (user.bot) { // The user is a bot
//		return
//	}
//	message = reaction.message // Store the message
})

client.on("messageReactionRemove", async (reaction, user) => {
//	if (user.bot) { // The user is a bot
//		return
//	}
//	message = reaction.message // Store the message
})

// Login to Discord with your client's token
client.login(token);