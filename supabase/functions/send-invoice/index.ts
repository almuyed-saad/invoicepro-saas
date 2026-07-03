import { Resend } from 'npm:resend@^6';

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey',
      },
    });
  }

  try {
    const body = await req.json();
    const { action, data } = body;

    if (!action) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing action' }),
        {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          status: 400,
        }
      );
    }

    if (action === 'send-html-email') {
      if (!data || !data.to || !data.subject || !data.html) {
        return new Response(
          JSON.stringify({ success: false, error: 'Missing email data' }),
          {
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            status: 400,
          }
        );
      }

      // Use your Gmail as the sender
      const { data: emailData, error } = await resend.emails.send({
        from: 'iamsaad236@gmail.com',  // ← YOUR GMAIL ADDRESS
        to: [data.to],
        subject: data.subject,
        html: data.html,
      });

      if (error) {
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          {
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            status: 500,
          }
        );
      }

      return new Response(
        JSON.stringify({ success: true, data: emailData }),
        {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          status: 200,
        }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: `Unknown action: ${action}` }),
      {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        status: 400,
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        status: 500,
      }
    );
  }
});