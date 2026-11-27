const matter = require("gray-matter");

module.exports = (source) => matter(source).content;
