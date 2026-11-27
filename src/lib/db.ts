import { Pool } from "@neondatabase/serverless";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

/**
 * Translates MySQL-style placeholders (?) and common MySQL functions/keywords
 * into PostgreSQL equivalents so existing queries work seamlessly on Neon.
 */
function translateSql(sql: string): string {
    let idx = 0;
    // Replace ? placeholders outside of single-quoted string literals
    let pgSql = sql.replace(/'[^']*'|(\?)/g, (match, q) => {
        if (q) {
            idx += 1;
            return `$${idx}`;
        }
        return match;
    });

    // Quote reserved table name `user` when unquoted
    pgSql = pgSql.replace(/\b(FROM|JOIN|UPDATE|INTO)\s+user\b/gi, '$1 "user"');
    // Remove MySQL backticks
    pgSql = pgSql.replace(/`/g, '"');
    // Quote camelCase identifiers so PostgreSQL doesn't fold them to lowercase
    pgSql = pgSql.replace(
        /(?<!")\b(createdAt|updatedAt|emailVerified|displayUsername|userId|expiresAt|accessToken|refreshToken|idToken|accessTokenExpiresAt|refreshTokenExpiresAt|ipAddress|userAgent|accountId|providerId)\b(?!")/g,
        '"$1"'
    );
    // UUID_TO_BIN($n) -> decode(replace($n, '-', ''), 'hex')
    pgSql = pgSql.replace(/UUID_TO_BIN\((\$\d+)\)/gi, "decode(replace($1, '-', ''), 'hex')");
    // BIN_TO_UUID(col) -> formatted UUID string
    pgSql = pgSql.replace(
        /BIN_TO_UUID\(([^)]+)\)/gi,
        "regexp_replace(encode($1, 'hex'), '(.{8})(.{4})(.{4})(.{4})(.{12})', '\\1-\\2-\\3-\\4-\\5')"
    );

    return pgSql;
}

async function runQuery(sql: string, params: any[] = []): Promise<[any, any]> {
    const pgSql = translateSql(sql);
    const result = await pool.query(pgSql, params);
    const isSelect = /^\s*(SELECT|WITH|SHOW)/i.test(pgSql);
    if (isSelect) {
        return [result.rows, result.fields];
    }
    return [{ affectedRows: result.rowCount ?? 0, insertId: result.rows[0]?.id }, result.fields];
}

export const db = {
    query: runQuery,
    execute: runQuery,
    getConnection: async () => {
        const client = await pool.connect();
        return {
            query: async (sql: string, params: any[] = []) => {
                const pgSql = translateSql(sql);
                const result = await client.query(pgSql, params);
                const isSelect = /^\s*(SELECT|WITH|SHOW)/i.test(pgSql);
                if (isSelect) return [result.rows, result.fields];
                return [{ affectedRows: result.rowCount ?? 0, insertId: result.rows[0]?.id }, result.fields];
            },
            execute: async (sql: string, params: any[] = []) => {
                const pgSql = translateSql(sql);
                const result = await client.query(pgSql, params);
                const isSelect = /^\s*(SELECT|WITH|SHOW)/i.test(pgSql);
                if (isSelect) return [result.rows, result.fields];
                return [{ affectedRows: result.rowCount ?? 0, insertId: result.rows[0]?.id }, result.fields];
            },
            beginTransaction: () => client.query("BEGIN"),
            commit: () => client.query("COMMIT"),
            rollback: () => client.query("ROLLBACK"),
            release: () => client.release(),
        };
    },
};
