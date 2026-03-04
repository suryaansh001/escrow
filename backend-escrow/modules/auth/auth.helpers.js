import bcrypt from 'bcrypt';

const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export { hashPassword, comparePassword, generateOtp };