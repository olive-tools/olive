function isValidAuth(authorization) {
  if (!authorization) {
    return false;
  }
  const authSplit = authorization.split(" ");
  return (
    authSplit.length === 2 &&
    authSplit[0] === "Basic" &&
    authSplit[1] === process.env.TOKEN
  );
}

module.exports = { isValidAuth };
