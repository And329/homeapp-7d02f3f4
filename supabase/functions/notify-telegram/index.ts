import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
const TELEGRAM_CHAT_ID = Deno.env.get('TELEGRAM_CHAT_ID');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PropertyRequest {
  id: string;
  title: string;
  type: 'rent' | 'sale';
  property_type: string | null;
  price: number;
  location: string | null;
  emirate: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  area: number | null;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  submitter_type: 'owner' | 'broker' | 'referral';
  created_at: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Telegram notification function called');

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      console.error('Missing Telegram configuration');
      return new Response(
        JSON.stringify({ error: 'Telegram configuration missing' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { record } = await req.json() as { record: PropertyRequest };
    
    if (!record) {
      console.error('No property request data received');
      return new Response(
        JSON.stringify({ error: 'No property request data' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing property request:', record.id);

    // Format the message
    const submitterTypeLabel = {
      owner: 'Owner',
      broker: 'Broker',
      referral: 'Referral'
    }[record.submitter_type] || record.submitter_type;

    const message = `🏠 *New Property Request*

*Title:* ${record.title}
*Type:* ${record.type.toUpperCase()} - ${record.property_type || 'N/A'}
*Price:* AED ${record.price.toLocaleString()}
*Location:* ${record.emirate || 'N/A'} - ${record.location || 'N/A'}
*Size:* ${record.bedrooms || 'N/A'} BR, ${record.bathrooms || 'N/A'} BA
*Area:* ${record.area ? `${record.area} m²` : 'N/A'}

*Submitter:* ${record.contact_name} (${submitterTypeLabel})
*Email:* ${record.contact_email}
*Phone:* ${record.contact_phone || 'N/A'}

*Request ID:* \`${record.id}\`
*Submitted:* ${new Date(record.created_at).toLocaleString('en-US', { timeZone: 'Asia/Dubai' })} GST`;

    // Send to Telegram
    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    const telegramResponse = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
      }),
    });

    const telegramResult = await telegramResponse.json();
    
    if (!telegramResponse.ok) {
      console.error('Telegram API error:', telegramResult);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to send Telegram notification', 
          details: telegramResult 
        }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Telegram notification sent successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Telegram notification sent',
        telegram_message_id: telegramResult.result?.message_id 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error in notify-telegram function:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
