import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_URL,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASENAME,
    entities: [__dirname, '**', '*.entity.{ts,js}'],
    migrations: [`${__dirname}/migration/*{.ts,.js}`],
    // subscribers: ["src/subscriber/**/*.ts"], // Caminho para os subscribers
    schema: process.env.SCHEMA ? process.env.SCHEMA : 'public'
});
