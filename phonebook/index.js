require('dotenv').config()
const express = require('express')
const Person = require('./models/person.js')
const app = express()
const morgan = require('morgan')

app.use(express.json())
app.use(express.static('dist'))

morgan.token('body', (request, response) => {
    return JSON.stringify(request.body)
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).send({error: 'Name is too short and/or number format is invalid, double check your input.'})
    }
    next(error)
}

app.get('/api/persons', (request, response, next) => {
    Person.find({}).then(persons => {
        response.json(persons)
    }).catch(error => next(error))
})

app.get('/info', (request, response) => {
    Person.countDocuments({}).then(l => {
        const date = new Date
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
})

app.delete('/api/persons/:id', (request, response, next) => {
    const id = request.params.id
    Person.findByIdAndDelete(id).then(result => {
        if (result) {
            response.status(204).end()
        } else {
            response.status(404).json({error: 'Person not found.'})
        }
    }).catch(error => {
        next(error)
    })
})

app.get('/api/persons/:id', (request, response, next) => {
    const id = request.params.id
    Person.findById(id).then(result => {
        if (result) {
            response.json(result)
        } else {
            response.status(404).end()
        }
    }).catch(error => next(error))
    
})


app.post('/api/persons', (request, response, next) => {
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
    }).catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body
    const id = request.params.id
    
    if (!body.number) {
        return response.status(400).json({error: 'you must enter a phone number.'})
    }

    Person.findById(id).then(person => {
        if (!person) {
            return response.status(404).end()
        }

        person.name = body.name
        person.number = body.number

        return person.save().then(updatedPerson => {
            response.json(updatedPerson)
        })
    }).catch(error => {
        next(error)
    })
})

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`The mf App is running now on port ${PORT}`);
})