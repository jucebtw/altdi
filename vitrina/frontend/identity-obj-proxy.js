// Identity object proxy для мокинга CSS модулей в Jest
// Простой вариант без установки пакета
module.exports = new Proxy({}, {
  get: function(target, name) {
    return name;
  }
});
