const connection = require("../db/connection");
const fs = require("fs");


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
    // console.log(id) //342
    return Promise.all([connection
        .select('*')
        .from('comments')
        .where('article_id', '=', id),
    connection
        .select('*')
        .from('articles')
        .where('article_id', '=', id)])
        .then((response) => {
            if (response[0].length === 0) {
                return Promise.reject({ status: 404, msg: "Article_Id Not Found" })
            } else {
                const articleById = (response[1][0])
                articleById.comment_count = response[0].length
                return { article: articleById }
            }
        })
}

const updateArticleVotes = (id, num = 0) => {
    return connection('articles')
        .where("article_id", "=", id)
        .increment("votes", num)
        .returning("*")
        .then(updatedArticle => {
            if (updatedArticle.length === 0) {
                return Promise.reject({ status: 404, msg: "Article Id Not Found" })
            }
            return { updatedArticle: updatedArticle }//updated this
        })
}

const createComment = (articleId, username, body) => {

    if (!body.length) {
        return Promise.reject({ status: 400, msg: "Comment Not Found" })
    }

    const newComment = {
        author: username,
        article_id: articleId,
        body: body,
        created_at: new Date()
    }

    return connection
        .insert(newComment)
        .into('comments')
        .returning("*")
        .then(addedComment => {
            return { postedComment: addedComment }
        })
}

const fetchCommentByArtId = (artId, sortBy = "created_at", order = "desc") => {
    return connection
        .select('*')
        .from('comments')
        .where('article_id', '=', artId)
        .orderBy(sortBy, order)
        .then(commentsRows => {
            if (!commentsRows.length) {
                return Promise.reject({ status: 404, msg: "Article Id Not Found" })
            }
            const editedComments = commentsRows.map(({ article_id, ...restOfComment }) => {
                const newComment = { ...restOfComment }
                return newComment
            })
            return { commentsByArticleId: editedComments }
        })
}


const checkTopicExists = (topic) => {
    return connection
        .select('*')
        .from("articles")
        .where("topic", "=", topic)
        .then((topics) => {
            if (topics.length === 0) return false;
            else return true;
        })
}
// this model needs to be accessed from controller

const fetchAllArticles = (sortBy = "created_at", order = "desc", author, topic, limit = 10, p = 1) => {
    const offset = limit * (p - 1)


    //Need another model function to check the db for the total count which will not take into consideration the limit 

    return connection
        .select("articles.*")
        .count('comment_id AS comment_count')
        .from("articles")
        .leftJoin('comments', 'articles.article_id', '=', 'comments.article_id')
        .groupBy('articles.article_id')
        .orderBy(sortBy, order)
        .limit(limit).offset(offset)
        .modify((query) => {
            if (author) {
                query.where('articles.author', '=', author)
            }
            if (topic) {
                query.where('articles.topic', '=', topic)
            }
        })
        .then(articlesRows => {
            if (!articlesRows.length) {
                return Promise.reject({ status: 404, msg: "Author Not Found" })
            }
            const editedArticles = articlesRows.map(({ body, ...restOfArticle }) => {
                const newArticle = { ...restOfArticle }
                return newArticle
            })
            return { articles: editedArticles }
        })
}


const updateCommentVotes = (id, num) => {
    return connection('comments')
        .where("comment_id", "=", id)
        .increment("votes", num)
        .returning("*")
        .then(updatedComment => {
            if (updatedComment.length === 0) {
                return Promise.reject({ status: 404, msg: "Comment Id Not Found" })

            }
            return { updatedComment }
        })
}

const deleteCommentById = (id) => {
    return connection('comments')
        .where({ comment_id: id })
        .del()
        .then((confirmation) => {
            if (confirmation === 0) {
                return Promise.reject({ status: 404, msg: "Comment Not Found" })

            }
            return { success: `${confirmation} comment deleted` }
        })
}

const fetchComments = () => {
    return connection
        .select('*')
        .from('comments')
        .then(commentRows => {
            return { comments: commentRows }
        })
}

const fetchAllEndpoints = (cb) => {
    fs.readFile("./db/endpoints.json", "utf8", (error, endpoints) => {
        if (error) cb(error)
        else {
            cb(null, JSON.parse(endpoints))
        }
    })
}


module.exports = { fetchAllEndpoints, updateArticleVotes, fetchAllArticles, fetchCommentByArtId, fetchTopics, fetchUserByName, fetchArticleById, createComment, updateCommentVotes, deleteCommentById, fetchComments }