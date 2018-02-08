import express from "express";
import bcrypt from "bcrypt";

const router = express.Router();

router.get("/", (req, res) => {
  const pwd = bcrypt.hashSync('test', 10);
  const email = 'surakit.c@psu.ac.th';
  const username = email.split('@')[0];
  // const pwd = '11111';
  res.json({
    test: 'Hello this is test route',
    content: 'ว่าไง นี่คือเทสเร้าท์นะ !!!',
    password: pwd,
    email,
    username
  });
});

export default router;
