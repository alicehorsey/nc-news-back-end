const commentsRouter = require('express').Router()
const { updateCommentById, removeCommentById, getComments } = require("../controllers/controllers")
const { send405 } = require("../controllers/errors")


commentsRouter.route("/").get(getComments) //<---- this endpoint is to use in my testing

commentsRouter.route("/:comment_id")
    .patch(updateCommentById)
    .delete(removeCommentById)
    .all(send405)




module.exports = commentsRouter