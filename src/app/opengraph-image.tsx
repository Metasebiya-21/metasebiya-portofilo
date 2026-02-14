import { ImageResponse } from "next/og";
import { profile } from "@/content/profile";

export const runtime = "edge";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 38,
          background: "linear-gradient(135deg, #f6fbff 0%, #e8f3ff 52%, #d7e9ff 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "58px 64px",
          color: "#10263d",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 20, color: "#1f4f7a" }}>
          <span style={{ width: 10, height: 10, borderRadius: 999, background: "#0ea5e9" }} />
          Portfolio
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.06 }}>{profile.name}</div>
          <div style={{ fontSize: 28, color: "#1f4f7a", maxWidth: 1000 }}>{profile.headline}</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, color: "#355a79" }}>
          <span>{profile.location}</span>
          <span>{profile.website}</span>
        </div>
      </div>
    ),
    size,
  );
}
