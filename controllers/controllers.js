const { checkTopicExists, updateCommentVotes, updateArticleVotes, fetchAllArticles, fetchCommentByArtId, fetchTopics, fetchUserByName, fetchArticleById, createComment, deleteCommentById, fetchComments, fetchAllEndpoints } = require("../models/models")

const getTopics = (req, res, next) => {
    fetchTopics().then((topics) => {
        res.status(200).send(topics);
    })
}

const getUsersByName = (req, res, next) => {
    const username = req.params.username
    fetchUserByName(username).then((userByName) => {
        if (userByName.user.length === 0) {
            return Promise.reject({ status: 404, msg: "Not Found" })
        } else {
            res.status(200).send({ user: userByName.user[0] })
        }
    }).catch(next)
}

const getArticleById = (req, res, next) => {
    const articleId = req.params.article_id
    fetchArticleById(articleId).then((articleById) => {
        res.status(200).send(articleById)
    }).catch(next)
}

const updateArticleById = (req, res, next) => {
    const votes = req.body.inc_votes
    const articleId = req.params.article_id
    updateArticleVotes(articleId, votes).then((updatedArticle) => {
        res.status(200).send(updatedArticle)
    }).catch(next)
}

const addComment = (req, res, next) => {
    const articleId = req.params.article_id
    const username = req.body.username;
    const body = req.body.body;
    createComment(articleId, username, body).then((postedComment) => {
        res.status(201).send(postedComment)
    }).catch(next)
}

const getCommentByArtId = (req, res, next) => {
    const artId = req.params.article_id
    const sortBy = req.query.sort_by
    const order = req.query.order
    fetchCommentByArtId(artId, sortBy, order).then(commentsByArticleId => {
        res.status(200).send(commentsByArticleId)
    }).catch(next)
}

const getArticles = (req, res, next) => {
    const sortBy = req.query.sort_by
    const order = req.query.order
    const author = req.query.author
    const topic = req.query.topic
    const votes = req.query.votes
    const limit = req.query.limit
    const comment_count = req.query.comment_count
    const p = req.query.p

    if (topic) {
        checkTopicExists(topic).then(result => {
            if (!result) return Promise.reject({ status: 404, msg: "Topic Not Found" });
            fetchAllArticles(sortBy, order, author, topic, votes, comment_count, limit, p).then((articles) => {
                res.status(200).send(articles)
            }).catch(next)
        }).catch(next)
    } else {
        fetchAllArticles(sortBy, order, author, topic, votes, comment_count, limit, p).then((articles) => {
            res.status(200).send(articles)
        }).catch(next)
    }

}

const updateCommentById = (req, res, next) => {
    const commentId = req.params.comment_id
    const votesToUpdate = req.body.inc_votes
    updateCommentVotes(commentId, votesToUpdate).then((updatedComment) => {
        res.status(200).send(updatedComment)
    }).catch(next)
}

const removeCommentById = (req, res, next) => {
    const commentId = req.params.comment_id
    deleteCommentById(commentId).then((commentDeleted) => {
        res.sendStatus(204)
    }).catch(next)
}

const getComments = (req, res, next) => {
    fetchComments().then((comments) => {
        res.status(200).send(comments);
    })
}

const getAllEndpoints = (req, res, next) => {
    fetchAllEndpoints((error, endpoints) => {
        if (error) {
            res.status(404).send({ msg: "Not Found" });
        } else {
            res.status(200).send(endpoints)
        }
    })
}



module.exports = { getAllEndpoints, removeCommentById, updateCommentById, getTopics, getArticles, getCommentByArtId, getUsersByName, getArticleById, updateArticleById, addComment, getComments }