export default () => ({
    port: parseInt(process.env.PORT ?? '8000', 10),
    databaseUrl: process.env.DATABASE_URL,
    jwtSecret: process.env.JWT_SECRET,

    email: {
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT) || 587,
        user: process.env.EMAIL_HOST_USER,
        pass: process.env.EMAIL_HOST_PASSWORD,
        secure: process.env.EMAIL_USE_TLS === 'true',
        defaultFrom: process.env.DEFAULT_FROM_EMAIL,
    }
});
