import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const acquire = vi.hoisted(() => vi.fn());
vi.mock("../auth/apiToken", () => ({ acquireApiAccessToken: acquire }));
import { evidenceRequest } from "./evidenceApi";
describe("evidence API boundary", () => {
  const fetcher = vi.fn();
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubGlobal("fetch", fetcher);
    acquire.mockResolvedValue("app-token");
    fetcher.mockResolvedValue({
      ok: true,
      json: async () => ({ data: { source: "microsoft_graph" }, error: null }),
    });
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });
  it("uses authenticated no-store requests without following redirects", async () => {
    await evidenceRequest("tenant-A", "current");
    expect(fetcher.mock.calls[0][1]).toMatchObject({
      headers: { Authorization: "Bearer app-token" },
      redirect: "error",
      cache: "no-store",
    });
  });
  it("does not call the API after failed authentication", async () => {
    acquire.mockRejectedValue(new Error("Denied"));
    expect((await evidenceRequest("tenant-A", "current")).data).toBeNull();
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("keeps denied and unavailable data absent without mock fallback", async () => {
    fetcher.mockResolvedValue({
      ok: false,
      json: async () => ({ data: null, error: "Forbidden", code: "FORBIDDEN" }),
    });
    expect(await evidenceRequest("tenant-A", "current")).toEqual({
      data: null,
      error: "Forbidden",
      code: "FORBIDDEN",
    });
    expect(fetcher).toHaveBeenCalledOnce();
  });
  it("posts disconnect explicitly and encodes tenant path segments", async () => {
    await evidenceRequest("tenant/a", "disconnect", "POST");
    expect(fetcher.mock.calls[0][0]).toContain("tenant%2Fa/disconnect");
    expect(fetcher.mock.calls[0][1].method).toBe("POST");
  });
});
