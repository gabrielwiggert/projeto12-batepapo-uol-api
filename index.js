import express from 'express';
import cors from 'cors';
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import joi from 'joi'
import dayjs from 'dayjs'
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
    const newUser = await db.collection('users').findOne(user);
    if (newUser) {
      return res.sendStatus(409);
    }

    const userRegister = {name: user.name, lastStatus: Date.now()};
    const hour = dayjs().hour();
    const minute = dayjs().minute();
    const second = dayjs().second();
    const time = `${hour}:${minute}:${second}`;
    const messageUser = {from: user.name, to: 'Todos', text: 'entra na sala...', type: 'status', time};

    await db.collection("users").insertOne(userRegister);
    await db.collection("messages").insertOne(messageUser);
    res.sendStatus(201);
	 } catch (error) {
	  res.status(422).send('Erro no cadastro');
	 }
});

app.get("/participants", (req, res) => {
	db.collection("users").find().toArray().then(users => {
		res.send(users);
	});
});

const messageSchema = joi.object({
  to: joi.string().required(),
  text: joi.string().required(),
  type: joi.string().required().valid('message', 'private_message')
});

app.post("/messages", async (req, res) => {
  let message = req.body;
  const user = req.headers.user;
  const validation = messageSchema.validate(message);

  if (validation.error) {
    console.log(validation.error.details);
    return res.sendStatus(422);
  }

  try {
    const participant = await db.collection('users').findOne({name: user});
    if (!participant) {
      return res.sendStatus(422);
    }

    const hour = dayjs().hour();
    const minute = dayjs().minute();
    const second = dayjs().second();
    const time = `${hour}:${minute}:${second}`;
    const messageUser = {from: user, to: message.to, text: message.text, type: message.type, time};

    await db.collection("messages").insertOne(messageUser);
    res.sendStatus(201);
	 } catch (error) {
	  res.status(422);
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