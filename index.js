const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const jwt = require('jsonwebtoken')
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId

const port = process.env.PORT || 5000
const app = express()

//middleaware 
app.use(cors())
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.338egrb.mongodb.net/?retryWrites=true&w=majority`
const client = new MongoClient(uri)
console.log(uri);



const educationCallection = client.db('education').collection('service');
const educationReview = client.db('education').collection('review')

const varifyJWT = (req, res, next) => {
    const authorizeton = req.headers.authorizetion;
    console.log(authorizeton);
    if (!authorizeton) {
        res.status(401).send('unauthorize')
    }
    const token = authorizeton.split(' ')[1]

    jwt.verify(token, process.env.SECREET_TOKEN, (error, decoded) => {
        if (error) {
            res.status(401).send('unauthorize')
        }
        req.decoded = decoded
        next()

    })
}


async function run() {
    try {
        app.get('/services', async (req, res) => {
            const limit = parseInt(req.query.limit)
            console.log(limit)
            let query = {}
            const cursor = educationCallection.find(query);
            const result = await cursor.limit(limit).toArray()
            res.send(result);
        })
        app.get('/services/:id', async (req, res) => {
            const { id } = req.params
            const query = { _id: ObjectId(id) }
            const result = await educationCallection.findOne(query)
            res.send(result);
        })

        //post Method heare :-
        app.post('/review', async (req, res) => {
            const info = req.body;
            const result = await educationReview.insertOne(info);
            res.send(result);
        })

        app.get('/review', async (req, res) => {
            const email = req.query.email;
            const id = req.query.id
            let query = {}
            if (email) {
                query = { email }
            }
            if (id) {
                query = { service: id }
            }
            const cursor = educationReview.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })

        app.get('/review', varifyJWT, async (req, res) => {
            let query = {}

            const cursor = educationReview.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })

        app.delete('/review/:id', async (req, res) => {
            const { id } = req.params;
            const query = { _id: ObjectId(id) }
            const result = await educationReview.deleteOne(query)
            res.send(result);
        })

        //jwt api heare
        app.post('/jwt', (req, res) => {
            const user = req.body.email;
            console.log(user);
            const token = jwt.sign({ user }, process.env.SECREET_TOKEN, { expiresIn: '2 days' })
            console.log(token);
            res.send({ token })
        })



    }
    finally {

    }
}

run().catch(console.dir)

app.get('/', (req, res) => {
    res.send('My Education Service Server is Ready')
})


app.listen(port, () => console.log('My Express Server is Ready'))