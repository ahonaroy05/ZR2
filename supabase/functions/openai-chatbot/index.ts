import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import OpenAI from 'https://esm.sh/openai@4.47.1'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { user_id, message, chat_history_id } = await req.json()

    if (!user_id || !message) {
      return new Response(
        JSON.stringify({ error: 'User ID and message are required.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    })

    const supabaseServiceRoleClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    let currentChatHistoryId = chat_history_id
    let chatMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = []

    // Add system message for ZenRoute context
    chatMessages.push({
      role: 'system',
      content: `You are a helpful AI assistant for ZenRoute, a mindful commuting app that transforms daily commutes into stress-reducing experiences. You help users with:
      - Stress management and mindfulness techniques
      - Route planning and wellness optimization
      - Meditation and breathing exercises
      - Journal reflection and mood tracking
      - General app guidance and support
      
      Keep responses concise, supportive, and focused on wellness and mindful commuting. Always maintain a calm, encouraging tone.`
    })

    // Fetch existing chat history if chat_history_id is provided
    if (currentChatHistoryId) {
      const { data: history, error: historyError } = await supabaseServiceRoleClient
        .from('chat_history')
        .select('history')
        .eq('id', currentChatHistoryId)
        .single()

      if (historyError && historyError.code !== 'PGRST116') { // PGRST116 means no rows found
        console.error('Error fetching chat history:', historyError)
        return new Response(
          JSON.stringify({ error: 'Failed to fetch chat history.' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (history && history.history) {
        // Merge existing history (excluding system message if it exists)
        const existingMessages = history.history.filter((msg: any) => msg.role !== 'system')
        chatMessages = [...chatMessages, ...existingMessages]
      }
    }

    // Add the new user message to the chat history
    chatMessages.push({ role: 'user', content: message })

    const response = await openai.chat.completions.create({
      model: 'gpt-4o', // Using gpt-4o as requested
      messages: chatMessages,
      temperature: 0.7,
      max_tokens: 300,
    })

    const aiMessage = response.choices[0].message?.content

    if (!aiMessage) {
      return new Response(
        JSON.stringify({ error: 'No response from AI.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Add AI's response to the chat history
    chatMessages.push({ role: 'assistant', content: aiMessage })

    // Save or update chat history in Supabase
    if (currentChatHistoryId) {
      const { error: updateError } = await supabaseServiceRoleClient
        .from('chat_history')
        .update({ history: chatMessages, updated_at: new Date().toISOString() })
        .eq('id', currentChatHistoryId)

      if (updateError) {
        console.error('Error updating chat history:', updateError)
        return new Response(
          JSON.stringify({ error: 'Failed to update chat history.' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    } else {
      const { data: newChat, error: insertError } = await supabaseServiceRoleClient
        .from('chat_history')
        .insert({ user_id, history: chatMessages })
        .select('id')
        .single()

      if (insertError) {
        console.error('Error inserting new chat history:', insertError)
        return new Response(
          JSON.stringify({ error: 'Failed to save new chat history.' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      currentChatHistoryId = newChat.id
    }

    return new Response(
      JSON.stringify({ 
        aiMessage, 
        chat_history_id: currentChatHistoryId,
        usage: response.usage 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in Edge Function:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})