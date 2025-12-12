export default () => ({
    port: parseInt(process.env.PORT ?? '8000', 10),
    databaseUrl: process.env.DATABASE_URL,
    jwtSecret: process.env.JWT_SECRET,
});
