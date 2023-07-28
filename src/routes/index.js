const express = require("express");
const router = express.Router();

router.all('/', (req, res) => {
    res.status(200).send("Hello There!");
});

const user = require("./user")

router.use('/user', user);

module.exports = router;