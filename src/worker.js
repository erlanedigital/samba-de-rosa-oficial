/**
 * Cloudflare Worker — Samba de Rosa Oficial
 * Montes Claros - MG | A Força Feminina do Samba
 * Roteamento de API, Headers de Segurança e Assets Estáticos
 */

// Headers de Segurança Bancária e Conformidade
const SECURITY_HEADERS = {
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
  "Content-Security-Policy": "default-src 'self' 'unsafe-inline' 'unsafe-eval' https: data: blob:; img-src 'self' https: data: blob:; media-src 'self' https: data: blob:; font-src 'self' https: data:; connect-src 'self' https:;"
};

function addSecurityHeaders(response) {
  const newHeaders = new Headers(response.headers);
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    newHeaders.set(key, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders
  });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Endpoint de Verificação de Saúde / Status
    if (url.pathname === "/api/health") {
      return new Response(JSON.stringify({
        status: "online",
        service: "Samba de Rosa Official Worker",
        city: "Montes Claros - MG",
        timestamp: new Date().toISOString()
      }), {
        headers: { "Content-Type": "application/json", ...SECURITY_HEADERS }
      });
    }

    // Endpoint de Proposta / Contratação (com sanitização)
    if (url.pathname === "/api/booking" && request.method === "POST") {
      try {
        const body = await request.json();
        const clientName = (body.name || "").toString().trim().slice(0, 100);
        const phone = (body.phone || "").toString().replace(/[^0-9]/g, "").slice(0, 15);
        const eventDate = (body.date || "").toString().trim().slice(0, 20);
        const eventType = (body.type || "Show").toString().trim().slice(0, 50);

        if (!clientName || !phone) {
          return new Response(JSON.stringify({ error: "Nome e telefone são obrigatórios." }), {
            status: 400,
            headers: { "Content-Type": "application/json", ...SECURITY_HEADERS }
          });
        }

        return new Response(JSON.stringify({
          success: true,
          message: "Solicitação recebida com sucesso pela produção do Samba de Rosa.",
          data: { clientName, phone, eventDate, eventType }
        }), {
          headers: { "Content-Type": "application/json", ...SECURITY_HEADERS }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: "Payload inválido." }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...SECURITY_HEADERS }
        });
      }
    }

    // Servir assets estáticos compilados (dist/)
    if (env.ASSETS) {
      try {
        const assetResponse = await env.ASSETS.fetch(request);
        return addSecurityHeaders(assetResponse);
      } catch (e) {
        return new Response("Asset not found", { status: 404, headers: SECURITY_HEADERS });
      }
    }

    return new Response("Worker Samba de Rosa em modo local.", {
      headers: { "Content-Type": "text/plain; charset=utf-8", ...SECURITY_HEADERS }
    });
  }
};
