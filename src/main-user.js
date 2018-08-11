#!/usr/bin/env node
'use strict';

const program = require('commander');
const rest = require("./rest");
const lists = require("./lists");
const clui = require('clui');
const clc = require('cli-color');
const Line = clui.Line;

function addUser() {
    rest.post(cfg, "/api/v1/users");
}

function removeUser(env) {
    var id = null;
    rest.delete(cfg, "/api/v1/users/" + id);
}

function passwd(env) {
    var body = {
        password: "pass"
    };
    rest.post(cfg, "/api/v1/users/" + id, body);
}

function listUsers(env) {
    rest.get("/api/v1/users").end(r => {

        var json = r.body;
        var buffer = lists.buffer();

        var header = new Line(buffer)
            .column('UUID', 34, [clc.cyan])
            .column('Username', 15, [clc.cyan])
            .column('Firstname', 30, [clc.cyan])
            .column('Lastname', 30, [clc.cyan])
            .column('Groups', 30, [clc.cyan])
            .fill()
            .store();

        json.data.forEach((element) => {
            var groups = new Array();
            element.groups.forEach(group => {
                groups.push(group.name);
            });
            var groupsStr = "[" + groups.join() + "]";
            new Line(buffer)
                .column(element.uuid, 34)
                .column(element.username || "-", 15)
                .column(element.firstname || "-", 30)
                .column(element.lastname || "-", 30)
                .column(groupsStr, 30)
                .fill()
                .store();
        });

        buffer.output();

    });
}

function apiKey(env, options) {
    rest.post(cfg, "/api/v1/users/" + id + "/token");
}

program
    .version('1.0.0')
    .usage("user [options] [command]")
    .name("mesh-cli");

program
    .command('add [name]')
    .description("Add a new user.")
    .action(addUser);

program
    .command('remove [name/uuid]')
    .description("Remove the user.")
    .action(removeUser);

program
    .command('list')
    .description("List all users.")
    .action(listUsers);

program
    .command('passwd [name/uuid]')
    .description("Change the password.")
    .option("-u, --user [username]", "Username")
    .option("-p, --pass [password]", "Password")
    .action(passwd);

program
    .command("key [name/uuid]")
    .description("Generate a new API key.")
    //. Note that generating a new API key will invalidate the existing API key of the user.")
    .action(apiKey);

program.parse(process.argv);

var noSubCommand = program.args.length === 0;
if (noSubCommand) {
    program.help();
}