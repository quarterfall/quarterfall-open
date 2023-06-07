require("dotenv").config();

export const config = {
    database: {
        mysql: {
            client: "mysql",
            connection: {
                host: `${process.env.CLOUDCHECK_MYSQL_HOST || ""}`,
                user: `${process.env.CLOUDCHECK_MYSQL_USER || ""}`,
                password: `${process.env.CLOUDCHECK_MYSQL_PASSWORD || ""}`,
                charset: "utf8",
                multipleStatements: true,
            },
        },
        postgresql: {
            client: "pg",
            connection: {
                host: `${process.env.CLOUDCHECK_POSTGRESQL_HOST || ""}`,
                user: `${process.env.CLOUDCHECK_POSTGRESQL_USER || ""}`,
                password: `${process.env.CLOUDCHECK_POSTGRESQL_PASSWORD || ""}`,
                charset: "utf8",
                database: "postgres",
                multipleStatements: true,
            },
        },
    },
};
