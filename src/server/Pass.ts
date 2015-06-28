import crypto = require('crypto');

export class Pass {
  private static _ITERATIONS : number = 12000;
  private static _PASS_HASH_LEN : number = 128;

  public static hash(password : string, salt : string, func : Function){
    crypto.pbkdf2(password, salt, Pass._ITERATIONS,Pass._PASS_HASH_LEN,function(err, hash){
      func(err, hash.toString('base64'));
    })
  }
}
