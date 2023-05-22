// Attempt at storing data

const { LocalStorage } = require('node-localstorage')
const localStorage = new LocalStorage('./scratch');
class Item {
    #id = null
  
    constructor(id, value) {
        this.#id = id
        if (this.getValue() === null) {
            localStorage.setItem(this.#id, JSON.stringify(value))
        }
    }
  
    getValue() {
        return(JSON.parse(localStorage.getItem(this.#id)))
    }
  
    setValue(n) {
        localStorage.setItem(this.#id, JSON.stringify(n))
    }
}

// JSON.parse(str)
// JSON.stringify(obj)

module.exports = { Item }