const { count } = require("../db/connection")
const connection = require("../db/connection")

const fetchTopics = () => {
    return connection
        .select('*')
        .from('topics')
        .then(topicRows => {
            return { topics: topicRows }
        })
}

const fetchUserByName = (username) => {
    return connection
        .select('*')
        .from('users')
        .where('username', '=', username)
        .then((user) => {
            return { user }
        })
}

const fetchArticleById = (id) => {
    console.log(id)
    return Promise.all([connection
        .select('*')
        .from('comments')
        .where('article_id', '=', id),
    connection
        .select('*')
        .from('articles')
        .where('article_id', '=', id)])
        .then((response) => {
            const articleById = (response[1][0])
            articleById.comment_count = response[0].length
            return { article: articleById }
        })
}


module.exports = { fetchTopics, fetchUserByName, fetchArticleById }