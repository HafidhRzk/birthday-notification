const { user } = require("../../models");
const Joi = require("joi");
const CustomError = require("../middlewares/customError");
const { find } = require('geo-tz');
const moment = require('moment-timezone');
const sendMessageQueue = require('../middlewares/messageQueue');

class User {
  static async createUser(req, res, next) {
    try {
      const schema = Joi.object({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        birthday: Joi.date().required(),
        latitude: Joi.number().min(-90).max(90).required(),
        longtitude: Joi.number().min(-180).max(180).required(),
      });
      const options = {
        abortEarly: true,
        stripUnknown: true,
      };
      const { error, value } = schema.validate(req.body, options);

      if (error) throw new CustomError(error.details[0].message, 400);

      const { longtitude, latitude, ...payload } = value

      payload.location = JSON.stringify({ latitude, longtitude })

      const data = await user.create({
        ...payload,
      });

      const [userTimezone] = find(latitude, longtitude);
      if (
        moment(payload.birthday).format('MM-DD') === moment().tz(userTimezone).format('MM-DD') &&
        moment().tz(userTimezone).format('HH') < 9
      ) {
        const userBirthday = {
          ...data,
          message: `Hey ${payload.firstName} ${payload.lastName} it's your birthday`,
        };

        sendMessageQueue.add(`message user id: ${data.id}`, userBirthday, {
          removeOnComplete: true,
          repeat: { cron: '0 9 * * *', tz: userTimezone },
        });
      }

      return res.status(200).json({ message: "New User Created!" });
    } catch (error) {
      next(error);
    }
  }

  static async updateUser(req, res, next) {
    try {
      const schema = Joi.object({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        birthday: Joi.date().required(),
        latitude: Joi.number().min(-90).max(90).required(),
        longtitude: Joi.number().min(-180).max(180).required(),
      });
      const options = {
        abortEarly: true,
        stripUnknown: true,
      };
      const { error, value } = schema.validate(req.body, options);

      if (error) throw new CustomError(error.details[0].message, 400);

      const { id } = req.params;
      const data = await user.findOne({
        where: {
          id,
        },
      });

      if (!data) {
        throw { httpCode: 400, message: "User Not Found!" };
      }

      const { longtitude, latitude, ...payload } = value

      payload.location = JSON.stringify({ latitude, longtitude })

      const [userTimezone] = find(latitude, longtitude);
      if (
        moment(value.birthday).format('MM-DD') === moment().tz(userTimezone).format('MM-DD') &&
        moment().tz(userTimezone).format('HH') < 9
      ) {
        const userBirthday = {
          ...data,
          message: `Hey ${payload.firstName} ${payload.lastName} it's your birthday`,
        };

        sendMessageQueue.add(`message user id: ${req.params.id}`, userBirthday, {
          removeOnComplete: true,
          repeat: { cron: '0 9 * * *', tz: userTimezone },
        });
      }

      await data.update({
        ...payload,
      });

      return res.status(200).json({ message: "User Updated!" });
    } catch (error) {
      next(error);
    }
  }

  static async deleteUser(req, res, next) {
    try {
      const { id } = req.params;
      const data = await user.findOne({
        where: {
          id,
        },
      });

      if (!data) {
        throw { httpCode: 400, message: "User Not Found!" };
      }

      const loc = JSON.parse(data.location);
      const [userTimezone] = find(loc.latitude, loc.longtitude);
      if (
        moment(data.birthday).format('MM-DD') === moment().tz(userTimezone).format('MM-DD') &&
        moment().tz(userTimezone).format('HH') < 9
      ) {
        const jobtoremove = await sendMessageQueue.getDelayed();
        jobtoremove.map(async (job) => {
          console.log(job.name, "ini job name")
          if (job.name === `message user id: ${req.params.id}`) {
            await sendMessageQueue.removeJobs(job.id);
          }
        });
      }

      await data.destroy();

      return res.status(200).json({ message: "User Deleted!" });
    } catch (error) {
      next(error);
    }
  }

  static async clearQueue(req, res, next) {
    try {
      const jobtoremove = await sendMessageQueue.getJobs()

      jobtoremove.map(async (job) => {
        await sendMessageQueue.removeJobs(job.id);
      });

      return res.status(200).json({ message: "Delayed Queue Cleared" });
    } catch (error) {
      next(error);
    }
  }
} // end class

module.exports = User;