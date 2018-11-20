
    const api = express();
    api.get('/abc',(req,res)=>{
        res.send("Hello abc");    
    });
    api.get('/def',(req,res)=>{
        res.send("Hello def");    
    });
export {api};



