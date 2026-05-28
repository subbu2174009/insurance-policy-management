const http = require("http");
const fs = require("fs");
const mysql = require("mysql2");
const querystring = require("querystring");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "insurance_system"
});

db.connect((err) => {

    if(err) throw err;

    console.log("Database Connected");
});
function sendMessagePage(res, title, message, color = "red") {

    res.writeHead(200, {
        "Content-Type": "text/html"
    });

    res.end(`

    <html>

    <head>

    <title>${title}</title>

    <link rel="stylesheet" href="/style.css">

    </head>

    <body>

    <div class="auth-container">

        <div class="auth-box">

            <h1 style="
            text-align:center;
            color:${color};
            margin-bottom:20px;
            ">
            ${title}
            </h1>

            <p style="
            text-align:center;
            font-size:16px;
            line-height:1.7;
            margin-bottom:25px;
            ">
            ${message}
            </p>

            <a href="/">

                <button>

                    Back to Home

                </button>

            </a>

        </div>

    </div>

    </body>

    </html>

    `);
}

function validateUsername(username) {

    const regex =
    /^[A-Za-z0-9_]{5,20}$/;

    return regex.test(username);
}

function validatePassword(password) {

    const regex =
    /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/;

    return regex.test(password);
}

const server = http.createServer(function(req, res) {

    // CSS
    if(req.url === "/style.css") {

        fs.readFile("./pages/style.css",
        function(err, data) {

            res.writeHead(200, {
                "Content-Type": "text/css"
            });

            res.end(data);
        });

        return;
    }

    // Main Login Page
    if(req.url === "/" &&
       req.method === "GET") {

        fs.readFile("./pages/login.html",
        function(err, data) {

            res.writeHead(200, {
                "Content-Type": "text/html"
            });

            res.end(data);
        });

        return;
    }

    // Agent Login
    if(req.url === "/agent-login" &&
       req.method === "GET") {

        fs.readFile("./pages/agent-login.html",
        function(err, data) {

            res.writeHead(200, {
                "Content-Type": "text/html"
            });

            res.end(data);
        });

        return;
    }

    // Customer Login
    if(req.url === "/customer-login" &&
       req.method === "GET") {

        fs.readFile("./pages/customer-login.html",
        function(err, data) {

            res.writeHead(200, {
                "Content-Type": "text/html"
            });

            res.end(data);
        });

        return;
    }

    // Agent Register
    if(req.url === "/agent-register" &&
       req.method === "GET") {

        fs.readFile("./pages/agent-register.html",
        function(err, data) {

            res.writeHead(200, {
                "Content-Type": "text/html"
            });

            res.end(data);
        });

        return;
    }

    // Customer Register
    if(req.url === "/register" &&
       req.method === "GET") {

        fs.readFile("./pages/register.html",
        function(err, data) {

            res.writeHead(200, {
                "Content-Type": "text/html"
            });

            res.end(data);
        });

        return;
    }
// Register User
if(req.url === "/register-user" &&
   req.method === "POST") {

    var body = "";

    req.on("data", function(chunk) {

        body += chunk.toString();
    });

    req.on("end", function() {

        var data =
        querystring.parse(body);

        // Empty Validation
        if(
            !data.username ||
            !data.password ||
            !data.role
        ) {

            sendMessagePage(
                res,
                "Registration Failed",
                "All registration fields are required."
            );

            return;
        }

        // Username Validation
        if(
            !validateUsername(data.username)
        ) {

            sendMessagePage(
                res,
                "Invalid Username",

                `
                Username must:
                <br><br>

                • Be between 5 and 20 characters
                <br>

                • Use only letters, numbers or underscore
                `
            );

            return;
        }

        // Password Validation
        if(
            !validatePassword(data.password)
        ) {

            sendMessagePage(
                res,
                "Weak Password",

                `
                Password must contain:
                <br><br>

                • One uppercase letter
                <br>

                • One number
                <br>

                • One special character
                <br>

                • Minimum 8 characters
                `
            );

            return;
        }

        // Existing User Check
        db.query(
            "SELECT * FROM users WHERE username=?",

            [data.username],

            function(err, result) {

                if(result.length > 0) {

                    sendMessagePage(
                        res,
                        "Username Exists",
                        "Please choose another username."
                    );

                    return;
                }

                // Insert User
                db.query(
                    "INSERT INTO users(username,password,role) VALUES(?,?,?)",

                    [
                        data.username,
                        data.password,
                        data.role
                    ],

                    function() {

                        sendMessagePage(
                            res,
                            "Registration Successful",
                            "Your account has been created successfully.",
                            "green"
                        );
                    }
                );
            }
        );
    });

    return;
}
    // Login
    // Login
if(req.url === "/login" &&
   req.method === "POST") {

    var body = "";

    req.on("data", function(chunk) {

        body += chunk.toString();
    });

    req.on("end", function() {

        var data =
        querystring.parse(body);

        // Empty Validation
        if(
            !data.username ||
            !data.password ||
            !data.role
        ) {

            sendMessagePage(
                res,
                "Login Failed",
                "All login fields are required."
            );

            return;
        }

        db.query(
            "SELECT * FROM users WHERE username=? AND password=?",

            [
                data.username,
                data.password
            ],

            function(err, result) {

                // Invalid Login
                if(
                    err ||
                    result.length === 0
                ) {

                    sendMessagePage(
                        res,
                        "Access Denied",
                        "Invalid Username or Password."
                    );

                    return;
                }

                var user = result[0];

                // Wrong Role
                if(user.role !== data.role) {

                    sendMessagePage(
                        res,
                        "Role Mismatch",
                        "Please use correct login portal."
                    );

                    return;
                }

                // Agent Login
                if(user.role === "agent") {

                    res.writeHead(302, {

                        Location:
                        "/agent-dashboard?username=" +
                        user.username
                    });

                    res.end();

                    return;
                }

                // Customer Login
                if(user.role === "customer") {

                    res.writeHead(302, {

                        Location:
                        "/customer-dashboard?username=" +
                        user.username
                    });

                    res.end();

                    return;
                }

                sendMessagePage(
                    res,
                    "Error",
                    "Unsupported user role."
                );
            }
        );
    });

    return;
}
    // Agent Dashboard
    if(req.url.indexOf("/agent-dashboard") === 0) {

        var username =
        req.url.split("username=")[1];

        db.query(
            "SELECT * FROM policies",

            function(err, policies) {

                var html = `
                <html>

                <head>

                <link rel="stylesheet"
                href="/style.css">

                </head>

                <body>

                <div class="topbar">

                <h1>
                Agent Dashboard
                </h1>

                <a href="/">
                <button style="width:auto">
                Logout
                </button>
                </a>

                </div>

                <div class="dashboard-wrapper">

                <div class="left-column">

                <div class="container">

                <h2>
                Welcome ${username}
                </h2>

                <button onclick="location.href='/add-policy?username=${username}'">
                Add Policy
                </button>

                <button onclick="location.href='/agent-claims?username=${username}'">
                Manage Claims
                </button>

                <button onclick="location.href='/agent-payments?username=${username}'">
                View Payments
                </button>

                </div>

                </div>

                <div class="right-column">

                <h2>
                Available Policies
                </h2>
                `;

                for(
                    var i = 0;
                    i < policies.length;
                    i++
                ) {

                    var policy =
                    policies[i];

                    html += `
                    <div class="container">

                    <h3>
                    ${policy.policy_name}
                    </h3>

                    <p>
                    Premium:
                    ${policy.premium}
                    </p>

                    <p>
                    Coverage:
                    ${policy.coverage}
                    </p>

                    <p>
                    Duration:
                    ${policy.duration}
                    </p>

                    <p>
                    ${policy.description}
                    </p>

                    <button onclick="location.href='/edit-policy?username=${username}&policy_id=${policy.id}'" style="margin-top:15px; background:linear-gradient(90deg, #3b82f6, #1d4ed8)">
                    Edit Policy
                    </button>

                    </div>
                    `;
                }

                html += `
                </div>
                </div>
                </body>
                </html>
                `;

                res.writeHead(200, {
                    "Content-Type": "text/html"
                });

                res.end(html);
            }
        );

        return;
    }

    // Customer Dashboard
    if(req.url.indexOf("/customer-dashboard") === 0) {

        var username =
        req.url.split("username=")[1];

        db.query(
            "SELECT * FROM policies",

            function(err, policies) {

                var html = `
                <html>

                <head>

                <link rel="stylesheet"
                href="/style.css">

                </head>

                <body>

                <div class="topbar">

                <h1>
                Customer Dashboard
                </h1>

                <a href="/">
                <button style="width:auto">
                Logout
                </button>
                </a>

                </div>

                <div class="dashboard-wrapper">

                <div class="left-column">

                <div class="container">

                <h2>
                Welcome ${username}
                </h2>

                <button onclick="location.href='/my-policies?username=${username}'">
                My Policies
                </button>

                <button onclick="location.href='/claim-status?username=${username}'">
                Claim Status
                </button>

                </div>

                </div>

                <div class="right-column">

                <h2>
                Insurance Policies
                </h2>
                `;

                for(
                    var i = 0;
                    i < policies.length;
                    i++
                ) {

                    var policy =
                    policies[i];

                    html += `
                    <div class="container">

                    <h3>
                    ${policy.policy_name}
                    </h3>

                    <p>
                    Premium:
                    ${policy.premium}
                    </p>

                    <p>
                    Coverage:
                    ${policy.coverage}
                    </p>

                    <p>
                    Duration:
                    ${policy.duration}
                    </p>

                    <p>
                    ${policy.description}
                    </p>

                    <button onclick="location.href='/apply-policy?username=${username}&policy_id=${policy.id}'" style="margin-top:15px; background:linear-gradient(90deg, #10b981, #059669)">
                    Apply Now
                    </button>

                    </div>
                    `;
                }

                html += `
                </div>
                </div>
                </body>
                </html>
                `;

                res.writeHead(200, {
                    "Content-Type": "text/html"
                });

                res.end(html);
            }
        );

        return;
    }

    // Edit Policy Page (GET)
    if(req.url.indexOf("/edit-policy") === 0) {
        var urlParts = req.url.split("?");
        var params = querystring.parse(urlParts[1]);
        var username = params.username;
        var policyId = params.policy_id;
        
        db.query(
            "SELECT * FROM policies WHERE id = ?",
            [policyId],
            function(err, policies) {
                if(err || policies.length === 0) {
                    sendMessagePage(res, "Error", "Policy not found.");
                    return;
                }
                
                var policy = policies[0];
                
                fs.readFile("./pages/booking.html", "utf8", function(err, data) {
                    if(err) {
                        sendMessagePage(res, "Error", "Failed to load policy form page.");
                        return;
                    }
                    
                    var idField = `<input type="hidden" name="policy_id" value="${policy.id}">`;
                    
                    var html = data
                        .replace(/{{title}}/g, "Edit Policy")
                        .replace(/{{action}}/g, "/update-policy")
                        .replace(/{{username}}/g, username)
                        .replace(/{{idField}}/g, idField)
                        .replace(/{{policy_name}}/g, policy.policy_name)
                        .replace(/{{premium}}/g, policy.premium)
                        .replace(/{{coverage}}/g, policy.coverage)
                        .replace(/{{description}}/g, policy.description);
                        
                    var durationPattern = new RegExp(`value="${policy.duration}"`);
                    html = html.replace(durationPattern, `value="${policy.duration}" selected`);
                    
                    res.writeHead(200, { "Content-Type": "text/html" });
                    res.end(html);
                });
            }
        );
        
        return;
    }

    // Update Policy (POST)
    if(req.url === "/update-policy" && req.method === "POST") {
        var body = "";
        
        req.on("data", function(chunk) {
            body += chunk.toString();
        });
        
        req.on("end", function() {
            var data = querystring.parse(body);
            
            db.query(
                "UPDATE policies SET policy_name = ?, premium = ?, coverage = ?, duration = ?, description = ? WHERE id = ?",
                [data.policy_name, data.premium, data.coverage, data.duration, data.description, data.policy_id],
                function(err, result) {
                    if(err) {
                        sendMessagePage(res, "Database Error", "Failed to update the policy: " + err.message);
                        return;
                    }
                    
                    res.writeHead(302, {
                        "Location": "/agent-dashboard?username=" + data.username
                    });
                    res.end();
                }
            );
        });
        
        return;
    }

    // Agent Manage Claims (GET)
    if(req.url.indexOf("/agent-claims") === 0) {
        var username = req.url.split("username=")[1];
        
        db.query(
            "SELECT c.*, p.policy_name FROM claims c JOIN policies p ON c.policy_id = p.id ORDER BY c.id DESC",
            function(err, claims) {
                if (err) {
                    sendMessagePage(res, "Error", "Failed to retrieve claims.");
                    return;
                }
                
                var html = `
                <html>

                <head>
                <link rel="stylesheet" href="/style.css">
                </head>

                <body>

                <div class="topbar">
                    <h1>Manage Claims</h1>
                    <a href="/">
                        <button style="width:auto">Logout</button>
                    </a>
                </div>

                <div class="dashboard-wrapper">

                    <div class="left-column">
                        <div class="container">
                            <h2>Welcome ${username}</h2>
                            <button onclick="location.href='/agent-dashboard?username=${username}'">
                                Available Policies
                            </button>
                            <button class="active" onclick="location.href='/agent-claims?username=${username}'" style="background: linear-gradient(90deg, #1e40af, #1e3a8a);">
                                Manage Claims
                            </button>
                            <button onclick="location.href='/agent-payments?username=${username}'">
                                View Payments
                            </button>
                        </div>
                    </div>

                    <div class="right-column">
                        <h2>All Customer Claims</h2>
                `;
                
                if (claims.length === 0) {
                    html += `
                        <div class="container" style="grid-column: 1 / -1; text-align: center;">
                            <p style="color: #64748b; font-size: 16px;">No claims submitted yet.</p>
                        </div>
                    `;
                } else {
                    for(var i = 0; i < claims.length; i++) {
                        var claim = claims[i];
                        
                        var badgeColor = "orange";
                        if (claim.status === "Approved") {
                            badgeColor = "green";
                        } else if (claim.status === "Rejected") {
                            badgeColor = "red";
                        }
                        
                        html += `
                        <div class="container">
                            <h3>Claim ID: #${claim.id}</h3>
                            <p><strong>Customer Username:</strong> ${claim.username}</p>
                            <p><strong>Policy Name:</strong> ${claim.policy_name}</p>
                            <p><strong>Claim Details:</strong> ${claim.claim_details}</p>
                            <p><strong>Status:</strong> <span style="color: ${badgeColor}; font-weight: bold;">${claim.status}</span></p>
                        `;
                        
                        if (claim.status === "Under Review") {
                            html += `
                            <div style="display: flex; gap: 10px; margin-top: 15px;">
                                <button onclick="location.href='/update-claim-status?username=${username}&claim_id=${claim.id}&status=Approved'" style="margin-top: 0; background: linear-gradient(90deg, #10b981, #059669);">
                                    Approve
                                </button>
                                <button onclick="location.href='/update-claim-status?username=${username}&claim_id=${claim.id}&status=Rejected'" style="margin-top: 0; background: linear-gradient(90deg, #ef4444, #dc2626);">
                                    Reject
                                </button>
                            </div>
                            `;
                        }
                        
                        html += `
                        </div>
                        `;
                    }
                }
                
                html += `
                    </div>
                </div>
                </body>
                </html>
                `;
                
                res.writeHead(200, { "Content-Type": "text/html" });
                res.end(html);
            }
        );
        return;
    }

    // Update Claim Status (GET)
    if(req.url.indexOf("/update-claim-status") === 0) {
        var urlParts = req.url.split("?");
        var params = querystring.parse(urlParts[1]);
        var username = params.username;
        var claimId = params.claim_id;
        var status = params.status;
        
        db.query(
            "UPDATE claims SET status = ? WHERE id = ?",
            [status, claimId],
            function(err, result) {
                if(err) {
                    sendMessagePage(res, "Database Error", "Failed to update claim status: " + err.message);
                    return;
                }
                
                res.writeHead(302, {
                    "Location": "/agent-claims?username=" + username
                });
                res.end();
            }
        );
        return;
    }

    // Agent View Payments (GET)
    if(req.url.indexOf("/agent-payments") === 0) {
        var username = req.url.split("username=")[1];
        
        db.query(
            "SELECT pay.*, p.policy_name FROM payments pay JOIN policies p ON pay.policy_id = p.id ORDER BY pay.id DESC",
            function(err, payments) {
                if (err) {
                    sendMessagePage(res, "Error", "Failed to retrieve payments.");
                    return;
                }
                
                var html = `
                <html>

                <head>
                <link rel="stylesheet" href="/style.css">
                </head>

                <body>

                <div class="topbar">
                    <h1>Payment Records</h1>
                    <a href="/">
                        <button style="width:auto">Logout</button>
                    </a>
                </div>

                <div class="dashboard-wrapper">

                    <div class="left-column">
                        <div class="container">
                            <h2>Welcome ${username}</h2>
                            <button onclick="location.href='/agent-dashboard?username=${username}'">
                                Available Policies
                            </button>
                            <button onclick="location.href='/agent-claims?username=${username}'">
                                Manage Claims
                            </button>
                            <button class="active" onclick="location.href='/agent-payments?username=${username}'" style="background: linear-gradient(90deg, #1e40af, #1e3a8a);">
                                View Payments
                            </button>
                        </div>
                    </div>

                    <div class="right-column">
                        <h2>Customer Transactions</h2>
                `;
                
                if (payments.length === 0) {
                    html += `
                        <div class="container" style="grid-column: 1 / -1; text-align: center;">
                            <p style="color: #64748b; font-size: 16px;">No payments recorded yet.</p>
                        </div>
                    `;
                } else {
                    for(var i = 0; i < payments.length; i++) {
                        var payment = payments[i];
                        
                        html += `
                        <div class="container" style="border-left: 5px solid #10b981;">
                            <h3>Payment ID: #${payment.id}</h3>
                            <p><strong>Customer Username:</strong> ${payment.username}</p>
                            <p><strong>Policy Name:</strong> ${payment.policy_name}</p>
                            <p><strong>Amount Paid:</strong> $${payment.amount}</p>
                            <p><strong>Payment Date:</strong> ${payment.payment_date}</p>
                            <p><strong>Status:</strong> <span style="color: green; font-weight: bold;">${payment.status}</span></p>
                        </div>
                        `;
                    }
                }
                
                html += `
                    </div>
                </div>
                </body>
                </html>
                `;
                
                res.writeHead(200, { "Content-Type": "text/html" });
                res.end(html);
            }
        );
        return;
    }

    // Add Policy Page (GET)
    if(req.url.indexOf("/add-policy") === 0) {
        var username = req.url.split("username=")[1];
        
        fs.readFile("./pages/booking.html", "utf8", function(err, data) {
            if(err) {
                sendMessagePage(res, "Error", "Failed to load policy form page.");
                return;
            }
            
            var html = data
                .replace(/{{title}}/g, "Add Policy")
                .replace(/{{action}}/g, "/insert-policy")
                .replace(/{{username}}/g, username)
                .replace(/{{idField}}/g, "")
                .replace(/{{policy_name}}/g, "")
                .replace(/{{premium}}/g, "")
                .replace(/{{coverage}}/g, "")
                .replace(/{{duration}}/g, "")
                .replace(/{{description}}/g, "");
                
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(html);
        });
        
        return;
    }

    // Insert Policy (POST)
    if(req.url === "/insert-policy" && req.method === "POST") {
        var body = "";
        
        req.on("data", function(chunk) {
            body += chunk.toString();
        });
        
        req.on("end", function() {
            var data = querystring.parse(body);
            
            db.query(
                "INSERT INTO policies (policy_name, premium, coverage, duration, description) VALUES (?, ?, ?, ?, ?)",
                [data.policy_name, data.premium, data.coverage, data.duration, data.description],
                function(err, result) {
                    if(err) {
                        sendMessagePage(res, "Database Error", "Failed to save the policy: " + err.message);
                        return;
                    }
                    
                    res.writeHead(302, {
                        "Location": "/agent-dashboard?username=" + data.username
                    });
                    res.end();
                }
            );
        });
        
        return;
    }

    // Apply for Policy (GET)
    if(req.url.indexOf("/apply-policy") === 0) {
        var urlParts = req.url.split("?");
        var params = querystring.parse(urlParts[1]);
        var username = params.username;
        var policyId = params.policy_id;
        
        db.query(
            "SELECT * FROM policies WHERE id = ?",
            [policyId],
            function(err, policies) {
                if(err || policies.length === 0) {
                    sendMessagePage(res, "Error", "Policy not found.");
                    return;
                }
                
                var policy = policies[0];
                
                var html = `
                <html>
                <head>
                    <link rel="stylesheet" href="/style.css">
                </head>
                <body>
                    <div class="topbar">
                        <h1>Premium Payment Checkout</h1>
                        <a href="/">
                            <button style="width:auto">Logout</button>
                        </a>
                    </div>
                    
                    <div class="auth-container" style="min-height: calc(100vh - 80px);">
                        <div class="auth-box" style="max-width: 500px;">
                            <div style="text-align:center; margin-bottom:25px;">
                                <h2 style="color:#1e3a8a; margin-bottom:10px;">Payment Checkout</h2>
                                <p style="color:#64748b;">Complete payment to activate your coverage</p>
                            </div>
                            
                            <div class="container" style="background: #f8fafc; border-left: 5px solid #10b981; margin-bottom: 20px; padding: 15px;">
                                <h3 style="color:#0f172a; margin-bottom:8px;">${policy.policy_name}</h3>
                                <p style="margin-top: 4px;"><strong>Premium Amount:</strong> $${policy.premium}</p>
                                <p style="margin-top: 4px;"><strong>Duration:</strong> ${policy.duration}</p>
                            </div>
                            
                            <form action="/process-payment" method="POST">
                                <input type="hidden" name="username" value="${username}">
                                <input type="hidden" name="policy_id" value="${policyId}">
                                <input type="hidden" name="amount" value="${policy.premium}">
                                
                                <label>Cardholder Name</label>
                                <input type="text" name="card_name" placeholder="John Doe" required>
                                
                                <label style="margin-top:15px; display:block;">Card Number</label>
                                <input type="text" name="card_number" placeholder="4111 2222 3333 4444" maxlength="19" required>
                                
                                <div style="display: flex; gap: 15px; margin-top: 15px;">
                                    <div style="flex: 1;">
                                        <label>Expiry Date</label>
                                        <input type="text" name="card_expiry" placeholder="MM/YY" maxlength="5" required>
                                    </div>
                                    <div style="flex: 1;">
                                        <label>CVV</label>
                                        <input type="password" name="card_cvv" placeholder="123" maxlength="4" required>
                                    </div>
                                </div>
                                
                                <button type="submit" style="background: linear-gradient(90deg, #10b981, #059669); margin-top: 25px;">
                                    Authorize Payment ($${policy.premium})
                                </button>
                            </form>
                            
                            <div style="text-align:center; margin-top:20px;">
                                <a href="javascript:history.back()">← Cancel & Go Back</a>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
                `;
                
                res.writeHead(200, { "Content-Type": "text/html" });
                res.end(html);
            }
        );
        
        return;
    }

    // Process Payment (POST)
    if(req.url === "/process-payment" && req.method === "POST") {
        var body = "";
        
        req.on("data", function(chunk) {
            body += chunk.toString();
        });
        
        req.on("end", function() {
            var data = querystring.parse(body);
            var username = data.username;
            var policyId = data.policy_id;
            var amount = data.amount;
            var currentDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
            
            db.query(
                "INSERT INTO policy_applications (username, policy_id, status, details) VALUES (?, ?, ?, ?)",
                [username, policyId, "Approved", "Paid Online"],
                function(err) {
                    if(err) {
                        sendMessagePage(res, "Error", "Failed to submit application: " + err.message);
                        return;
                    }
                    
                    db.query(
                        "INSERT INTO payments (username, policy_id, amount, payment_date, status) VALUES (?, ?, ?, ?, ?)",
                        [username, policyId, amount, currentDate, "Successful"],
                        function(err) {
                            if(err) {
                                sendMessagePage(res, "Error", "Failed to process payment: " + err.message);
                                return;
                            }
                            
                            var html = `
                            <html>
                            <head>
                                <link rel="stylesheet" href="/style.css">
                            </head>
                            <body>
                                <div class="auth-container">
                                    <div class="auth-box" style="text-align: center;">
                                        <div style="font-size: 60px; color: #10b981; margin-bottom: 20px;">✔</div>
                                        <h1 style="color: #10b981; margin-bottom: 15px; font-size: 28px;">Payment Succeeded!</h1>
                                        
                                        <p style="font-size: 16px; color: #475569; margin-bottom: 25px; line-height: 1.6;">
                                            Your transaction has been processed successfully. Your insurance policy is now active.
                                        </p>
                                        
                                        <button onclick="location.href='/my-policies?username=${username}'">
                                            Go to My Policies
                                        </button>
                                    </div>
                                </div>
                            </body>
                            </html>
                            `;
                            
                            res.writeHead(200, { "Content-Type": "text/html" });
                            res.end(html);
                        }
                    );
                }
            );
        });
        
        return;
    }

    // My Policies (GET)
    if(req.url.indexOf("/my-policies") === 0) {
        var username = req.url.split("username=")[1];
        
        db.query(
            "SELECT p.*, pay.payment_date, pay.amount, pay.status AS payment_status FROM policies p JOIN payments pay ON p.id = pay.policy_id WHERE pay.username = ?",
            [username],
            function(err, policies) {
                if (err) {
                    sendMessagePage(res, "Error", "Failed to retrieve policies.");
                    return;
                }
                
                var html = `
                <html>

                <head>
                <link rel="stylesheet" href="/style.css">
                </head>

                <body>

                <div class="topbar">
                    <h1>My Policies</h1>
                    <a href="/">
                        <button style="width:auto">Logout</button>
                    </a>
                </div>

                <div class="dashboard-wrapper">

                    <div class="left-column">
                        <div class="container">
                            <h2>Welcome ${username}</h2>
                            <button onclick="location.href='/customer-dashboard?username=${username}'">
                                Available Policies
                            </button>
                            <button class="active" onclick="location.href='/my-policies?username=${username}'" style="background: linear-gradient(90deg, #1e40af, #1e3a8a);">
                                My Policies
                            </button>
                            <button onclick="location.href='/claim-status?username=${username}'">
                                Claim Status
                            </button>
                        </div>
                    </div>

                    <div class="right-column">
                        <h2>My Purchased Policies</h2>
                `;
                
                if (policies.length === 0) {
                    html += `
                        <div class="container" style="grid-column: 1 / -1; text-align: center;">
                            <p style="color: #64748b; font-size: 16px;">You don't have any active policies yet.</p>
                        </div>
                    `;
                } else {
                    for(var i = 0; i < policies.length; i++) {
                        var policy = policies[i];
                        html += `
                        <div class="container">
                            <h3>${policy.policy_name}</h3>
                            <p><strong>Premium Paid:</strong> ${policy.amount}</p>
                            <p><strong>Coverage:</strong> ${policy.coverage}</p>
                            <p><strong>Duration:</strong> ${policy.duration}</p>
                            <p><strong>Purchase Date:</strong> ${policy.payment_date}</p>
                            <p><strong>Status:</strong> <span style="color: green; font-weight: bold;">Active</span></p>
                            
                            <button onclick="location.href='/file-claim?username=${username}&policy_id=${policy.id}'" style="margin-top:15px; background:linear-gradient(90deg, #ef4444, #dc2626)">
                                File Claim
                            </button>
                        </div>
                        `;
                    }
                }
                
                html += `
                    </div>
                </div>
                </body>
                </html>
                `;
                
                res.writeHead(200, { "Content-Type": "text/html" });
                res.end(html);
            }
        );
        return;
    }

    // File Claim Form (GET)
    if(req.url.indexOf("/file-claim") === 0) {
        var urlParts = req.url.split("?");
        var params = querystring.parse(urlParts[1]);
        var username = params.username;
        var policyId = params.policy_id;
        
        db.query(
            "SELECT * FROM policies WHERE id = ?",
            [policyId],
            function(err, policies) {
                if (err || policies.length === 0) {
                    sendMessagePage(res, "Error", "Policy not found.");
                    return;
                }
                var policy = policies[0];
                
                var html = `
                <html>
                <head>
                    <link rel="stylesheet" href="/style.css">
                </head>
                <body>
                    <div class="topbar">
                        <h1>File Insurance Claim</h1>
                        <a href="/">
                            <button style="width:auto">Logout</button>
                        </a>
                    </div>
                    
                    <div class="auth-container" style="min-height: calc(100vh - 80px);">
                        <div class="auth-box">
                            <div style="text-align:center; margin-bottom:25px;">
                                <h2 style="color:#1e3a8a; margin-bottom:10px;">File Claim</h2>
                                <p style="color:#64748b;">Submit claim details for <strong>${policy.policy_name}</strong></p>
                            </div>
                            
                            <form action="/submit-claim" method="POST">
                                <input type="hidden" name="username" value="${username}">
                                <input type="hidden" name="policy_id" value="${policyId}">
                                
                                <label>Claim Reason & Details</label>
                                <textarea name="claim_details" id="claim_details" placeholder="Describe the reason for your claim, including date of incident, hospital/details..." rows="6" required></textarea>
                                
                                <button type="submit">Submit Claim</button>
                            </form>
                            
                            <div style="text-align:center; margin-top:20px;">
                                <a href="javascript:history.back()">← Go Back</a>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
                `;
                
                res.writeHead(200, { "Content-Type": "text/html" });
                res.end(html);
            }
        );
        return;
    }

    // Submit Claim (POST)
    if(req.url === "/submit-claim" && req.method === "POST") {
        var body = "";
        
        req.on("data", function(chunk) {
            body += chunk.toString();
        });
        
        req.on("end", function() {
            var data = querystring.parse(body);
            var username = data.username;
            var policyId = data.policy_id;
            var claimDetails = data.claim_details;
            
            db.query(
                "INSERT INTO claims (username, policy_id, claim_details, status) VALUES (?, ?, ?, ?)",
                [username, policyId, claimDetails, "Under Review"],
                function(err, result) {
                    if(err) {
                        sendMessagePage(res, "Database Error", "Failed to submit claim: " + err.message);
                        return;
                    }
                    
                    res.writeHead(302, {
                        "Location": "/claim-status?username=" + username
                    });
                    res.end();
                }
            );
        });
        
        return;
    }

    // Claim Status (GET)
    if(req.url.indexOf("/claim-status") === 0) {
        var username = req.url.split("username=")[1];
        
        db.query(
            "SELECT c.*, p.policy_name FROM claims c JOIN policies p ON c.policy_id = p.id WHERE c.username = ?",
            [username],
            function(err, claims) {
                if (err) {
                    sendMessagePage(res, "Error", "Failed to retrieve claims.");
                    return;
                }
                
                var html = `
                <html>

                <head>
                <link rel="stylesheet" href="/style.css">
                </head>

                <body>

                <div class="topbar">
                    <h1>Claim Tracking</h1>
                    <a href="/">
                        <button style="width:auto">Logout</button>
                    </a>
                </div>

                <div class="dashboard-wrapper">

                    <div class="left-column">
                        <div class="container">
                            <h2>Welcome ${username}</h2>
                            <button onclick="location.href='/customer-dashboard?username=${username}'">
                                Available Policies
                            </button>
                            <button onclick="location.href='/my-policies?username=${username}'">
                                My Policies
                            </button>
                            <button class="active" onclick="location.href='/claim-status?username=${username}'" style="background: linear-gradient(90deg, #1e40af, #1e3a8a);">
                                Claim Status
                            </button>
                        </div>
                    </div>

                    <div class="right-column">
                        <h2>Your Submitted Claims</h2>
                `;
                
                if (claims.length === 0) {
                    html += `
                        <div class="container" style="grid-column: 1 / -1; text-align: center;">
                            <p style="color: #64748b; font-size: 16px;">You have not submitted any claims yet.</p>
                        </div>
                    `;
                } else {
                    for(var i = 0; i < claims.length; i++) {
                        var claim = claims[i];
                        
                        var badgeColor = "orange";
                        if (claim.status === "Approved") {
                            badgeColor = "green";
                        } else if (claim.status === "Rejected") {
                            badgeColor = "red";
                        }
                        
                        html += `
                        <div class="container">
                            <h3>Claim ID: #${claim.id}</h3>
                            <p><strong>Policy Name:</strong> ${claim.policy_name}</p>
                            <p><strong>Claim Details:</strong> ${claim.claim_details}</p>
                            <p><strong>Status:</strong> <span style="color: ${badgeColor}; font-weight: bold;">${claim.status}</span></p>
                        </div>
                        `;
                    }
                }
                
                html += `
                    </div>
                </div>
                </body>
                </html>
                `;
                
                res.writeHead(200, { "Content-Type": "text/html" });
                res.end(html);
            }
        );
        return;
    }

    // 404
   // 404 Page
res.writeHead(404, {
    "Content-Type": "text/html"
});

res.end(`

<html>

<head>

<title>404 Error</title>

<link rel="stylesheet" href="/style.css">

</head>

<body>

<div class="auth-container">

    <div class="auth-box">

        <h1 style="
        text-align:center;
        color:red;
        margin-bottom:20px;
        ">
        404 Error
        </h1>

        <p style="
        text-align:center;
        font-size:16px;
        margin-bottom:25px;
        ">
        Page Not Found
        </p>

        <a href="/">

            <button>

                Back to Home

            </button>

        </a>

    </div>

</div>

</body>

</html>

`);
});

server.listen(3000, function() {

    console.log(
        "Server Running on Port 3000"
    );
});