const isAdmin = function (ctx) {
  // 69582772 - nikolaevskaya
  // 676021457 - erofeev
  return [69582772, 676021457].includes(ctx.from.id);
} 

module.exports = isAdmin;
