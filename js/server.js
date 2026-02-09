import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = 3000;

app.get("/api/search", async (req, res) => {
    const query = req.query.q;
    if (!query) {
        return res.status(400).json({ error: "Query obrigatória" });
    }

    const params = new URLSearchParams({
        engine: "google",
        q: query,
        tbm: "shop",
        hl: "pt",
        gl: "pt",
        safe: "active",
        api_key: "SUA_API_KEY_AQUI"
    });

    try {
        const response = await fetch(
            `https://serpapi.com/search.json?${params.toString()}`
        );
        const data = await response.json();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: "Erro ao consultar SerpAPI" });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
