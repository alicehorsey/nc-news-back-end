const handlePSQLErrors = (err, req, res, next) => {
    const badReqErrorCodes = ['22P02']
    const notFoundErrorCodes = ['23503', '42703']
    if (badReqErrorCodes.includes(err.code)) {
        res.status(400).send({ msg: "Bad Request" })
    } else if (notFoundErrorCodes.includes(err.code)) {
        // console.log(err.code)
        res.status(404).send({ msg: "Not Found" })
    } else {
        next(err)
    }
}

const handleCustomErrors = (err, req, res, next) => {
    if (err.status) {
        res.status(err.status).send({ msg: err.msg })
    } else {
        next(err)
    }
}


const handleInternalErrors = (err, req, res, next) => {
    console.log(err, "<----- unhandled error");
    res.status(500).send({ msg: "Internal Server Error" })
}


const send405 = (req, res, next) => {
    res.status(405).send({ msg: "Invalid Method" })
}
const send404 = (req, res, next) => {
    res.status(404).send({ msg: "Not Found" });
}


module.exports = { send405, handleCustomErrors, handlePSQLErrors, handleInternalErrors, send404 }