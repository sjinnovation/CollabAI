import { pool } from '../config/dbPostgre.js';
import { PostGreSqlDbMessages } from '../constants/enums.js';

// create a new data into the postgreSQL
export const createCompanyData = async (query = '') => {
    try {
        // Extract the relevant information from the SQL query
        const regex = /INSERT INTO (\w+) \(([^)]+)\) VALUES \(([^)]+)\)/;
        const match = query.match(regex);

        if (!match) {
            throw new Error(PostGreSqlDbMessages.INVALID_SQL_MESSAGE);
        }

        const tableName = match[1];
        const columns = match[2].split(',').map(col => col.trim());
        const values = match[3].split(',').map(val => val.trim());

        // Query to get the maximum ID currently in the table
        const maxIdQuery = `SELECT MAX(id) AS max_id FROM ${tableName};`;
        const maxIdResult = await pool.query(maxIdQuery);
        const maxId = maxIdResult.rows[0].max_id || 0;

        // Calculate the next available ID by incrementing the maximum ID
        const nextId = maxId + 1;

        // Add the generated ID to the columns and values arrays
        columns.unshift('id');
        values.unshift(nextId);

        // Construct the INSERT statement
        const insertStatement = `
            INSERT INTO ${tableName} (${columns.join(', ')})
            VALUES (${values.join(', ')})
        `;

        // Execute the constructed SQL query to insert new data into the database
        await pool.query(insertStatement);

        // Return success message or any other response
        return JSON.stringify({ message: PostGreSqlDbMessages.COMPANY_CREATED_SUCCESS });
    } catch (error) {
        console.error('Error creating data:', error);
        throw error;
    }
}

// fetches existing data from the postgreSQL
export const getCompanyData = async (query = '') => {
    try {
        var result;
        if (query != '') {
            result = await pool.query(query);
            const modifiedResponse = result.rows;
            console.log(modifiedResponse);
            return JSON.stringify(modifiedResponse);
        }        
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
    
}

// update data from the postgreSQL
export const updateCompanyData = async (query = '') => {
    try {
        // Extract the relevant information from the SQL query
        const regex = /UPDATE (\w+) SET ([^;]+) WHERE ([^;]+)/;
        const match = query.match(regex);

        if (!match) {
            throw new Error(PostGreSqlDbMessages.INVALID_SQL_MESSAGE);
        }

        const tableName = match[1];
        const setValues = match[2].split(',').map(val => val.trim());
        const whereCondition = match[3].trim();

        // Construct the UPDATE statement
        const updateStatement = `
            UPDATE ${tableName}
            SET ${setValues.join(', ')}
            WHERE ${whereCondition}
        `;

        // Execute the constructed SQL query to update data in the database
        await pool.query(updateStatement);

        // Return success message or any other response
        return JSON.stringify({ message: PostGreSqlDbMessages.COMPANY_UPDATED_SUCCESS });
    } catch (error) {
        console.error('Error updating data:', error);
        throw error;
    }
};

// delete data from the postgreSQL
export const deleteCompanyData = async (query = '') => {
    try {
        // Extract the relevant information from the SQL query
        const regex = /DELETE FROM (\w+) WHERE ([^;]+)/;
        const match = query.match(regex);

        if (!match) {
            throw new Error(PostGreSqlDbMessages.INVALID_SQL_MESSAGE);
        }

        const tableName = match[1];
        const whereCondition = match[2].trim();

        // Construct the DELETE statement
        const deleteStatement = `
            DELETE FROM ${tableName}
            WHERE ${whereCondition}
        `;

        // Execute the constructed SQL query to delete data from the database
        await pool.query(deleteStatement);

        // Return success message or any other response
        return JSON.stringify({ message: PostGreSqlDbMessages.COMPANY_DELETED_SUCCESS });
    } catch (error) {
        console.error('Error deleting data:', error);
        throw error;
    }
};


