import express from "express";
import path from "path";
import fs from "fs";
import { generateImageWithText } from "./Generate/Whatsapp.js";

const generatedDir = path.join(process.cwd(), "Generated");
const app = express();

if (!fs.existsSync(generatedDir)) {
    fs.mkdirSync(generatedDir);
}

app.use("/images", express.static(path.join(process.cwd(), "Generated")));

function cleanupOldImages() {
    const now = Date.now();
    const files = fs.readdirSync(generatedDir);
    for (const file of files) {
        const filePath = path.join(generatedDir, file);
        const stats = fs.statSync(filePath);
        if (now - stats.mtime.getTime() > 30 * 1000) {
            fs.unlinkSync(filePath);
            console.log(`Deleted old file: ${file}`);
        }
    }
}

setInterval(() => {
    try {
        cleanupOldImages();
        console.log("Cleanup done at " + new Date().toLocaleTimeString('en-US', { hour12: false }));
    } catch (error) {
        console.error("Error during image cleanup:", error);
    }
}, 5000);

// In this route the profile image URL is expected to be passed as a query parameter.
// Make sure you URL-encode the profile URL when calling the API.
app.get("/api/whatsapp/:name/:message", async (req, res) => {
    const { name, message } = req.params;
    const { profile } = req.query; // expect profile URL as a query parameter
    try {
        const imagePath = await generateImageWithText(name, profile, message);
        const imageFile = imagePath.split("/").pop();
        const imageUrl = `${req.protocol}://${req.get("host")}/images/${imageFile}`;
        res.json({ username: name, message, image: imageUrl });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(3000, () => {
    console.log("Server listening on http://localhost:3000");
});