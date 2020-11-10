const { fetchTopics, fetchUserByName, fetchArticleById } = require("../models/models")

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
            res.status(200).send(userByName)
        }
    }).catch(next)
}

const getArticleById = (req, res, next) => {
    const articleId = req.params.article_id
    fetchArticleById(articleId).then((articleById) => {
        res.status(200).send(articleById)
    })
}

module.exports = { getTopics, getUsersByName, getArticleById }