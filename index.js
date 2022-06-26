import express from 'express';
import cors from 'cors';
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import joi from 'joi'
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;

mongoClient.connect().then(() => {
	db = mongoClient.db("API_UOL");
});

const userSchema = joi.object({
  name: joi.string().required(),
});

app.post("/participants", async (req, res) => {
  let user = req.body;
  const validation = userSchema.validate(user);

  if (validation.error) {
    console.log(validation.error.details);
    return;
  }

  try {
    await db.collection("users").insertOne(user);
    res.send("OK");
	 } catch (error) {
	  res.status(422).send('Erro no cadastro');
	 }
});

app.listen(5000);

/*

app.get('/livros', async (req, res) => {
  try {
		await mongoClient.connect();
		const dbLivros = mongoClient.db("biblioteca")
		const livrosCollection = dbLivros.collection("livros");
		const livros = await livrosCollection.find({}).toArray();
				
		res.send(livros)
		mongoClient.close()
	 } catch (error) {
	  res.status(500).send('A culpa foi do estagiário')
		mongoClient.close()
	 }
});

app.get("/usuarios", (req, res) => {
	// buscando usuários
	db.collection("users").find().toArray().then(users => {
		console.log(users); // array de usuários
	});
});

app.post('/tweets', (req, res) => {
    let response = req.body;
    let username = response.username;
    let tweet = response.tweet;
    let correspondingUser = users.find(user => user.username === response.username);
    let avatar = correspondingUser.avatar;
    let fullTweet = {
        username,
		avatar,
	    tweet
    }
    tweets.push(fullTweet);
    res.send("OK");
  });

app.get("/tweets", (req, res) => {
    let lastTenTweets = [];
    for (let i = 0; i < 10 && tweets.length - i > 0; i++) {
        lastTenTweets.push(tweets[(tweets.length - 1) - i]);
    }
    res.send(lastTenTweets);
});

*/