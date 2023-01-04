const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// QuizeDB
// allQuize

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nz3kcdw.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const allQuizes = client.db("QuizeDB").collection("allQuize");
    const userInfo = client.db("QuizeDB").collection("userInfo");
    
    // get all quize
    app.get("/quize", async (req, res) => {
      const query = {};
      const result = await allQuizes.find(query).toArray();
      const data = [...result].sort(() => 0.5 - Math.random());
      res.send(data);
    });

    // get all user info 

    app.get("/alluserinfo", async (req, res) => {
      const query = {};
      const result = await userInfo.find(query).toArray();
      res.send(result);
    });
    

    // get single userinformation



    app.get("/userinfo", async (req, res) => {
      const email = req.query.email;
      const date = req.query.date;
      const query = { email: email, date: date };
      const result = await userInfo.findOne(query);
      res.send(result);
    });
//  everyday  history
    app.get("/totalinfo", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await userInfo.find(query).sort({ date: "-1" }).toArray();
      res.send(result)
    });

    // store everyday quize info
    app.post("/userifno", async (req, res) => {
      const userinfo = req.body;
      const result = await userInfo.insertOne(userinfo);
      res.send(result);
    });
    // update correct quize ---
    app.put("/correctans", async (req, res) => {
      const email = req.query.email;
      const date = req.query.date;
      const score = req.body.correct;
      const filter = { email: email, date: date };
      const options = { upsert: true };

      const updateDoc = {
        $set: {
          score: score + 1
        },
      };
      const result = await userInfo.updateOne(filter, updateDoc, options);
      res.send(result);
    });

    // update current queston
    app.put("/currentquestion", async (req, res) => {
      const email = req.query.email;
      const date = req.query.date;
      const totalQuestion = req.body.totalanswer;
      const filter = { email: email, date: date };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          currentQuestion: totalQuestion + 1
        },
      };
      const result = await userInfo.updateOne(filter, updateDoc, options);
      res.send(result);
    });

    //  daily incorrect question
    app.put("/incurrentquestion", async (req, res) => {
      const email = req.query.email;
      const date = req.query.date;
      const incurrentquestion = req.body.wrong;
      const filter = { email: email, date: date };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          wrongAns: incurrentquestion + 1
        },
      };
      const result = await userInfo.updateOne(filter, updateDoc, options);
      res.send(result);
    });
  } finally {
  }
}
run().catch(console.log());

app.get("/", (req, res) => {
  res.send("quize app is running!");
});
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
