const moment = require('moment')

function formatMessage(uname, text) {
    return {
        uname,
        text,
        time: moment().format('HH:mm:ss')
    }
}

module.exports = formatMessage
