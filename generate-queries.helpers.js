module.exports.generateReturnStatements = function(num) {
  return Array(num)
    .fill(null)
    .map((_, i) => ({ query: "RETURN $x", parameters: { x: i + 1 } }));
};

module.exports.generateChangePwStatement = function(newPw = Math.random()) {
  return {
    query: "CALL dbms.security.changePassword($password)",
    parameters: { password: `${newPw}` }
  };
};
