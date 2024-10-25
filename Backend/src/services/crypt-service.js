const bcrypt = require('bcrypt')
const saltrounds = 10

class CryptService { 
    cryptify(password){
        return bcrypt.hash(password, saltrounds)
    }

    async verify(uncrypted_data, crypted_data){
        return bcrypt.compare(uncrypted_data,crypted_data)
    }
}

module.exports = CryptService