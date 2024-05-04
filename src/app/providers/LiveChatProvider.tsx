import Script from "next/script";
import React from "react";

export default function LiveChatProvider() {
  const key = "2545e27e-7032-47eb-b960-f8a5a50c1663";
  return (
    <Script
      id="ze-snippet"
      src={`https://static.zdassets.com/ekr/snippet.js?key=` + key}
    >
      {" "}
    </Script>
  );
}
