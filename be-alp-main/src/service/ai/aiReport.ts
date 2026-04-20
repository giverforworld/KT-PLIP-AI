import { config } from "@/config/config";
import https from "https";
import http from "http";

interface CodiChatRequest {
  query: string;
  user: string;
  conversationId?: string;
}

export function streamChatMessage(
  params: CodiChatRequest,
  onData: (chunk: string) => void,
  onEnd: () => void,
  onError: (error: Error) => void
): void {
  const { apiUrl, apiKey } = config.codi;
  const url = new URL(`${apiUrl}/chat-messages`);
  const isHttps = url.protocol === "https:";

  const body = JSON.stringify({
    inputs: {},
    query: params.query,
    response_mode: "streaming",
    conversation_id: params.conversationId || "",
    user: params.user,
  });

  const options: https.RequestOptions = {
    hostname: url.hostname,
    port: url.port || (isHttps ? 443 : 80),
    path: url.pathname,
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "User-Agent": "PLIP-ALP/1.0",
    },
    rejectUnauthorized: false,
  } as any;

  const client = isHttps ? https : http;

  const req = client.request(options, (res) => {
    if (res.statusCode && res.statusCode >= 400) {
      let errorBody = "";
      res.on("data", (chunk) => (errorBody += chunk));
      res.on("end", () =>
        onError(new Error(`CODI API error (${res.statusCode}): ${errorBody}`))
      );
      return;
    }

    res.setEncoding("utf8");
    res.on("data", (chunk: string) => {
      onData(chunk);
    });
    res.on("end", () => {
      onEnd();
    });
  });

  req.on("error", (err) => {
    onError(err);
  });

  req.write(body);
  req.end();
}
