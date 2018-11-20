exports.router = (app) => {
    app.get('/api',(req, res) => {
        res.send('Hello API');
    });
    return app;
}



