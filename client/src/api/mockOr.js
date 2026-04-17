export const useMockApi = import.meta.env.VITE_MOCK_API === "true";

/**
 * When VITE_MOCK_API=true, skip the network and return `{ data }` shaped like Axios.
 */
export function mockOr(apiCall, mockPayload) {
  if (!useMockApi) return apiCall();
  const data = typeof mockPayload === "function" ? mockPayload() : mockPayload;
  return Promise.resolve({
    data,
    status: 200,
    statusText: "OK",
    headers: {},
    config: {},
  });
}
