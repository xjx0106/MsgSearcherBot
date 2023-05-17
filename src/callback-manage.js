const bot = require("../index.js");
const {
    getData,
    saveData
} = require("../utils/index");

const {
    queryTempMsg
} = require("./seacher")


module.exports = bot.on("callback_query", onLoveText = async (msg) => {
    const data = msg.data;
    const messageId = msg.message.message_id;

    const dataObj = JSON.parse(data); // 將字符串轉化爲json對象
    const {
        c: chatId,
        p: page,
        s: size,
        t: type
    } = dataObj; // 從json對象裏解構出c、p、s、t，并且重命名為chatId、page、size、type

    const tempMsgListData = await getData("tempMsgList"); // 包含了目標搜索詞的、臨時儲存著的消息
    const {
        list: msgsWithTarget,
    } = tempMsgListData;
    const totalPage = Math.ceil(msgsWithTarget.length / size);

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
        if (page < totalPage) {
            const newPage = page + 1;
            queryTempMsg(chatId, messageId, {
                page: newPage,
                size
            });
        }
    }
});