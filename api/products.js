import { MongoClient } from "mongodb";
import multer from "multer";
import nextConnect from "next-connect";

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { files: 7 }
});
res.setHeader("Access-Control-Allow-Origin", "*");
res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
res.setHeader("Access-Control-Allow-Headers", "Content-Type");

const handler = nextConnect();

let client;

async function connectDB() {
    if (!client) {
        client = new MongoClient(process.env.MONGO_URI);
        await client.connect();
    }
    return client.db("Product").collection("Prodlist");
}

handler.use(upload.array("images"));

handler.post(async (req, res) => {
    try {
        const { title, description, originalPrice, sellingPrice } = req.body;

        const imagesBase64 = (req.files || []).map(img =>
            `data:${img.mimetype};base64,${img.buffer.toString("base64")}`
        );

        const col = await connectDB();

        const result = await col.insertOne({
            title,
            description,
            originalPrice,
            sellingPrice,
            images: imagesBase64,
            createdAt: new Date()
        });

        res.status(200).json({
            success: true,
            id: result.insertedId
        });

    } catch (e) {
        console.error("Error:", e);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
});

export const config = {
    api: {
        bodyParser: false
    }
};

export default handler;

