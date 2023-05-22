const { createCanvas, registerFont } = require('canvas'); // Import the Canvas class
registerFont('./Uni Sans Heavy.otf', { family: 'UniSans' }); // Create the font (Uni Sans Heavy is what Discord uses)

const Canvas = createCanvas(1, 1) // Create a basic Canvas
const Context = Canvas.getContext('2d') // Get the Context of the Canvas
Context.font = '16px UniSans' // Set the font style of the Context

// Invisible Space == 11.9 Pixels 
// Regular Space == 5 Pixels

function measureString(str) { // Measures the display size of a string
    let width = 0 // Add & store the widths of each character
    for (let c of str) { // Loop through each character
        width += Context.measureText(c).width // Increment the width
    }
    return(width) // Return the width of the string
}

function getPadding(str, targetWidth) { // Wrap a string in padding, from the right side
    let remainingWidth = targetWidth - measureString(str) + 1 // Calculate the remaining width
    let enSpaceCount = Math.max(0, Math.round(remainingWidth / 11.9)) // Determine the number of blank spaces to use
    let spaceCount = Math.max(0, Math.round((remainingWidth - enSpaceCount * 11.9)) / 5) // Determine the number of normal spaces to use
    return((' ').repeat(spaceCount) + (' ').repeat(enSpaceCount)) // Return the padding for the string
}

function formatString(str, targetWidth) {
    if (measureString(str) <= targetWidth) { // The string is already correct
        return(str) // Return the original string
    }
    console.log("OutOfBounds: " + str)
    let words = str.split(" ") // Split by each space
    let line = "" // Format each line of words
    str = "" // Erase the string
    for (let word of words) {
        if (measureString(line + " " + word) > targetWidth) { // The line is almost too long
            str += line // Add the line to the string
            line = "\n" + word // Add a newline, to wrap text
            continue // Move to the next word
        }
        line += " " + word // Add the word to the line
    }
    str += line // Add the last line to the string
    return('⁣' + str + '⁣') // Return the formatted string
}

function extendString(str, targetWidth) { // Pad a string with whitespace to meet a certain width
    let result = str + getPadding(str, targetWidth) // Store the padded string
    //if (measureString(result) > targetWidth) { // The extended string exceeds the width
      //  console.log("TooExtended: " + str)
       // result = formatString(result, targetWidth) // Format the string to fit the width
    //}
    return('⁣' + result + '⁣') // Return the string and padding
}

function balanceString(str, targetWidth) { // Wraps a string in padding, from both sides
	let padding = getPadding(str, targetWidth) // Get the padding that should be added
	let spaceCount = padding.length - (padding.length - padding.replace(' ', '')) // Calculate the number of spaces
	let enSpaceCount = padding.length - padding.replace(' ', '') // Calculate the number of invisible spaces
    let spaceWrap = (' ').repeat(Math.round(spaceCount/2)) // Store the padding for regular spaces
    let enSpaceWrap = (' ').repeat(Math.round(enSpaceCount/2)) // Store the padding for blank spaces
	return('⁣' + spaceWrap + enSpaceWrap + str + enSpaceWrap + spaceWrap + '⁣') // Return the string with balanced wrapping
}

module.exports = { balanceString, extendString, formatString, getPadding, measureString }