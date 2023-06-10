const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.surgvec.mongodb.net/?retryWrites=true&w=majority`;
console.log(process.env.DB_USER);

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();
        
        const classCollection = client.db('ironFistUser').collection('classes')
        const rolesCollection = client.db('ironFistUser').collection('roles')
        
        app.post('/postClass', async (req, res) => {
            const body = req.body;
            console.log('body:',body);
            const result = await classCollection.insertOne(body);
            console.log('req',req);
            res.send(result)
        });

        app.post('/postRoles', async (req, res) => {
            const body = req.body;
            console.log('body:',body);
            const result = await rolesCollection.insertOne(body);
            console.log('req',req);
            res.send(result)
        });
        
        app.patch('/roles/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updateDoc = {
                $set: {
                    role: 'Instructor'
                },
            };

            const result = await rolesCollection.updateOne(filter, updateDoc);
            res.send(result)
        })
       
        
        
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('market running')
})

app.listen(port, () => {
    console.log(`Running Server port ${port}`);
})