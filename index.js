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
        const selectedCollection = client.db('ironFistUser').collection('selected')
        const enrolledCollection = client.db('ironFistUser').collection('purchased')
        
        app.post('/postClass', async (req, res) => {
            const body = req.body;
            console.log('body:',body);
            const result = await classCollection.insertOne(body);
            console.log('req',req);
            res.send(result)
        });

        app.post('/postSelected', async (req, res) => {
            const body = req.body;
            console.log('selected body:',body);
            const result = await selectedCollection.insertOne(body);
            console.log('req',req);
            res.send(result)
        });
        
     
        app.post('/postRoles/:email', async (req, res) => {
            const body = req.body;
            const email = req.params.email;
 
            const existingEmail = await rolesCollection.findOne({ email: email });
            if (existingEmail) {
                return res.status(400).send('Email already exists');
            }
            
            const result = await rolesCollection.insertOne(body);
            console.log('req', req);
            res.send(result);
        });
        
        app.patch('/updateClass/:id', async(req, res) => {
            const body = req.body;
            console.log(req.params.id);
            console.log('clicked', body);
            const id = req.params.id;
            const filter = {_id: new ObjectId(id)};
            // const options = { upsert: true };
            const updatedStatus = {
                $set: {
                    ...body
                }
            }
            const result = await classCollection.updateOne(filter, updatedStatus)
            res.send(result)
        })


        app.patch('/status/:id', async(req, res) => {
            const body = req.body;
            console.log(req.params.id);
            console.log('clicked', body);
            const id = req.params.id;
            const filter = {_id: new ObjectId(id)};
            const options = { upsert: true };
            const updatedStatus = {
                $set: {
                    status: body.status
                }
            }
            const result = await classCollection.updateOne(filter, updatedStatus, options)
            res.send(result)
        })


        app.patch('/feedback/:id', async(req, res) => {
            const body = req.body;
            console.log('clicked', body);
            const id = req.params.id;
            const filter = {_id: new ObjectId(id)};
            const options = { upsert: true };
            const updatedStatus = {
                $set: {
                    feedback: body.feedback
                }
            }
            const result = await classCollection.updateOne(filter, updatedStatus, options)
            res.send(result)
        })
        
        
        
        app.patch('/admin/roles/:email', async (req, res) => {
            
            const email = req.params.email;
            const filter = { email: email };
            const updateDoc = {
                $set: {
                    role: 'Admin'
                },
            };
            
            const result = await rolesCollection.updateOne(filter, updateDoc);
            console.log(result, email);
            res.send(result);
        });
        
        app.patch('/instructor/roles/:email', async (req, res) => {
            const email = req.params.email;
            const filter = { email: email };
            const updateDoc = {
                $set: {
                    role: 'Instructor'
                },
            };
            
            const result = await rolesCollection.updateOne(filter, updateDoc);
            console.log(result, email);
            res.send(result);
        });
        
        app.get('/classes', async (req, res) => {
            console.log(req.params.type);
            
            const result = await classCollection.find({}).sort({ date: -1 }).toArray();
            res.send(result);
            
        })
        app.get('/roles', async (req, res) => {
            console.log(req.params.type);
            
            const result = await rolesCollection.find({}).sort({ date: -1 }).toArray();
            console.log(result);
            res.send(result);
            
        })     
        app.get('/selected', async (req, res) => {
            console.log(req.params.type);
            
            const result = await selectedCollection.find({}).sort({ date: -1 }).toArray();
            console.log(result);
            res.send(result);
            
        })     
        
        //? app.get('/roles/:email', async (req, res) => {
        //?    console.log(req.params.type);
        //?    const email = req.params.email
        //?    const result = await rolesCollection.findOne({ email: new ObjectId(email) });
        //?    res.send(result);
        
        // })
        
        app.get('/role/:id', async (req, res) => {
            const id = req.params.id;
            
            try {
                const result = await rolesCollection.findOne({ _id: new ObjectId(id) });
                res.send(result);
            } catch (error) {
                console.error('Error fetching data:', error);
                res.status(500).send('Error fetching data');
            }
        });
        app.get('/role/email/:email', async (req, res) => {
            const email = req.params.email;
            
            try {
                const result = await rolesCollection.findOne({ email });
                res.send(result);
            } catch (error) {
                console.error('Error fetching data:', error);
                res.status(500).send('Error fetching data');
            }
        });

        app.get('/selected/:id', async (req, res) => {
            const selectedId = req.params.id;
            
            try {
                const result = await selectedCollection.findOne({ selectedId });
                res.send(result);
            } catch (error) {
                console.error('Error fetching data:', error);
                res.status(500).send('Error fetching data');
            }
        });
        
       
        
     
        
        
        app.get('/myClasses/:email', async (req, res) => {
            if(req.query.sort == 'asc'){
                const result = await classCollection.find({ email: req.params.email}).sort({ price: 1 }).toArray();
                res.send(result);
                
            }
            else{
                const result = await classCollection.find({ email: req.params.email}).sort({ price: -1 }).toArray();
                res.send(result);
            }
            
        })

        app.delete('/selected/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id)}
            const result = await selectedCollection.deleteOne(query);
            res.send(result)
        })
        
        
        /* const indexKeys = { productName: 1, brand: 1 };
        const indexOptions = { name: 'brandName '};
        const result = await toyCollection.createIndex(indexKeys, indexOptions)
        
        app.get('/allToy/:productName', async (req, res) => {
            const searchText = req.params.productName;
            // const result = await toyCollection.find({ productName: req.params.productName}).toArray();
            const result = await toyCollection.find({
                $or: [
                    { productName: {$regex: searchText, $options: 'i'}},
                    { brand: { $regex: searchText, $options: 'i'}}
                ]
            }).toArray();
            res.send(result);
        })
        
        
        app.get('/myToys/:email', async (req, res) => {
            if(req.query.sort == 'asc'){
                const result = await toyCollection.find({ email: req.params.email}).sort({ price: 1 }).toArray();
                res.send(result);
                
            }
            else{
                const result = await toyCollection.find({ email: req.params.email}).sort({ price: -1 }).toArray();
                res.send(result);
            }
            
        })
        
        
        app.get('/details/:id', async (req, res) => {
            console.log(req.params.id);
            const id = req.params.id;
            const result = await toyCollection.findOne({_id: new ObjectId(id)});
            res.send(result)
        })
        
        
        app.delete('/myToys/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id)}
            const result = await toyCollection.deleteOne(query);
            res.send(result)
        }) */
        
        
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