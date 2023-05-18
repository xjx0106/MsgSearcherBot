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

	await saveData({
		list: [],
		text: ""
	}, "tempMsgList"); // 清空臨時搜索結果
	const data = getData('msg/result');
	const messageList = data.messages ? data.messages : [];

	const originText = msg.text + "";
	const text = originText.length === '/search'.length ? '' : originText.replace("/search ", "");

	if (text) {
		const msgsWithTarget = messageList.filter(msgItem => {
			const textEntities = msgItem.text_entities || [];
			const one = textEntities.find(entity => entity.text.includes(text));
			if (one) {
				return true;
			} else {
				return false;
			}
		})

		await saveData({
			list: msgsWithTarget,
			text
		}, "tempMsgList"); // 將臨時搜索結果保存到tempMsgList.json文件裏
		queryTempMsg(msg.chat.id);

	} else {
		bot.sendMessage(msg.chat.id, 'null content');
	}
});

module.exports = bot.on("message", async msg => {
	const isAdmin = await checkRights(msg.from.id);
	if (!isAdmin) {
		await bot.sendMessage(msg.chat.id, "這是個人使用的bot，你没有权限。");
		return;
	}

	await saveData({
		list: [],
		text: ""
	}, "tempMsgList"); // 清空臨時搜索結果
	const data = getData('msg/result');
	const messageList = data.messages ? data.messages : [];

	let text = msg.text + '';
	if (text.startsWith("/search")) {
		text = "";
		return;
	}

	if (text) {
		const msgsWithTarget = messageList.filter(msgItem => {
			const textEntities = msgItem.text_entities || [];
			const one = textEntities.find(entity => entity.text.includes(text));
			if (one) {
				return true;
			} else {
				return false;
			}
		})

		await saveData({
			list: msgsWithTarget,
			text
		}, "tempMsgList"); // 將臨時搜索結果保存到tempMsgList.json文件裏
		queryTempMsg(msg.chat.id);

	}
});

/**
 * 從臨時搜索結果裏獲取出分頁來展示
 * @param { Number | String } chatId 對話id，即用戶和bot之間的聊天對話id
 * @param { Number | String } messageId 在對話中那條消息的id
 * @param { Object } param 分頁的數據，如{page:1,size:10}
 */
const queryTempMsg = async (chatId, messageId = "no_messageId", param = {
	page: 1,
	size: 10
}) => {
	const tempMsgListData = await getData("tempMsgList"); // 包含了目標搜索詞的、臨時儲存著的消息
	const {
		list: msgsWithTarget,
		text
	} = tempMsgListData;
	const {
		page,
		size
	} = param;

	/**
	 * 分割出當前分頁要展示的那一部分消息，即要展示的消息
	 */
	const msgToDisplay = msgsWithTarget.slice((page - 1) * size, page * size);

	let content = '';
	msgToDisplay.forEach((item, index) => {
		/**
		 * 單條記錄要展示的行
		 */
		const line = "【" + ((page - 1) * size + (index + 1)) + "】 [" + item.from + "]:" + item.text_entities.map(ent => ent.text).join(' ') + "  --------  " + item.date.replace("T", " ");
		content += line + '\n\n';
	});

	content = content.split(text).join("<b>" + text + "</b>");

	const totalCount = msgsWithTarget.length;
	const pagesLine = generatePageNumberList(page, size, totalCount);
	content += pagesLine;

	const totalPage = Math.ceil(msgsWithTarget.length / size);
	content += '=============================\n共有 ' + msgsWithTarget.length + " 條, 頁數 " + page + " / " + totalPage + " 頁，每頁展示 " + size + " 條";


	const callbackData1 = {
		c: chatId,
		m: messageId,
		p: page,
		s: size,
		t: 'pre'
	};
	const callbackData2 = {
		c: chatId,
		m: messageId,
		p: page,
		s: size,
		t: 'nex'
	};
	const callbackDataNull = {
		c: chatId,
		m: messageId,
		p: page,
		s: size,
		t: 'no'
	}; // 這條作爲暫時無用的按鈕數據，暫時也設定個一樣格式的數據在裏面吧

	const cbd1 = JSON.stringify(callbackData1); // 按鈕數據
	const cbd2 = JSON.stringify(callbackData2); // 按鈕數據
	const cbdN = JSON.stringify(callbackDataNull); // 按鈕數據

	/**
	 * 按鈕單行
	 */
	const inlineKeyboard = [{
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
			text: " ",
			callback_data: cbdN,
		},
		{
			text: "-> 向后",
			callback_data: cbd2,
		}
	];

	if (messageId === "no_messageId") {
		// 發送搜索的分頁結果
		bot.sendMessage(chatId, content, {
			parse_mode: "HTML",
			reply_markup: {
				inline_keyboard: [
					inlineKeyboard
				],
			},
		});
	} else {
		// 修改message_id為messageId的那條分頁消息的數據
		bot.editMessageText(content, {
			chat_id: chatId,
			message_id: messageId,
			parse_mode: "HTML",
			reply_markup: {
				inline_keyboard: [
					inlineKeyboard
				],
			}
		});
	}
}

/**
 * 生成頁碼行字符串，如“1  2  3  4  5  6  7”等
 * @param {*} page 當前頁數
 * @param {*} size 單頁大小
 * @param {*} totalCount 總條數
 */
const generatePageNumberList = (page, size, totalCount) => {
	// \n1   2   3   4   <b><u>5</u></b>   6   7   8
	let result = "";
	const totalPage = Math.ceil(totalCount / size); // 縂頁數。看一共有幾頁
	let pageNumberList = []; // totalPage為6的時候：['1','2','3','4','5','6']
	for (let i = 1; i <= totalPage; i++) {
		if (page === i) {
			// 推入粗體帶有下劃綫的頁數
			pageNumberList.push("<b><u>[" + i + "]</u></b>");
		} else {
			// 推入普通頁數
			pageNumberList.push("" + i);
		}
	}
	// pageNumberList此時：totalPage為6，page為1的時候：['<b><u>1</u></b>','2','3','4','5','6']

	// 截斷處理
	if (pageNumberList.length <= 9) {
		result = pageNumberList
	} else {
		if (page <= 5) {
			// 截掉後部分
			result = pageNumberList.slice(0, 9)
		} else if (page >= totalPage - 4) {
			// 截掉前部分
			result = pageNumberList.slice(totalPage - 9);
		} else {
			// 截取中間
			result = pageNumberList.slice(page - 4 - 1, page + 4);
		}
	}
	if(totalCount <= 10) {
		// 條數小於10，便無需展示翻頁
		result = [];
	}
	return result.join("    ") + "\n";
}

module.exports = {
	queryTempMsg
};