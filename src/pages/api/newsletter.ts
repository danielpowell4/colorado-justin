export const prerender = false; // Not needed in 'server' mode
import type { APIRoute } from "astro";

const fallbackEndpoint = 'missing endpoint env';
const emailListEndpoint = import.meta.env.NEWSLETTER_ENDPOINT || fallbackEndpoint;

export const POST: APIRoute = async ({ request }) => {
    if (emailListEndpoint === fallbackEndpoint) {
        return new Response(
            JSON.stringify({
                message: "Missing required environment variable",
            }),
            { status: 500 }
        );
    }

  const data = await request.formData();
  const email = data.get("email");

  // Validate the data (SIMPLE)
  if (!email) {
    return new Response(
      JSON.stringify({ message: "Missing required field 'email'", success: false }),
      { status: 422 }
    );
  }

  try {
      const res = await fetch(
        emailListEndpoint,
        {
          method: "POST",
          body: JSON.stringify({ email }),
          headers: { "Content-Type": "application/json" },
        }
      )

      if (!res.ok) {
        return new Response(
          JSON.stringify({
            message: "An error occurred while adding the email to the list",
            error: res.statusText,
            success: false
          }),
          { status: res.status }
        );
      }

      const json = await res.json();
      return new Response(JSON.stringify(json), { status: 200 });

  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Unknown error"
    return new Response(
      JSON.stringify({
        message: "An error occurred while adding the email to the list",
        error: errorMsg,
        success: false
      }),
      { status: 500 }
    );
  }
};
