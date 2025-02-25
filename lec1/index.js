const express=require('express')

const app=express()

const port=process.env.PORT

app.get('/',(req,res)=>{
    res.send('hello World!')
})

app.get('/twitter',(req,res)=>{
    res.send('ajay sen')
})

app.get('/login',(req,res)=>{
    res.send('<h1>Please login at Ajay server</h1>')
})

app.listen(port,()=>{
    console.log(`app is listening on port ${port}`)
})