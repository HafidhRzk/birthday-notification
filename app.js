const express = require("express");
require("dotenv").config();
const router = require("./src/routes");
const cors = require("cors");
const createError = require("http-errors");
const cron = require('cron');
const { find } = require('geo-tz');
const moment = require('moment-timezone');
const sendMessageQueue = require('./src/middlewares/messageQueue');
const { user } = require('./models');
const { Op } = require('sequelize');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api", router);

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.httpCode || 500).json({ message: err.message });
});

cron.job(
  '1 0 0 * * *',
  async () => {
    const listUser = await user.findAll({
      where: {
        birthday: {
          [Op.endsWith]: `${moment().tz('Asia/Jakarta').month() + 1}-${moment().tz('Asia/Jakarta').date()}`
        }
      },
      attributes: {
        exclude: ['createdAt', 'updatedAt', 'deletedAt']
      },
      raw: true
    });

    sendMessageQueue.getJobCounts().then(res => console.log("Job Count:", res));
    console.log('Time Now:', moment().tz('Asia/Jakarta').format('DD/MM/YYYY HH:mm:ss'))

    if (listUser.length !== 0) {
      listUser.map(async (detailUser) => {
        const loc = JSON.parse(detailUser.location)
        const [userTimezone] = find(loc.latitude, loc.longtitude);
        detailUser.message = `Hey ${detailUser.firstName} ${detailUser.lastName} it's your birthday`;
        sendMessageQueue.add(`message user id: ${detailUser.id}`, detailUser, {
          removeOnComplete: true,
          repeat: { cron: '0 9 * * *', tz: userTimezone },
        });
      });
    }
  },
  null,
  true,
  'Asia/Jakarta'
);

app.listen(port, () => { console.log(`Server is listening on port ${port}`); });

module.exports = app;