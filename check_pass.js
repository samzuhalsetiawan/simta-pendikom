const bcrypt = require('bcryptjs');

const hash = '$2a$12$b4MiRcuzT9S.EBNvY2lS7edFuv1MmHa9TGJrk0LLIshQhLiv/aYs6';
const candidates = ['password', '123456', 'admin', 'user'];

async function check() {
   for (const pass of candidates) {
      const match = await bcrypt.compare(pass, hash);
      console.log(`Password '${pass}' match: ${match}`);
   }
}

check();
