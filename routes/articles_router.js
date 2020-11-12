const articlesRouter = require('express').Router()
const { getArticleById, getArticles, updateArticleById, addComment, getCommentByArtId } = require("../controllers/controllers")
const { send405 } = require("../controllers/errors")

articlesRouter.route("/:article_id")
    .get(getArticleById)
    .patch(updateArticleById)
    .all(send405)

articlesRouter.route("/:article_id/comments")
    .post(addComment)
    .get(getCommentByArtId)
    .all(send405)

articlesRouter.route("/")
    .get(getArticles)
    .all(send405)



module.exports = articlesRouter