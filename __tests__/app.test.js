const connection = require("../db/connection")
const app = require("../app")
const request = require("supertest");


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
        test("GET status 404 when given a invalid username parametric endpoint", () => {
            return request(app)
                .get('/api/users/notAName')
                .expect(404)
                .then(({ body }) => {
                    expect(body.msg).toBe("Not Found")
                })
        })

    })

    describe("/articles", () => {
        test("GET status 200 when given a valid article id parametric endpoint", () => {
            return request(app)
                .get('/api/articles/1')
                .expect(200)
                .then(response => {
                    expect(Object.keys(response.body.article)).toEqual(expect.arrayContaining(['article_id', 'title', 'body', 'votes', 'topic', 'author', 'created_at', 'comment_count']))
                })
            //need to do a test for wrong end point...
        })
        // test("GET status 404 when given a invalid username parametric endpoint", () => {
        //     return request(app)
        //         .get('/api/users/notAName')
        //         .expect(404)
        //         .then(({ body }) => {
        //             expect(body.msg).toBe("Not Found")
        //         })
        // })

    })

})