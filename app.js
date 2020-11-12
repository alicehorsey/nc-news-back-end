const express = require("express")
const app = express();
const apiRouter = require("./routes/api_router")
const { send404, handleInternalErrors, handlePSQLErrors, handleCustomErrors } = require("./controllers/errors")

app.use(express.json())

app.use('/api', apiRouter);
app.all('/*', send404);

app.use(handlePSQLErrors)
app.use(handleCustomErrors)
app.use(handleInternalErrors);


module.exports = app;
