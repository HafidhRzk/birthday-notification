const { user } = require("../../models");
const Joi = require("joi");
const CustomError = require("../middlewares/customError");

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

      await user.create({
        ...payload,
      });

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

      await data.destroy();

      return res.status(200).json({ message: "User Deleted!" });
    } catch (error) {
      next(error);
    }
  }
} // end class

module.exports = User;