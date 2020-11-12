const topicsRouter = require('express').Router()
const { getTopics } = require("../controllers/controllers")
const { send405 } = require("../controllers/errors")


topicsRouter.route("/").get(getTopics).all(send405)




module.exports = topicsRouter