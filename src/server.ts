import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const url = new URL(request.url);

      if (url.pathname === "/api/admin/upload-image") {
        return await handleUploadImage(request, env);
      }

      if (url.pathname.startsWith("/api/images/")) {
        const fileId = url.pathname.replace("/api/images/", "");
        return await handleServeImage(fileId, env);
      }

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};

async function handleUploadImage(request: Request, env: unknown): Promise<Response> {
  try {
    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json" },
      });
    }

    const envObj = (env ?? {}) as Record<string, string | undefined>;
    const botToken = process.env.TELEGRAM_BOT_TOKEN || envObj.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID || envObj.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      console.error("TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is missing");
      return new Response(
        JSON.stringify({ error: "Telegram Bot storage is not configured on the server." }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") || formData.get("image");

    if (!file || !(file instanceof Blob)) {
      return new Response(JSON.stringify({ error: "No image file uploaded" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const fileName = (file as File).name || "image.jpg";

    const photoForm = new FormData();
    photoForm.append("chat_id", chatId);
    photoForm.append("photo", file, fileName);

    let tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
      method: "POST",
      body: photoForm,
    });

    let tgData = (await tgRes.json()) as {
      ok?: boolean;
      description?: string;
      result?: {
        photo?: Array<{ file_id: string }>;
        document?: { file_id: string };
      };
    };

    if (!tgData?.ok) {
      console.warn("Telegram sendPhoto failed, trying sendDocument:", tgData?.description);
      const docForm = new FormData();
      docForm.append("chat_id", chatId);
      docForm.append("document", file, fileName);

      tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendDocument`, {
        method: "POST",
        body: docForm,
      });

      tgData = (await tgRes.json()) as typeof tgData;
    }

    if (!tgData?.ok) {
      console.error("Telegram API upload failed:", tgData);
      return new Response(
        JSON.stringify({ error: tgData?.description || "Failed to upload image to Telegram" }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    let fileId = "";
    if (Array.isArray(tgData.result?.photo) && tgData.result.photo.length > 0) {
      fileId = tgData.result.photo[tgData.result.photo.length - 1].file_id;
    } else if (tgData.result?.document?.file_id) {
      fileId = tgData.result.document.file_id;
    }

    if (!fileId) {
      return new Response(JSON.stringify({ error: "No file_id returned from Telegram" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        file_id: fileId,
        url: `/api/images/${fileId}`,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal server error";
    console.error("Upload error:", err);
    return new Response(JSON.stringify({ error: errorMsg }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

async function handleServeImage(fileId: string, env: unknown): Promise<Response> {
  try {
    if (!fileId) {
      return new Response("Missing fileId", { status: 400 });
    }

    const envObj = (env ?? {}) as Record<string, string | undefined>;
    const botToken = process.env.TELEGRAM_BOT_TOKEN || envObj.TELEGRAM_BOT_TOKEN;

    if (!botToken) {
      console.error("TELEGRAM_BOT_TOKEN is missing");
      return new Response("Server configuration error", { status: 500 });
    }

    const getFileUrl = `https://api.telegram.org/bot${botToken}/getFile?file_id=${encodeURIComponent(fileId)}`;
    const getFileRes = await fetch(getFileUrl);
    const getFileData = (await getFileRes.json()) as {
      ok?: boolean;
      description?: string;
      result?: { file_path?: string };
    };

    if (!getFileData?.ok || !getFileData?.result?.file_path) {
      console.error("Telegram getFile failed:", getFileData);
      return new Response("Image not found", { status: 404 });
    }

    const filePath = getFileData.result.file_path;
    const downloadUrl = `https://api.telegram.org/file/bot${botToken}/${filePath}`;

    const imgRes = await fetch(downloadUrl);
    if (!imgRes.ok) {
      return new Response("Failed to fetch image from Telegram", { status: imgRes.status });
    }

    const contentType = imgRes.headers.get("content-type") || getContentTypeFromPath(filePath);
    const arrayBuffer = await imgRes.arrayBuffer();

    return new Response(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err: unknown) {
    console.error("Error serving image:", err);
    return new Response("Internal server error", { status: 500 });
  }
}

function getContentTypeFromPath(filePath: string): string {
  const lower = filePath.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".gif")) return "image/gif";
  if (lower.endsWith(".svg")) return "image/svg+xml";
  return "image/jpeg";
}
