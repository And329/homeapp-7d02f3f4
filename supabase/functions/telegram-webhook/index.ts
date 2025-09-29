import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Telegram webhook called');

    if (!TELEGRAM_BOT_TOKEN) {
      console.error('Missing Telegram bot token');
      return new Response(
        JSON.stringify({ error: 'Telegram configuration missing' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const update = await req.json();
    console.log('Received update:', JSON.stringify(update));

    // Check if this is a message with /start command
    if (update.message && update.message.text === '/start') {
      const chatId = update.message.chat.id;
      const userName = update.message.from.first_name || 'there';
      
      console.log(`Received /start command from chat ID: ${chatId}`);

      // Send reply with chat ID
      const replyMessage = `Hello ${userName}! 👋\n\nYour Chat ID is: \`${chatId}\`\n\nYou can use this Chat ID to configure Telegram notifications in your application.`;

      const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
      
      const telegramResponse = await fetch(telegramUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: replyMessage,
          parse_mode: 'Markdown',
        }),
      });

      const telegramResult = await telegramResponse.json();
      
      if (!telegramResponse.ok) {
        console.error('Telegram API error:', telegramResult);
        return new Response(
          JSON.stringify({ 
            error: 'Failed to send Telegram message', 
            details: telegramResult 
          }), 
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Reply sent successfully to chat ID:', chatId);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Reply sent',
          chat_id: chatId
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // For other messages, just acknowledge receipt
    return new Response(
      JSON.stringify({ success: true, message: 'Update received' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error in telegram-webhook function:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
