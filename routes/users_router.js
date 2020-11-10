const usersRouter = require('express').Router()
const { getUsersByName } = require("../controllers/controllers")


usersRouter.route("/:username").get(getUsersByName)




module.exports = usersRouter