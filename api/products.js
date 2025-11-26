import { MongoClient } from "mongodb";
import multer from "multer";
import nextConnect from "next-connect";

const handler = nextConnect();

// Allow CORS
handler.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  next();
});

// Multer Config
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { files: 7 }
});

handler.use(upload.array("images", 7));

let client = null;

async function dbConnect() {
  if (!client) {
    client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
  }
  return client.db("Product").collection("Prodlist");
}

handler.post(async (req, res) => {
  try {
    const { title, description, originalPrice, sellingPrice } = req.body;

    const imagesBase64 = req.files.map(file =>
      `data:${file.mimetype};base64,${file.buffer.toString("base64")}`
    );

    const col = await dbConnect();

    const product = {
      title,
      description,
      originalPrice,
      sellingPrice,
      images: imagesBase64,
      createdAt: new Date()
    };

    const result = await col.insertOne(product);

    res.status(200).json({ success: true, id: result.insertedId });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ success: false, error: "Server Error" });
  }
});

export const config = {
  api: {
    bodyParser: false
  }
};

export default handler;
