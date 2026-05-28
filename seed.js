const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "insurance_system"
});

db.connect((err) => {
    if (err) throw err;

    const insertUsers = `
        INSERT IGNORE INTO users(username,password,role)
        VALUES
        ('advisor_arjun','arjun@123','agent'),
        ('rahul_customer','rahul@123','customer')
    `;

    const insertPolicies = `
        INSERT IGNORE INTO policies
        (policy_name,premium,coverage,duration,description)
        VALUES
        ('Smart Health Shield','1500','Hospital Care, Emergency Support, Surgery','1 Year','Comprehensive healthcare protection plan.'),

        ('DriveSafe Insurance','1100','Accident Cover, Theft Protection, Vehicle Damage','2 Years','Reliable insurance coverage for cars and bikes.'),

        ('Future Life Secure','3000','Life Cover, Accidental Benefits, Family Security','5 Years','Long-term life insurance plan for financial safety.')
    `;

    const insertClaims = `
        INSERT IGNORE INTO claims
        (username,policy_id,claim_details,status)
        VALUES
        ('rahul_customer',1,'Emergency hospitalization reimbursement request','Under Review')
    `;

    const insertPayments = `
        INSERT IGNORE INTO payments
        (username,policy_id,amount,payment_date,status)
        VALUES
        ('rahul_customer',1,'1500','2026-05-20','Successful')
    `;

    db.query(insertUsers, (err) => {
        if (err) throw err;

        db.query(insertPolicies, (err) => {
            if (err) throw err;

            db.query(insertClaims, (err) => {
                if (err) throw err;

                db.query(insertPayments, (err) => {
                    if (err) throw err;

                    console.log("Seed data inserted successfully");

                    db.end();
                });
            });
        });
    });
});