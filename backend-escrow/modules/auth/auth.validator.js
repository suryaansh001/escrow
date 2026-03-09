import Joi from 'joi';
import passwordComplexity from 'joi-password-complexity';

const registerValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(255).allow('').optional(),
    email: Joi.string().min(6).max(255).required().email(),
    password: passwordComplexity().required(),
    otp: Joi.string().length(6).required(),
    phone: Joi.string().optional(),
  });
  return schema.validate(data);
};

const loginValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string().min(6).max(255).required().email(),
    password: Joi.string().required(),
  });
  return schema.validate(data);
};

const otpValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string().min(6).max(255).required().email(),
    phone_number: Joi.string().optional(),
  });
  return schema.validate(data);
};

export { registerValidation, loginValidation, otpValidation };