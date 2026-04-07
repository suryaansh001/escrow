const ADMIN_AUTH_KEY = "demo_admin_auth";

export const adminAuth = {
  isLoggedIn() {
    return localStorage.getItem(ADMIN_AUTH_KEY) === "true";
  },
  login() {
    localStorage.setItem(ADMIN_AUTH_KEY, "true");
  },
  logout() {
    localStorage.removeItem(ADMIN_AUTH_KEY);
  },
};
