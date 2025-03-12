const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT;


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.get("/", (req, res) => {
    res.render("index");
})

app.post("/generate", async (req, res) => {
    try {
        const topic = req.body.topic ;
        if (!topic){
            return res.status(400).json({message: "Topic is required"});
        }

        const message = await getContent(topic) ;

        if (!message) {
            return res.status(500).json({message: "⚠️ Error in Generating Post, Please retry"});
        }

        return res.status(200).json({message})

    } catch (error) {
        console.log(`[Error] in Generating Content: ${error || error.message}`);
        return res.status(500).json({error: "Internal Server Error"})
    }
})


async function getContent(topic) {
    try {
      const response = await fetch(process.env.BASE_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.API_KEY}`,
          "X-Title": "LinkedIn Post Generator",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "model": process.env.AI_MODEL, 
          "messages": [
            {
              "role": "system",
              "content": process.env.SYSTEM_PROMPT
            },
            {
              "role": "user",
              "content": topic
            }
          ]
        })
      });
      if (!response.ok) {
        return null
      }
      const data = await response.json();
      return data.choices[0].message.content
    } catch (error) {
      console.error("Error:", error);
      return null;
    }
}
  

app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`);
})