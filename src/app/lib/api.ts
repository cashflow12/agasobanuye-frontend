export async function authFetch(input: RequestInfo, init?: RequestInit) {
  const token = localStorage.getItem("admin_token");
  
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(input, {
    ...init,
    headers: {
      ...init?.headers,
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    localStorage.removeItem("admin_token");
    window.location.href = "/admin/login";
    throw new Error("Session expired");
  }

  return response;
}