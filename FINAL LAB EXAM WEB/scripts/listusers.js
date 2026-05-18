const mongoose = require('mongoose');
require('dotenv').config();
(async ()=>{
  try{
    await mongoose.connect(process.env.MONGODB_URI, {useNewUrlParser:true, useUnifiedTopology:true});
    const User = require('../models/User');
    const users = await User.find().select('+password').lean();
    users.forEach(u=>{
      console.log(`${u.email} | role=${u.role} | pwdHash=${(u.password||'').slice(0,20)}`);
    });
    await mongoose.disconnect();
  }catch(e){console.error('ERR',e.message); process.exit(1);} 
})();
