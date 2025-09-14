require('dotenv').config()
const express = require('express')
const Person = require('./models/person.js')
const app = express()
const morgan = require('morgan')
//const cors = require('cors')


app.use(express.json())
//app.use(cors())
app.use(express.static('dist'))

morgan.token('body', (request, response) => {
    return JSON.stringify(request.body)
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

const persons = []

app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
})

app.get('/info', (request, response) => {
    const date = new Date
    const l = persons.length
    response.send(
        `
        <div>
        this phonebook has info for ${l} people.
        </div>
        <div>
        ${date}
        </div>
        `
    )
    
})

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const person = persons.find(p => p.id === id)
    if (person) {
        response.json(person)
    } else{
        response.status(404).end()
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    persons = persons.filter(p => p.id !== id)
    response.status(204).end()
})


app.post('/api/persons', (request, response) => {
    const body = request.body
    if(!body.name || !body.number) {
        return response.status(404).json(
            {
                error: "a contact must have a name and a number"
            }
        )
    }

    const person = new Person({
        name: body.name,
        number: body.number
    })
    person.save().then(savedCont => {
        response.json(savedCont)
    })    
})

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`The mf App is running now on port ${PORT}`);
})