import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file || file.type !== 'application/pdf') {
      throw new Error('Invalid file type. Expected PDF.');
    }

    // Read the file as array buffer
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    // Simple PDF text extraction (basic implementation)
    // For production, use a proper PDF parsing library
    const text = extractTextFromPDF(bytes);
    
    // Convert to basic HTML with paragraphs
    const htmlContent = text
      .split('\n\n')
      .filter(para => para.trim())
      .map(para => `<p>${para.trim()}</p>`)
      .join('\n');

    return new Response(
      JSON.stringify({ content: htmlContent }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error parsing PDF:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});

// Basic PDF text extraction
function extractTextFromPDF(bytes: Uint8Array): string {
  const decoder = new TextDecoder('utf-8');
  let text = decoder.decode(bytes);
  
  // Remove PDF metadata and binary data
  text = text.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F]/g, '');
  
  // Extract text between BT and ET markers (PDF text objects)
  const textMatches = text.match(/\(([^)]+)\)/g);
  
  if (!textMatches) return '';
  
  return textMatches
    .map(match => match.slice(1, -1)) // Remove parentheses
    .map(str => str.replace(/\\n/g, '\n')) // Handle newlines
    .join(' ')
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}
