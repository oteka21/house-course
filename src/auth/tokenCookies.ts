export const setTokenCookie = (token: string) => {
  fetch("/api/login", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ token }),
  });
};

export const removeTokenCookie = () => {
  fetch("/api/logout", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({}),
  });
};
