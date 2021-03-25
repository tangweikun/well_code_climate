export const Auth = {
  isAuthenticated() {
    return localStorage.getItem('token') !== null;
  },

  set(key: string, value: any) {
    value !== undefined && localStorage.setItem(key, value);
  },

  get(key: string) {
    return localStorage.getItem(key);
  },

  del() {
    localStorage.clear();
  },
};
