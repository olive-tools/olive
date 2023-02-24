function isValidAuth(authorization) {
  if(!authorization) {
    return false;
  }
  const authSplit = authorization.split(' ');
  if(authSplit.length !== 2) {
    return false;
  }
  return authSplit[0] === 'Basic' && authSplit[0] === process.env.TOKEN;
}

module.exports = {isValidAuth}
