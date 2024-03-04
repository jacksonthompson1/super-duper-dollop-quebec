require('dotenv').config();
const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const port = process.env.PORT || 5500;
const {
    MongoClient,
    ServerApiVersion
} = require('mongodb');

// set the view engine to ejs
let path = require('path');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({
    extended: true
}))

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(process.env.MONGO_URI, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server (optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        const result = await client.db("jt-quebec").collection("snowboard").find().toArray();
        console.log("run Result: ", result);
        return result;
    } catch {
        console.log("run() error: ", e);
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}
//reading from mongo
app.get('/', async (req, res) => {
    let result = await run().catch(console.error);
    console.log("myResults:", result); // Corrected variable name
    res.render('index', {
        pageTitle: "JT's Snowboards",
        sbInfo: result // Corrected variable name
    });
});

//create to mongo
app.post('/addBoard', async (req, res) => {
    try {
        await client.connect();
        const collection = client.db("jt-quebec").collection("snowboard");
        await collection.insertOne(req.body);
        console.log("Inserted new board into MongoDB:", req.body);
        res.redirect('/');
    } catch (error) {
        console.error("Error inserting board into MongoDB:", error);
        res.status(500).send("Internal Server Error");
    } finally {
        await client.close(); // Close the client connection after operation
    }
});


app.post('/updateBoard', async (req, res) => {
    try {
        console.log("req.parms.id: ", req.params.id)

        await client.connect(); // Corrected to await the connect function
        const collection = client.db("jt-quebec").collection("snowboard");
        let result = await collection.findOneAndUpdate({
            "_id": ObjectId(req.params.id)
        }, {
            $set: {
                "size": "REALLY BIG DRINK"
            }
        });
        console.log(result);
        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    } finally {
        await client.close();
    }
});

app.post('/deleteBoard', async (req, res) => {
    try {
        console.log("req.parms.id: ", req.params.id)

        await client.connect(); // Corrected to await the connect function
        const collection = client.db("jt-quebec").collection("snowboard");
        let result = await collection.findOneAndDelete({
            "_id": ObjectId(req.params.id)
        });
        console.log(result);
        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    } finally {
        await client.close();
    }
});


app.listen(port, () => {
    console.log(`snowboard app listening on port ${port}`)
});