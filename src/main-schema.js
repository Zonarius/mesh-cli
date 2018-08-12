'use strict';

const fs = require('fs');
const program = require('commander');
const Table = require('cli-table');
const rest = require("./rest");
const common = require("./common");

/**
 * Handle the add schema command.
 * @param {string} env 
 * @param {object} options 
 */
function addSchema(env, options) {
    // 1. Check whether a filename was specified
    if (env) {
        if (!fs.existsSync(env)) {
            console.error("Could not find file '" + env + "'");
            process.exit(1);
        } else {
            var json = JSON.parse(fs.readFileSync(env, 'utf8'));
            rest.post("/api/v1/schemas", json).end(r => {
                if (rest.check(r, 201, "Could not create schema")) {
                    console.log("Created schema '" + json.name + "'");
                }
            });
        }
        // Otherwise check stdin
    } else {

        var handled = false;
        process.stdin.resume();
        process.stdin.setEncoding('utf8');

        process.stdin.on('data', function (data) {
            handled = true;
            var json = JSON.parse(data);
            rest.post("/api/v1/schemas", json).end(r => {
                if (rest.check(r, 201, "Could not create schema")) {
                    console.log("Created schema '" + json.name + "'");
                }
            });
        });
        process.stdin.end();
        // Fail if no stdin could be found
        setTimeout(() => {
            if (!handled) {
                console.error("No json found.");
                process.exit(1);
            }
        }, 50);
    }
}


function updateSchema(env, options) {
    if (env) {
        if (!fs.existsSync(env)) {
            console.error("Could not find file '" + env + "'");
            process.exit(1);
        } else {
            var json = JSON.parse(fs.readFileSync(env, 'utf8'));
            if (!json.uuid) {
                console.error("Schema uuid is missing.");
                process.exit(1);
            }
            rest.post("/api/v1/schemas/" + json.uuid, json).end(r => {
                if (rest.check(r, 201, "Could not update schema")) {
                    console.log("Updated schema '" + json.name + "'");
                }
            });
        }
    } else {
        var handled = false;
        process.stdin.resume();
        process.stdin.setEncoding('utf8');

        process.stdin.on('data', function (data) {
            handled = true;
            var json = JSON.parse(data);
            if (!json.uuid) {
                console.error("Schema uuid is missing.");
                process.exit(1);
            }
            rest.post("/api/v1/schemas/" + json.uuid, json).end(r => {
                if (rest.check(r, 200, "Could not update schema")) {
                    console.log("Updated schema: '" + json.uuid + "' msg: " + r.body.message);
                }
            });
        });
        process.stdin.end();
        setTimeout(() => {
            if (!handled) {
                console.error("No json found.");
                process.exit(1);
            }
        }, 50);
    }
}

function removeSchema(env) {
    if (typeof env === 'undefined') {
        console.error("No name specified");
        process.exit(1);
    }
    withIdFallback(env, id => {
        rest.del("/api/v1/schemas/" + id).end(r => {
            if (rest.check(r, 204, "Could not remove schema " + id)) {
                console.log("Schema '" + id + "' removed");
            }
        });
    });
}



function getSchema(name, options) {
    if (typeof name === 'undefined') {
        console.error("No name specified");
        process.exit(1);
    }
    withIdFallback(name, id => {
        rest.get("/api/v1/schemas/" + id).end(r => {
            if (rest.check(r, 200, "Could not load schema")) {
                console.log(JSON.stringify(r.body, null, 4));
            }
        });
    });
}



function listSchemas(env, options) {
    rest.get("/api/v1/schemas").end(r => {
        if (rest.check(r, 200, "Could list schemas")) {

            var json = r.body;
            var table = new Table({
                head: ['UUID', 'Name', 'Version'],
                colWidths: [34, 18, 9]
            });

            json.data.forEach((element) => {
                table.push([element.uuid, element.name, element.version])
            });
            console.log(table.toString());
        }
    });
}


function withIdFallback(env, action) {
    rest.get("/api/v1/schemas").end(ur => {
        if (rest.check(ur, 200, "Could not load schemas")) {
            var id = null;
            ur.body.data.forEach(element => {
                if (element.name == env || element.uuid == env) {
                    id = element.uuid;
                }
            });
            if (id == null) {
                console.error("Did not find schema '" + env + "'");
                process.exit(1);
            } else {
                action(id);
            }
        }
    });
}


program
    .version('1.0.0')
    .usage("schema [options] [command]")
    .name("mesh-cli");

common.register();

program
    .command("add [filename]")
    .alias("a")
    .description("Add a new schema via stdin or via file.")
    .action(addSchema);

program
    .command("remove [name]")
    .alias("r")
    .description("Remove schema.")
    .action(removeSchema);

program
    .command("get [name]")
    .alias("g")
    .description("Get the schema.")
    .action(getSchema);


program
    .command("update [filename]")
    .alias("u")
    .description("Update schema via stdin or via file.")
    .action(updateSchema);

program
    .command("list")
    .alias("l")
    .description("List all schemas.")
    .action(listSchemas);



program.parse(process.argv);

var noSubCommand = program.args.length === 0;
if (noSubCommand) {
    program.help();
}