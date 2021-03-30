const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');
require('dotenv').config();
const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.shsop.mongodb.net/burjAlArab?retryWrites=true&w=majority`;
const port = 5000;

const app = express();

app.use(cors());
app.use(bodyParser.json());

var serviceAccount = require('./configs/burf-al-arab-firebase-adminsdk-z2eez-8d1e87f993.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  const bookings = client.db('burjAlArab').collection('bookings');
  console.log('database connected successfully');

  app.post('/addBooking', (req, res) => {
    const newBooking = req.body;
    console.log(newBooking);
    bookings.insertOne(newBooking).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.get('/bookings', (req, res) => {
    const bearer = req.headers.authorization;
    if (bearer && bearer.startsWith('Bearer ')) {
      const idToken = bearer.split(' ')[1];
      console.log(idToken);
      admin
        .auth()
        .verifyIdToken(idToken)
        .then((decodedToken) => {
          const tokenEmail = decodedToken.email;
          const queryEmail = req.query.email;
          if (tokenEmail === queryEmail) {
            bookings.find({ email: queryEmail }).toArray((err, documents) => {
              res.send(documents);
            });
          } else {
            res.status(401).send('un-authorized access');
          }
        })
        .catch((error) => {
          // Handle error
          res.status(401).send('un-authorizied');
        });
    } else {
      res.status(401).send('unAuthorizing access');
    }
  });
});

app.listen(port);
