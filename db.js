const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: ""
});

db.connect((err) => {

    if (err) throw err;

    db.query(
        "CREATE DATABASE IF NOT EXISTS insurance_system",
        (err) => {

            if (err) throw err;

            db.query("USE insurance_system", (err) => {

                if (err) throw err;

                const usersTable = `
                CREATE TABLE IF NOT EXISTS users(
                    username VARCHAR(100) PRIMARY KEY,
                    password VARCHAR(100),
                    role VARCHAR(20)
                )
                `;

                const policiesTable = `
                CREATE TABLE IF NOT EXISTS policies(
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    policy_name VARCHAR(100) UNIQUE,
                    premium VARCHAR(50),
                    coverage VARCHAR(255),
                    duration VARCHAR(50),
                    description VARCHAR(255)
                )
                `;

                const applicationsTable = `
                CREATE TABLE IF NOT EXISTS policy_applications(
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    username VARCHAR(100),
                    policy_id INT,
                    status VARCHAR(50),
                    details VARCHAR(255)
                )
                `;

                const claimsTable = `
                CREATE TABLE IF NOT EXISTS claims(
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    username VARCHAR(100),
                    policy_id INT,
                    claim_details VARCHAR(255),
                    status VARCHAR(50)
                )
                `;

                const paymentsTable = `
                CREATE TABLE IF NOT EXISTS payments(
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    username VARCHAR(100),
                    policy_id INT,
                    amount VARCHAR(50),
                    payment_date VARCHAR(50),
                    status VARCHAR(50)
                )
                `;

                db.query(usersTable, (err) => {

                    if (err) throw err;

                    db.query(policiesTable, (err) => {

                        if (err) throw err;

                        db.query(applicationsTable, (err) => {

                            if (err) throw err;

                            db.query(claimsTable, (err) => {

                                if (err) throw err;

                                db.query(paymentsTable, (err) => {

                                    if (err) throw err;

                                    console.log("Database setup completed");

                                    db.end();

                                });

                            });

                        });

                    });

                });

            });

        }
    );

});


