import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  const title = "DT Tài Khoản Số";
  const subtitle = "Dịch vụ tài khoản số • Hỗ trợ nhanh";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          background: "linear-gradient(135deg, #eef6ff, #e0f2fe)",
          padding: 64,
        }}
      >
        <div
          style={{
            fontSize: 56,
            fontWeight: 800,
            color: "#0f172a",
            lineHeight: 1.1,
          }}
        >
          {title}
        </div>
        <div
          style={{
            marginTop: 16,
            fontSize: 28,
            color: "#334155",
          }}
        >
          {subtitle}
        </div>
        <div
          style={{
            marginTop: 36,
            fontSize: 22,
            color: "#1e293b",
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            padding: "10px 16px",
            backgroundColor: "#fef3c7",
            borderRadius: 999,
            border: "2px solid #f59e0b",
          }}
        >
          dttaikhoanso.vercel.app
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}

