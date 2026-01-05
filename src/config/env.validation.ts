import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
    PORT: Joi.number().default(8000),
    DATABASE_URL: Joi.string().required(),
    JWT_SECRET: Joi.string().required(),

    EMAIL_HOST: Joi.string().required(),
    EMAIL_PORT: Joi.number().required().default(587),
    EMAIL_USE_TLS: Joi.boolean().required(),
    EMAIL_HOST_USER: Joi.string().required(),
    EMAIL_HOST_PASSWORD: Joi.string().required(),
    DEFAULT_FROM_EMAIL: Joi.string().email().required(),
});
