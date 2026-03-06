const validateEmail = (email) => {
  if (!email) return;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Invalid email format');
  }
};

const validatePhoneNumber = (phone) => {
  if (!phone) return;
  const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
  if (!phoneRegex.test(phone)) {
    throw new Error('Invalid phone number format');
  }
};

export { validateEmail, validatePhoneNumber };
