var crypto = require('crypto');
var Pass = (function () {
    function Pass() {
    }
    Pass.hash = function (password, salt, func) {
        crypto.pbkdf2(password, salt, Pass._ITERATIONS, Pass._PASS_HASH_LEN, function (err, hash) {
            func(err, hash.toString('base64'));
        });
    };
    Pass._ITERATIONS = 12000;
    Pass._PASS_HASH_LEN = 128;
    return Pass;
})();
exports.Pass = Pass;
