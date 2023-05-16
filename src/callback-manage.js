const bot = require("../index.js");
const {
    getData,
    saveData
} = require("../utils/index");

const {
    queryTempMsg
} = require("./seacher")


module.exports = bot.on("callback_query", onLoveText = (msg) => {
    const data = msg.data;
    const messageId = msg.message.message_id;

    const dataObj = JSON.parse(data); // 將字符串轉化爲json對象
    const {
        c: chatId,
        p: page,
        s: size,
        t: type
    } = dataObj; // 從json對象裏解構出c、p、s、t，并且重命名為chatId、page、size、type

    if (type === "pre") {
        // 上一頁
        if (page > 1) {
            const newPage = page - 1;
            queryTempMsg(chatId, messageId, {
                page: newPage,
                size
            });
        }
    } else if (type === 'nex') {
        // 下一頁
        const newPage = page + 1;
        queryTempMsg(chatId, messageId, {
            page: newPage,
            size
        });
    }
});