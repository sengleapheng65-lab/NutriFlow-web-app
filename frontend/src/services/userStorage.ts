export function setActiveUserEmail(email: string) {
  localStorage.setItem("activeUserEmail", email.toLowerCase());
  localStorage.removeItem("userProfile");
}

export function getUserStorageKey(name: string): string {
  const email = localStorage.getItem("activeUserEmail") || "anonymous";
  return `${name}:${email.toLowerCase()}`;
}
