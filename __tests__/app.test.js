const connection = require("../db/connection")
const app = require("../app")
const request = require("supertest");
const { response } = require("../app");
const { TestScheduler } = require("jest");


describe("testing the app", () => {
    afterAll(() => {
        return connection.destroy();
    });

    beforeEach(() => {
        return connection.seed.run();
    })

    test("404 Not Found when route is missing", () => {
        const allMethods = ["get", "post", "patch", "put", "delete"]
        const requestPromises = allMethods.map((method) => {
            return request(app)
            [method]("/notARoute")
                .expect(404)
                .then(({ body }) => {
                    expect(body.msg).toBe("Not Found")
                })
        })
    })

    describe("/topics", () => {
        test("GET status 200 when all topics data is returned", () => {
            return request(app)
                .get('/api/topics')
                .expect(200)
                .then(response => {
                    const expectedOutput = {
                        "topics": [
                            {
                                description: 'The man, the Mitch, the legend',
                                slug: 'mitch'
                            },
                            {
                                description: 'Not dogs',
                                slug: 'cats',
                            },
                            {
                                description: 'what books are made of',
                                slug: 'paper',
                            },
                        ]
                    }
                    expect(response.body).toEqual(expectedOutput);
                })
        })

        test("GET status 405 when method is not allowed", () => {
            const invalidMethods = ["post", "patch", "put", "delete"]
            const requestPromises = invalidMethods.map((method) => {
                return request(app)
                [method]('/api/topics')
                    .expect(405)
                    .then(({ body }) => {
                        expect(body.msg).toBe("Invalid Method")
                    })
            })
            return Promise.all(requestPromises)
        })

    })

    describe("/users", () => {
        test("GET status 200 when given a valid username parametric endpoint", () => {
            return request(app)
                .get('/api/users/rogersop')
                .expect(200)
                .then(response => {
                    expect(Object.keys(response.body.user[0])).toEqual(expect.arrayContaining(['username', 'avatar_url', 'name']))
                })
        })
        test("GET status 404 when given a non existent username parametric endpoint", () => {
            return request(app)
                .get('/api/users/notAName')
                .expect(404)
                .then(({ body }) => {
                    expect(body.msg).toBe("Not Found")
                })
        })
        test("GET status 405 when method is not allowed", () => {
            const invalidMethods = ["post", "patch", "put", "delete"]
            const requestPromises = invalidMethods.map((method) => {
                return request(app)
                [method]('/api/users/:username')
                    .expect(405)
                    .then(({ body }) => {
                        expect(body.msg).toBe("Invalid Method")
                    })
            })
            return Promise.all(requestPromises)
        })

    })

    describe("/articles/:article_id", () => {
        test("GET status 200 when given a valid article id parametric endpoint", () => {
            return request(app)
                .get('/api/articles/1')
                .expect(200)
                .then(({ body: { article } }) => {
                    expect(Object.keys(article)).toEqual(expect.arrayContaining(['article_id', 'title', 'body', 'votes', 'topic', 'author', 'created_at', 'comment_count']))
                    expect(article.comment_count).toBe(13)
                })
        })
        test("GET status 404 when given a non existent article id parametric endpoint", () => {
            return request(app)
                .get('/api/articles/342')
                .expect(404)
                .then(({ body }) => {
                    expect(body.msg).toBe("Article_Id Not Found")
                })
        })
        test("GET status 400 when given an article id parametric endpoint which is not a number", () => {
            return request(app)
                .get('/api/articles/thirtytwo')
                .expect(400)
                .then(({ body }) => {
                    expect(body.msg).toBe("Bad Request")
                })
        })
        test("PATCH status 200 incrementing votes by given number for certain id, returning an updatedArticle object", () => {
            return request(app)
                .patch('/api/articles/1')
                .send({ inc_votes: 15 })
                .expect(200)
                .then(({ body: { updatedArticle } }) => {
                    expect(updatedArticle[0].votes).toBe(115)
                })
        })
        test("PATCH status 200 decrementing votes by given number for certain id, returning an updatedArticle object", () => {
            return request(app)
                .patch('/api/articles/1')
                .send({ inc_votes: -100 })
                .expect(200)
                .then(({ body: { updatedArticle } }) => {
                    expect(updatedArticle[0].votes).toBe(0)
                })
        })
        test("PATCH status 400 error when given a non existent article id and valid vote number", () => {
            return request(app)
                .patch('/api/articles/one')
                .send({ inc_votes: 10 })
                .expect(400)
                .then(response => {
                    expect(response.body.msg).toBe("Bad Request")
                })
        })
        test("PATCH status 400 error when given a valid article id but a vote number which is not a number", () => {
            return request(app)
                .patch('/api/articles/3')
                .send({ inc_votes: "twenty" })
                .expect(400)
                .then(response => {
                    expect(response.body.msg).toBe("Bad Request")
                })
        })
        test("PATCH status 404 Not Found when article id does not exist in database", () => {
            return request(app)
                .patch("/api/articles/100")
                .send({ inc_votes: 10 })
                .expect(404)
                .then(({ body: { msg } }) => {
                    expect(msg).toBe("Article Id Not Found")
                })
        })
        test("GET status 405 when method is not allowed", () => {
            const invalidMethods = ["post", "put", "delete"]
            const requestPromises = invalidMethods.map((method) => {
                return request(app)
                [method]('/api/articles/:article_id')
                    .expect(405)
                    .then(({ body }) => {
                        expect(body.msg).toBe("Invalid Method")
                    })
            })
            return Promise.all(requestPromises)
        })
    })

    describe("POST /api/articles/:article_id/comments", () => {
        test("POST status 201 returns the posted comment", () => {
            return request(app)
                .post('/api/articles/2/comments')
                .send({ username: "icellusedkars", body: "Somewhere inside all of us is the power to change the world" })
                .expect(201)
                .then(({ body }) => {
                    expect(body.postedComment[0].comment_id).toBe(19)
                    expect(Object.keys(body.postedComment[0])).toEqual(["comment_id",
                        "author",
                        "article_id",
                        "votes",
                        "created_at",
                        "body"])
                    expect(body.postedComment[0].author).toBe("icellusedkars")
                    expect(body.postedComment[0].body).toBe("Somewhere inside all of us is the power to change the world")
                })

        })
        test("POST status 400 returns Bad Request when non existent article_id value given", () => {
            return request(app)
                .post('/api/articles/two/comments')
                .send({ username: "icellusedkars", body: "Somewhere inside all of us is the power to change the world" })
                .expect(400)
                .then(({ body }) => {
                    expect(body.msg).toBe("Bad Request")
                })
        })
        test("POST status 404 returns Not Found when given a username which does not exist", () => {
            return request(app)
                .post('/api/articles/3/comments')
                .send({ username: "Matilda", body: "Somewhere inside all of us is the power to change the world" })
                .expect(404)
                .then(({ body }) => {
                    expect(body.msg).toBe("Not Found")
                })
        })
        test("POST status 400 returns Comment Not Found when given an empty string for the body", () => {
            return request(app)
                .post('/api/articles/2/comments')
                .send({ username: "icellusedkars", body: "" })
                .expect(400)
                .then(({ body }) => {
                    expect(body.msg).toBe("Comment Not Found")
                })
        })

        test("GET status 200 returns all the comments with the given article id", () => {
            return request(app)
                .get('/api/articles/1/comments')
                .expect(200)
                .then(({ body: { commentsByArticleId } }) => {
                    expect(Array.isArray(commentsByArticleId)).toBe(true)
                    expect(Object.keys(commentsByArticleId[0])).toEqual(['comment_id', 'author', 'votes', 'created_at', 'body'])
                })
        })
        test("GET status 200 returns all the comments with the given article id sorted by query column ", () => {
            return request(app)
                .get('/api/articles/1/comments?sort_by=votes')
                .expect(200)
                .then(({ body: { commentsByArticleId } }) => {
                    expect(commentsByArticleId).toBeSortedBy("votes", { descending: true, coerce: true })
                })
        })
        test("GET status 200 returns all the comments with the default sort_by as created_at", () => {
            return request(app)
                .get('/api/articles/1/comments')
                .expect(200)
                .then(({ body: { commentsByArticleId } }) => {
                    expect(commentsByArticleId).toBeSortedBy("created_at", { descending: true, coerce: true })

                })
        })
        test("GET status 200 returns all the comments with the given article id ordered by default in descending order ", () => {
            return request(app)
                .get('/api/articles/1/comments?order=asc')
                .expect(200)
                .then(({ body: { commentsByArticleId } }) => {
                    expect(commentsByArticleId).toBeSortedBy("created_at", { descending: true, coerce: true })
                })
        })
        test("GET status 200 returns all the comments with the given article id ordered by ascending query order ", () => {
            return request(app)
                .get('/api/articles/1/comments?order=asc')
                .expect(200)
                .then(({ body: { commentsByArticleId } }) => {
                    expect(commentsByArticleId).toBeSortedBy("created_at", { coerce: true })
                })
        })
        test("GET status 404 when column name to sort by does not exist", () => {
            return request(app)
                .get('/api/articles/1/comments?sort_by=magazines')
                .expect(404)
                .then(({ body: { msg } }) => {
                    expect(msg).toBe("Not Found")
                })
        })
        test("GET status 404 when given an article_id which does not exist", () => {
            return request(app)
                .get('/api/articles/100/comments')
                .expect(404)
                .then(({ body: { msg } }) => {
                    expect(msg).toBe("Article Id Not Found")
                })
        })
        test("GET status 405 when method is not allowed", () => {
            const invalidMethods = ["patch", "put", "delete"]
            const requestPromises = invalidMethods.map((method) => {
                return request(app)
                [method]('/api/articles/:article_id/comments')
                    .expect(405)
                    .then(({ body }) => {
                        expect(body.msg).toBe("Invalid Method")
                    })
            })
            return Promise.all(requestPromises)
        })
    })

    describe("GET /api/articles", () => {
        test("GET status 200 returns array of articles with comment count property", () => {
            return request(app)
                .get('/api/articles')
                .expect(200)
                .then(({ body: { articles } }) => {
                    const allArticlesHaveCommentCount = articles.every((article) => article.hasOwnProperty('comment_count'))
                    expect(allArticlesHaveCommentCount).toBe(true)
                })
        })
        test("GET status 200 returns array of articles which defaults to sorting by date", () => {
            return request(app)
                .get('/api/articles')
                .expect(200)
                .then(({ body: { articles } }) => {
                    expect(articles).toBeSortedBy("created_at", { coerce: true })
                })
        })
        test("GET status 200 returns array of articles sorted by column given in query", () => {
            return request(app)
                .get('/api/articles?sort_by=author')
                .expect(200)
                .then(({ body: { articles } }) => {
                    expect(articles).toBeSortedBy("author", { coerce: true })
                })
        })
        test("GET status 200 returns array of articles in descending order by default", () => {
            return request(app)
                .get('/api/articles')
                .expect(200)
                .then(({ body: { articles } }) => {
                    expect(articles).toBeSortedBy("created_at", { descending: true, coerce: true })
                })
        })
        test("GET status 200 returns array of articles in ascending order if query given", () => {
            return request(app)
                .get('/api/articles?order=asc')
                .expect(200)
                .then(({ body: { articles } }) => {
                    expect(articles).toBeSortedBy("created_at", { coerce: true })
                })
        })
        test("GET status 200 returns array of articles by given author", () => {
            return request(app)
                .get('/api/articles?author=rogersop')
                .expect(200)
                .then(({ body: { articles } }) => {
                    const allAuthorsRogersop = articles.every((article) => article.author === "rogersop")
                    expect(allAuthorsRogersop).toBe(true)
                })
        })
        test("GET status 200 returns array of articles by given topic", () => {
            return request(app)
                .get('/api/articles?topic=cats')
                .expect(200)
                .then(({ body: { articles } }) => {
                    const allTopicsCats = articles.every((article) => article.topic === "cats")
                    expect(allTopicsCats).toBe(true)
                })
        })
        test("GET status 404 when column given as query to sort by does not exist", () => {
            return request(app)
                .get('/api/articles?sort_by=publisher')
                .expect(404)
                .then(({ body: { msg } }) => {
                    expect(msg).toBe("Not Found")
                })
        })
        test("GET status 404 when author given to filter results by does not exist", () => {
            return request(app)
                .get('/api/articles?author=Dickens')
                .expect(404)
                .then(({ body: { msg } }) => {
                    expect(msg).toBe("Author Not Found")
                })
        })
        test("GET status 405 when method is not allowed", () => {
            const invalidMethods = ["post", "patch", "put", "delete"]
            const requestPromises = invalidMethods.map((method) => {
                return request(app)
                [method]('/api/articles')
                    .expect(405)
                    .then(({ body }) => {
                        expect(body.msg).toBe("Invalid Method")
                    })
            })
            return Promise.all(requestPromises)
        })
    })

    describe("PATCH /api/comments/:comment_id", () => {

        test("PATCH status 200 incrementing votes by given number for certain id, returning an updatedComment object", () => {
            return request(app)
                .patch("/api/comments/1")
                .send({ inc_votes: 10 })
                .expect(200)
                .then(({ body }) => {
                    expect(body.updatedComment[0].votes).toBe(26)
                    expect(Object.keys(body.updatedComment[0])).toEqual(["comment_id", "author", "article_id", "votes", "created_at", "body"])
                })
        })
        test("PATCH status 200 decreasing votes by given number for certain id, returning an updatedComment object", () => {
            return request(app)
                .patch("/api/comments/1")
                .send({ inc_votes: -10 })
                .expect(200)
                .then(({ body }) => {
                    expect(body.updatedComment[0].votes).toBe(6)
                    expect(Object.keys(body.updatedComment[0])).toEqual(["comment_id", "author", "article_id", "votes", "created_at", "body"])
                })
        })
        test("PATCH status 404 Not Found when comment id does not exist in database", () => {
            return request(app)
                .patch("/api/comments/435")
                .send({ inc_votes: 10 })
                .expect(404)
                .then(({ body: { msg } }) => {
                    expect(msg).toBe("Comment Id Not Found")
                })
        })
        test("PATCH status 400 when comment id is not a number but vote number is ok", () => {
            return request(app)
                .patch("/api/comments/four")
                .send({ inc_votes: 10 })
                .expect(400)
                .then(({ body: { msg } }) => {
                    expect(msg).toBe("Bad Request")
                })
        })
        test("PATCH status 400 when number to update vote by is not valid but the comment id does exist", () => {
            return request(app)
                .patch("/api/comments/1")
                .send({ inc_votes: "ten" })
                .expect(400)
                .then(({ body: { msg } }) => {
                    expect(msg).toBe("Bad Request")
                })
        })
        test("GET status 405 when method is not allowed", () => {
            const invalidMethods = ["get", "post", "put"]
            const requestPromises = invalidMethods.map((method) => {
                return request(app)
                [method]('/api/comments/:comment_id')
                    .expect(405)
                    .then(({ body }) => {
                        expect(body.msg).toBe("Invalid Method")
                    })
            })
            return Promise.all(requestPromises)
        })
    })

    describe("DELETE /api/comments/:comment_id", () => {
        test("DELETE status 204 and no content returned when comment given in parametric endpoint is successfully deleted", () => {
            return request(app)
                .delete("/api/comments/5")
                .expect(204)
            // .then(({ body }) => {
            //     expect(body).toEqual({})
            // }) //<----- nothing assigned to body but if checked the body's value will be an empty object
        })
        test("DELETE status 404 Not Found when comment given in parametric endpoint does not exist", () => {
            return request(app)
                .delete("/api/comments/500")
                .expect(404)
                .then(({ body: { msg } }) => {
                    expect(msg).toBe("Comment Not Found")
                })
        })
        test("DELETE status 400 Bad Request when comment given in parametric endpoint is not a number", () => {
            return request(app)
                .delete("/api/comments/four")
                .expect(400)
                .then(({ body: { msg } }) => {
                    expect(msg).toBe("Bad Request")
                })
        })
        test("Checking the comment has been successfully deleted by accessing a api/comments endpoint to get all comments before and after DELETE request has been made", () => {
            return request(app)
                .get("/api/comments")
                .then(({ body: { comments } }) => {
                    // console.log(comments.length)//<---- length 18
                    return request(app)
                        .delete("/api/comments/1")
                        .then(() => {
                            return request(app)
                                .get("/api/comments")
                                .then(({ body: { comments } }) => {
                                    expect(comments.length).toBe(17)
                                })
                        })
                })
        })
        test("GET status 405 when method is not allowed", () => {
            const invalidMethods = ["get", "post", "put"]
            const requestPromises = invalidMethods.map((method) => {
                return request(app)
                [method]('/api/comments/:comment_id')
                    .expect(405)
                    .then(({ body }) => {
                        expect(body.msg).toBe("Invalid Method")
                    })
            })
            return Promise.all(requestPromises)
        })
    })
})