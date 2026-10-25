import { useEffect, useState } from "react";

export default function WhatsAppFloat() {
  const [number, setNumber] = useState("");

  useEffect(() => {
    let active = true;
    import("../api/api.js")
      .then(({ fetchPublicSettings }) => fetchPublicSettings())
      .then((settings) => {
        if (active) setNumber((settings.whatsapp_number || "").replace(/[^\d+]/g, ""));
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  if (!number) return null;

  return (
    <a
      className="whatsapp-float"
      href={`https://wa.me/${number}?text=${encodeURIComponent("Hi NOVA! I have a question about an order.")}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with NOVA on WhatsApp"
    >
      <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
        <path d="M12.04 2c-5.46 0-9.9 4.44-9.9 9.9 0 1.75.46 3.45 1.32 4.95L2 22l5.3-1.39c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.9-4.44 9.9-9.9S17.5 2 12.04 2Zm0 18.02c-1.48 0-2.94-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.09 8.09 0 0 1-1.24-4.31c0-4.47 3.64-8.1 8.12-8.1 4.47 0 8.1 3.63 8.1 8.1 0 4.48-3.63 8.17-8.1 8.17Zm4.47-6.09c-.24-.12-1.44-.71-1.66-.79-.22-.08-.39-.12-.55.12-.16.24-.63.79-.77.95-.14.16-.28.18-.52.06-.24-.12-1.03-.38-1.96-1.21-.72-.64-1.21-1.44-1.35-1.68-.14-.24-.02-.37.11-.5.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.55-1.32-.75-1.81-.2-.48-.4-.41-.55-.42h-.47c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2 0 1.18.86 2.32.98 2.48.12.16 1.7 2.59 4.11 3.63.57.25 1.02.4 1.37.51.58.18 1.1.16 1.51.1.46-.07 1.44-.59 1.64-1.16.2-.57.2-1.05.14-1.16-.06-.1-.22-.16-.46-.28Z" />
      </svg>
      <span>Chat with us</span>
    </a>
  );
}
