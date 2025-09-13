const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')

app.use(express.json())
app.use(cors())

morgan.token('body', (request, response) => {
    return JSON.stringify(request.body)
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))


let persons = [
    {
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/api/persons', (request, response) => {
    response.json(persons)
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
    const names = persons.map(n => n.name)

    if(!body.name || !body.number) {
        return response.status(404).json(
            {
                error: "a contact must have a name and a number"
            }
        )
    } else if (names.includes(body.name)) {
        return response.status(400).json(
            {
                error: "contacy already exists."
            }
        )
    }
    const person = {
        name: body.name,
        number: body.number,
        id: String(Math.floor(Math.random()*1000))
    }
    persons = persons.concat(person)
    response.json(person)
    
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`The mf App is running now on port ${PORT}`);
})