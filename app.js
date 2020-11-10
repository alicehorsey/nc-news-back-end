const express = require("express")
const app = express();
const apiRouter = require("./routes/api_router")
const { send404, handleInternalErrors, handleCustomErrors } = require("./controllers/errors")


app.use('/api', apiRouter);
app.all('/*', send404);

app.use(handleCustomErrors)
app.use(handleInternalErrors);


module.exports = app;
