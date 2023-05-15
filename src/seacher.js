const bot = require('../index.js');
const {
	saveData,
	getData,
	checkRights
} = require('../utils/index');

module.exports = bot.onText(/\/search/, onLoveText = async (msg) => {
	const isAdmin = await checkRights(msg.from.id);
	if (!isAdmin) {
		await bot.sendMessage(msg.chat.id, "這是個人使用的bot，你没有权限。");
		return;
	}

	await saveData([], "tempMsgList");
	const data = getData('msg/result');
	const messageList = data.messages ? data.messages : [];

	const originText = msg.text + "";
	console.log("[originText]->", originText);
	const text = originText.length === '/search'.length ? '' : originText.replace("/search ", "");
	console.log("[target]->", text);
	console.log("[target.length]->", text.length);

	if (text) {
		console.log("[messageList]->", messageList.length);
		const msgsWithTarget = messageList.filter(msgItem => {
			const textEntities = msgItem.text_entities || [];
			const one = textEntities.find(entity => entity.text.includes(text));
			if (one) {
				return true;
			} else {
				return false;
			}
		})

		await saveData(msgsWithTarget, "tempMsgList");
		queryTempMsg(msg.chat.id);

	} else {
		bot.sendMessage(msg.chat.id, 'null content');
	}
});

/**
 * 
 * @param { Number | String } chatId 
 * @param { Number | String } messageId 
 * @param { Object } param 
 */
const queryTempMsg = async (chatId, messageId = "no_messageId", param = {
	page: 1,
	size: 10
}) => {
	const msgsWithTarget = await getData("tempMsgList");
	const {
		page,
		size
	} = param;

	const msgDisplay = msgsWithTarget.slice((page - 1) * size, page * size);

	let content = '';
	msgDisplay.forEach(item => {
		const line = "[" + item.from + "]:" + item.text_entities.map(ent => ent.text).join(' ') + "--------" + item.date;
		content += line + '\n\n';
	});
	content += '-----------------\ntotal ' + msgsWithTarget.length + " , page " + page + " size " + size;


	const cbData1 = {
		c: chatId,
		m: messageId,
		p: page,
		s: size,
		t: 'pre'
	};
	const cbData2 = {
		c: chatId,
		m: messageId,
		p: page,
		s: size,
		t: 'nex'
	};
	const cbDataN = {
		c: chatId,
		m: messageId,
		p: page,
		s: size,
		t: 'no'
	};

	const cbd1 = JSON.stringify(cbData1);
	const cbd2 = JSON.stringify(cbData2);
	const cbdN = JSON.stringify(cbDataN);

	if (messageId === "no_messageId") {
		const res = await bot.sendMessage(chatId, content, {
			parse_mode: "HTML",
			reply_markup: {
				inline_keyboard: [
					[{
							text: "<- 向前",
							callback_data: cbd1,
						},
						{
							text: " ",
							callback_data: cbdN,
						},
						{
							text: " ",
							callback_data: cbdN,
						},
						{
							text: "-> 向后",
							callback_data: cbd2,
						}
					]
				],
			},
		});
	} else {
		await bot.editMessageText(content, {
			chat_id: chatId,
			message_id: messageId,
			parse_mode: "HTML",
			reply_markup: {
				inline_keyboard: [
					[{
							text: "<- 向前",
							callback_data: cbd1,
						},
						{
							text: " ",
							callback_data: cbdN,
						},
						{
							text: " ",
							callback_data: cbdN,
						},
						{
							text: "-> 向后",
							callback_data: cbd2,
						}
					]
				],
			}
		});
	}
}

module.exports = {
	queryTempMsg
};