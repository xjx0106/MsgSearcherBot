const bot = require('../index.js');
const {
	saveData,
	getData
} = require('../utils/index');

module.exports = bot.onText(/\/search/, onLoveText = async (msg) => {
	saveData([], "msg/temp");
	const data = getData('msg/result');
	const messageList = data.messages ?  data.messages : [];

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
		console.log("[msgsWithTarget]->", msgsWithTarget.length);
		let content = '';
		msgsWithTarget.forEach(item => {
			const line = "[" + item.from + "]:" + item.text_entities.map(ent => ent.text).join(' ') + "--------" + item.date;
			content += line + '\n\n';
		});
		console.log("[content.length]->", content.length);
		bot.sendMessage(msg.chat.id, content);
	} else {
		bot.sendMessage(msg.chat.id, 'null content');
	}
});
