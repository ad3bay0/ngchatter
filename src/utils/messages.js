
const generateChat = (username,message) => {

    return { username,message, createdAt: new Date().getTime() }
};
const generateLocation = (username,url) => {

    return {username, url, createdAt: new Date().getTime() }
};
module.exports = { generateChat, generateLocation };