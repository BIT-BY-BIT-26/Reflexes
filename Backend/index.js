const express = require("express");
const app = express();
app.get('/',(req , res)=>{
    res.json("hi there");
});
const PORT = 3000;
app.listen(PORT,()=>{
    console.log(`Listening to port ${PORT}`);
})
