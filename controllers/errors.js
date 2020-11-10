
const handleCustomErrors = (err, req, res, next) => {
    if (err.status) {
        res.status(err.status).send({ msg: err.msg })
    } else {
        next(err)
    }
}


const handleInternalErrors = (err, req, res, next) => {
    // console.log(err, "<----- unhandled error");
    res.status(500).send({ msg: "Internal Server Error" })
}




const send404 = (req, res, next) => {
    res.status(404).send({ msg: "Not Found" });
}


module.exports = { handleCustomErrors, handleInternalErrors, send404 }