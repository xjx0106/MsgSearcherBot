const fs = require('fs');
// const bot = require('../index');

/**
 * 保存文件
 * @param { Object } data 要保存的json數據 
 * @param { String } name 保存的文件名 
 */
const saveData = (data = {}, name = "1") => {
	const content = JSON.stringify(data);
	fs.writeFileSync('./data/' + name + '.json', content);
};
/**
 * 讀取文件
 * @param { String } name 讀取的文件名
 * @returns 返回所讀取到的json文件的json數據
 */
const getData = (name = "1") => {
	let rawdata = fs.readFileSync('./data/' + name + '.json');
	let data = JSON.parse(rawdata);
	return data;
};

/**
 * 檢測用戶的權限
 * @param { Number } userId 發起者的id
 * @returns 返回這個用戶是否是有權之人
 */
const checkRights = async (userId) => {
	const userIdStr = userId + ""; // "1111111"
	let hasRight = false;

	const rights = getData("right"); // right.json文件裏包含了允許使用這個bot的用戶id字符串，rights如["1111111", "2222222", "3333333"]
	if (rights.includes(userIdStr)) {
		hasRight = true;
	} else {
		hasRight = false;
	}

	return hasRight;
}

module.exports = {
	saveData,
	getData,
	checkRights
};