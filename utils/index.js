const fs = require('fs');
const bot = require('../index');

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

module.exports = {
	saveData,
	getData
};