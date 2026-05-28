const { exec } = require("child_process");

exec("node db.js", (err) => {
    if (err) throw err;
    exec("node seed.js", (err) => {
        if (err) throw err;
        exec("node server.js", (err) => {
            if (err) throw err;
        });
    });
});
