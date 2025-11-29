import dotenv from 'dotenv'
dotenv.config({ quiet: true });

import express from 'express'
import cors from 'cors'
import { generate } from './chatbot.js'


const app=express()
const port=process.env.PORT
app.use(cors())
app.use(express.json())

app.get('/',(req,res)=>{
    res.send('Welcome to ChatBot')
})

app.post('/chat', async (req, res) => {
    try {
        const { message, threadId } = req.body
        
        if (!message || !threadId) {
            return res.status(400).json({ error: 'Message and threadId are required' })
        }
        
        const result = await generate(message, threadId)
        res.json({ message: result })
    } catch (error) {
        console.error('Chat error:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})


app.listen(port,()=>{
    console.log(`server running on port: ${port}`);
})