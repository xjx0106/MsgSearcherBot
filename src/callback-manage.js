const bot = require("../index.js");
const {
    getData,
    saveData,
    sendMemberPermission
} = require("../utils/index");

const {
    queryTempMsg
} = require("./seacher")


module.exports = bot.on("callback_query", onLoveText = (msg) => {
    const data = msg.data;
    const messageId = msg.message.message_id;

    const dataObj = JSON.parse(data);
    const {
        c: chatId,
        p: page,
        s: size,
        t: type
    } = dataObj;
    if (type === "pre") {
        if (page > 1) {
            const newPage = page - 1;
            queryTempMsg(chatId, messageId, {
                page: newPage,
                size
            });
        }
    } else if (type === 'nex') {
        const newPage = page + 1;
        queryTempMsg(chatId, messageId, {
            page: newPage,
            size
        });
    }
});