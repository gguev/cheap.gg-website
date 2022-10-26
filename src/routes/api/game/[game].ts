import clientPromise from '$lib/db/mongo';
import scraper from '$lib/scraper';

// instead of connecting to DB, put scraper logic here
// 

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function GET({ params }) {
  const game = params.game

  // const dbConnection = await clientPromise
  // const db = dbConnection.db('cheapgg')
  //const collection = db.collection(import.meta.env.DB_COLLECTION)
  // const collection = db.collection('keys')
  // const keys = await collection.find().toArray()

  const data = await scraper(game)

  return {
    status: 200,
    headers: {
      'access-control-allow-origin': '*'
    },
    body: {
      data
    }
  };
}