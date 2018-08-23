'use strict';

const rest = require("../../inc/rest");
const common = require("../../inc/common");
const log = common.log;
const error = common.error;
const debug = common.debug;
const commonFuse = require("../commonFuse");

function resolve(stack) {
    if (stack.isEmpty()) {
        return {
            attr: cb => {
                commonFuse.directory(cb);
            },
            list: cb => {
                commonFuse.list("/api/v1/groups", cb);
            },
            read: cb => {
                cb(0);
            }
        }
    } else {
        var segment = stack.pop();
    }
}


module.exports = { resolve }
