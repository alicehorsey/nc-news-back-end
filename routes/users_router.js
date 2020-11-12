const usersRouter = require('express').Router()
const { getUsersByName } = require("../controllers/controllers")
const { send405 } = require("../controllers/errors")


usersRouter.route("/:username").get(getUsersByName).all(send405)




module.exports = usersRouter