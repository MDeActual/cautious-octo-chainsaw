export interface Evidence {
  id: string;
  tenant_id: string;
  collected_at: string;
  source: "microsoft_graph";
  secure_score: {
    current: number;
    max: number;
    percentage: number | null;
    reported_at: string | null;
  };
  controls: {
    id: string;
    title: string;
    category: string;
    description: string;
    action_url: string | null;
    observed_score: number | null;
    max_score: number | null;
    score_gap: number | null;
  }[];
  limitations: string[];
}
export interface Connection {
  configured: boolean;
  storage_ready: boolean;
  connected: boolean;
}
export interface EvidenceResult<T> {
  data: T | null;
  error: string | null;
  code?: string;
}
export async function evidenceRequest<T>(
  tenant: string,
  action: string,
  method = "GET",
): Promise<EvidenceResult<T>> {
  try {
    const { acquireApiAccessToken } = await import("../auth/apiToken");
    const token = await acquireApiAccessToken();
    const response = await fetch(
      `${import.meta.env["VITE_CORE_API"] ?? "http://localhost:3003"}/assessment-evidence/${encodeURIComponent(tenant)}/${action}`,
      {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        redirect: "error",
        cache: "no-store",
      },
    );
    const result = (await response.json()) as EvidenceResult<T>;
    if (!response.ok)
      return {
        data: null,
        error: result.error ?? "Assessment unavailable",
        code: result.code,
      };
    return result;
  } catch {
    return {
      data: null,
      error: "Assessment service unavailable",
      code: "UNAVAILABLE",
    };
  }
}
