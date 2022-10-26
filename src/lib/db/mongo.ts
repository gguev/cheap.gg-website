import { MongoClient } from 'mongodb';

//const uri = import.meta.env.MONGO_URI
const uri = 'mongodb://mongo:2v7u1uqHq2bubsfPhdbQ@containers-us-west-29.railway.app:6098'

let client
let clientPromise

if (!uri) {
  throw new Error('Please add your Mongo URI to .env')
}

if (import.meta.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri)
    global._mongoClientPromise = client.connect()
  }

  clientPromise = global._mongoClientPromise
} else {
  client = new MongoClient(uri)
  clientPromise = client.connect()
}

export default clientPromise