export type UplinkClickPayload = {
  linkType: "back_to_results" | "browse_more";
  target: string;
  context: "state" | "county" | "city" | "unknown";
};

export function trackUplinkClick(payload: UplinkClickPayload) {
  if (typeof window === "undefined") return;

  const eventPayload = {
    event: "uplink_click",
    link_type: payload.linkType,
    target: payload.target,
    context: payload.context,
  };

  const dataLayerWindow = window as Window & {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (...args: unknown[]) => void;
  };

  dataLayerWindow.dataLayer?.push(eventPayload);
  if (typeof dataLayerWindow.gtag === "function") {
    dataLayerWindow.gtag("event", "uplink_click", {
      link_type: payload.linkType,
      target: payload.target,
      context: payload.context,
    });
  }
}
