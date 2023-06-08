import axios from "axios";
import { config } from "config";
import { DatabaseDialect, ExitCode, generateId } from "core";
import { log } from "helpers/logger";
import KnexDb, { Knex } from "knex";
import schemaInspector from "knex-schema-inspector";
import { cloneDeep, isArray } from "lodash";
import { ActionHandler } from "./ActionFactory";
import Handlebars = require("handlebars");

export class DatabaseAction extends ActionHandler {
    protected databaseName: string;
    protected db: Knex;

    protected createDb(databaseName?: string) {
        const databaseDialect =
            this.actionOptions.databaseDialect || DatabaseDialect.mysql;
        const knexConfig = cloneDeep(config.database[databaseDialect]);
        if (databaseName) {
            knexConfig.connection["database"] = databaseName;
        }
        return KnexDb(knexConfig);
    }

    public async setup() {
        try {
            // generate a database name
            this.databaseName = generateId({
                length: 8,
                allowed: ["lowercaseLetters"],
            });

            log.debug(`Creating database with name ${this.databaseName}.`);

            // connect to the database instance
            const knex = this.createDb();

            // create the database
            await knex.raw(`create database ${this.databaseName}`); // perhaps:  alter database ${this.databaseName} owner to postgres;
            await knex.destroy();

            // create the Knex instance and store it as a member
            this.db = this.createDb(this.databaseName);

            // if there is an SQL file to run, do it here
            if (this.actionOptions.databaseFileUrl) {
                // retrieve the file
                const result = await axios.get<any, { data: string }>(
                    this.actionOptions.databaseFileUrl
                );
                const resultCleaned = (result.data || "")
                    .replace(/(\r\n|\n|\r|\t)/gm, "")
                    .trim();
                if (resultCleaned !== "") {
                    // run the sql queries here
                    await this.db.raw(result.data);
                }
            }
        } catch (error) {
            return {
                log: [
                    "An error occurred while creating the database",
                    this.constructDbError(error),
                ],
                code: ExitCode.InternalError,
            };
        }

        return {
            log: [],
            code: ExitCode.NoError,
        };
    }

    public async run(data: any, _requestId: string, languageData: any) {
        const { answerEmbedding = "{{answer}}", hideFeedback } =
            this.actionOptions;
        // create the embedded answer
        const replaceFunc = Handlebars.compile(answerEmbedding, {
            noEscape: true,
        });
        data.embeddedAnswer = replaceFunc(data);

        if (!data.embeddedAnswer) {
            return { data, log: [], code: ExitCode.NoError };
        }
        try {
            // store the Knex instance in the data
            data.db = this.db;
            data.dbInspector = schemaInspector(this.db as any);

            // now run the answer by the student
            data.dbQueryResultRaw = await this.db.raw(data.embeddedAnswer);
            data.dbQueryResult = [];

            if (!isArray(data.dbQueryResultRaw)) {
                data.dbQueryResultRaw = [data.dbQueryResultRaw];
            }

            const parsedQueryResult = JSON.parse(
                JSON.stringify(data.dbQueryResultRaw)
            );

            const queryFeedback: string[] = [];

            if (this.actionOptions.databaseDialect === DatabaseDialect.mysql) {
                const { data: resultData, queryResults } =
                    this.generateQueryResultForMysql(data, parsedQueryResult);
                data = resultData;
                for (const result of queryResults) {
                    queryFeedback.push(
                        `\`\`\`table\n${JSON.stringify(
                            this.generateFeedbackTableFromResult({
                                fields: isArray(result.columns)
                                    ? result.columns
                                    : [result.columns],
                                rows: isArray(result.rows)
                                    ? result.rows
                                    : [result.rows],
                            })
                        )}\n\`\`\``
                    );
                }
            }

            if (
                this.actionOptions.databaseDialect ===
                DatabaseDialect.postgresql
            ) {
                for (const result of parsedQueryResult) {
                    if ((result?.command || "").toLowerCase() === "select") {
                        data.dbQueryResult.push(result.rows);
                        queryFeedback.push(
                            `\`\`\`table\n${JSON.stringify(
                                this.generateFeedbackTableFromResult({
                                    fields: result.fields,
                                    rows: result.rows,
                                })
                            )}\n\`\`\``
                        );
                    }
                }
            }

            // if there is a query result and we want to show it to the user, add it to the feedback
            if (!hideFeedback && queryFeedback.length > 0) {
                data.feedback = data.feedback || [];
                data.feedback.push(
                    `## ${languageData.queryResultTitle || "Query result:"}`,
                    ...queryFeedback
                );
            }
        } catch (error) {
            return {
                data,
                log: [
                    "An error occurred while running the database action.",
                    this.constructDbError(error),
                ],
                code: ExitCode.InternalError,
            };
        }

        return { data, log: [], code: ExitCode.NoError };
    }

    public async tearDown() {
        try {
            // destroy the currently active database
            await this.db.destroy();

            log.debug(`Dropping database with name ${this.databaseName}.`);
            // create a new connection to drop the database
            const knex = this.createDb();
            // destroy the database and close the connection

            await knex.raw(`drop database ${this.databaseName}`);
            await knex.destroy();
        } catch (error) {
            return {
                log: [
                    "An error occurred while dropping the database.",
                    this.constructDbError(error),
                ],
                code: ExitCode.InternalError,
            };
        }
        return {
            log: [],
            code: ExitCode.NoError,
        };
    }

    protected generateQueryResultForMysql(data: any, parsedQueryResult: any) {
        // find all lines of sql
        const lines: any[] =
            data.embeddedAnswer
                .toLowerCase()
                .toString()
                .split(";")
                .map((element: any) => element.trim())
                .filter((element: any) => element !== "") || [];

        // find lines with select command
        const linesWithSelectCommand = lines.reduce(function (
            lineList,
            line,
            index
        ) {
            if (line.includes("select")) {
                lineList.push(index);
            }
            return lineList;
        },
        []);

        // Generate row and column lists per line
        const rowList = parsedQueryResult[0].filter((_: any, i: number) =>
            linesWithSelectCommand.some((j: any) => i === j)
        );
        const columnList = parsedQueryResult[1].filter((_: any, i: number) =>
            linesWithSelectCommand.some((j: any) => i === j)
        );

        const queryResults = [];
        if (lines.length !== 1) {
            rowList.forEach((rows, index) => {
                data.dbQueryResult = rows;
                queryResults.push({
                    rows,
                    columns: columnList[index],
                });
            });
        } else {
            queryResults.push({
                rows: linesWithSelectCommand.length ? parsedQueryResult[0] : [],
                columns: linesWithSelectCommand.length
                    ? parsedQueryResult[1]
                    : [],
            });
            data.dbQueryResult = parsedQueryResult[0];
        }
        return { data, queryResults };
    }

    protected generateFeedbackTableFromResult(result: any) {
        return {
            columns: result.fields.map((field) => ({
                field: field.name,
                headerName: field.name,
                width: 150,
            })),
            rows: result.rows.map((row, index) => ({
                id: index + 1,
                ...row,
            })),
        };
    }

    protected constructDbError(error: any, maxLength = 2000): string {
        function shortenString(s: string) {
            if (s.length < maxLength) {
                return s;
            }

            return `${s.slice(0, maxLength / 2)} \n\n... [omitted ${
                s.length - maxLength
            } characters] ...\n\n ${s.slice(-maxLength / 2)}`;
        }

        return `${shortenString(error.toString())}\n${shortenString(
            JSON.stringify(error)
        )}`;
    }
}
