import { MongoClient } from "mongodb";

export default async function handler(req, res) {

  // CORS FIX
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const client = await MongoClient.connect(process.env.MONGO_URI);
    const db = client.db("Product");

    const { title, description, originalPrice, sellingPrice, images } = req.body;

    const result = await db.collection("Prodlist").insertOne({
      title,
      description,
      originalPrice,
      sellingPrice,
      images,
      createdAt: new Date()
    });

    client.close();

    return res.json({ success: true, id: result.insertedId });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "DB Error" });
  }
}
