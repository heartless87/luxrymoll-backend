import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(cors());

const client = new MongoClient(process.env.MONGO_URI);
await client.connect();
const db = client.db("Product");
const collection = db.collection("Prodlist");

app.post("/addProduct", async (req, res) => {
    try {
        const data = req.body;

        let images = {};
        data.images.forEach((img, i) => {
            images[`image-${i+1}`] = img;
        });

        const product = {
            title: data.title,
            description: data.description,
            originalPrice: data.originalPrice,
            sellingPrice: data.sellingPrice,
            ...images,
            createdAt: new Date(),
        };

        await collection.insertOne(product);
        res.json({ success: true, message: "Product saved!" });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

app.listen(10000, () => console.log("Backend running on Render port 10000"));
