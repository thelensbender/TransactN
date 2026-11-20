import express from 'express';
const app = express();

// Express middleware for parsing json
app.use(express.json())

app.get("/health", (req, res)=> {
  res.status(200).json({status: "ok"})
})

export default app;