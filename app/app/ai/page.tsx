'use client';

import { useEffect, useRef, useState } from 'react';
import { Brain, Send, Loader2, User as UserIcon, Sprout, Trash2 } from 'lucide-react';

import { AppShell } from '@/components/app/app-shell';
import { PageHeader, SectionCard, Disclaimer } from '@/components/app/ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/components/providers/auth-provider';
import { useFarm } from '@/components/providers/farm-provider';
import { supabase } from '@/lib/supabase';
import { AIConversation, AIMessage } from '@/types/database';
import { cn } from '@/lib/utils';

const SUGGESTED = [
  "I have 2 acres of red soil and limited water. What can I grow?",
  "When should I vaccinate my cows?",
  "How do I improve soil organic matter?",
  "What government schemes am I eligible for?",
  "How much water does rice need vs groundnut?",
];

export default function AIPage() {
  return <AppShell><Content /></AppShell>;
}

function Content() {
  const { user, profile } = useAuth();
  const { activeFarm, crops } = useFarm();
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [activeConv, setActiveConv] = useState<AIConversation | null>(null);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from('ai_conversations').select('*').eq('user_id', user.id).order('updated_at', { ascending: false });
      const list = (data as AIConversation[]) ?? [];
      setConversations(list);
      if (list.length > 0) await selectConversation(list[0]);
      setLoading(false);
    })();
  }, [user]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const selectConversation = async (conv: AIConversation) => {
    setActiveConv(conv);
    const { data } = await supabase.from('ai_messages').select('*').eq('conversation_id', conv.id).order('created_at', { ascending: true });
    setMessages((data as AIMessage[]) ?? []);
  };

  const newConversation = async (): Promise<AIConversation | null> => {
    if (!user) return null;
    const { data, error } = await supabase.from('ai_conversations').insert({ user_id: user.id, title: 'New conversation' }).select().maybeSingle();
    if (error || !data) return null;
    const conv = data as AIConversation;
    setConversations([conv, ...conversations]);
    setActiveConv(conv);
    setMessages([]);
    return conv;
  };

  const deleteConversation = async (conv: AIConversation) => {
    const { error } = await supabase.from('ai_conversations').delete().eq('id', conv.id);
    if (error) return;
    const remaining = conversations.filter((c) => c.id !== conv.id);
    setConversations(remaining);
    if (activeConv?.id === conv.id) {
      setActiveConv(null);
      setMessages([]);
      if (remaining.length > 0) await selectConversation(remaining[0]);
    }
  };

  const buildFarmContext = (): string => {
    if (!profile || !activeFarm) return '';
    const parts: string[] = [];
    parts.push(`Farmer: ${profile.full_name}, experience: ${profile.experience ?? 'unknown'}`);
    parts.push(`Farm: ${activeFarm.name}, ${activeFarm.land_area ?? 'unknown'} ${activeFarm.area_unit}, soil: ${activeFarm.soil_type ?? 'unknown'}, water: ${activeFarm.water_availability ?? 'unknown'}, irrigation: ${activeFarm.irrigation_type ?? 'unknown'}`);
    const activeCrops = crops.filter((c) => c.status !== 'harvested' && c.status !== 'failed');
    if (activeCrops.length > 0) parts.push('Active crops: ' + activeCrops.map((c) => c.crop_name + ' (' + (c.growth_stage ?? 'unknown stage') + ')').join(', '));
    if (profile.budget) parts.push(`Budget: Rs ${profile.budget}`);
    return parts.join('. ');
  };

  const send = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || sending) return;
    let conv = activeConv;
    if (!conv) {
      conv = await newConversation();
    }
    if (!conv || !user) return;
    const activeConvId = conv.id;
    const activeConvTitle = conv.title;

    setInput('');
    setSending(true);

    const userMsg: AIMessage = {
      id: 'temp-' + Date.now(), conversation_id: conv.id, user_id: user.id,
      role: 'user', content, farm_context: null, created_at: new Date().toISOString(),
    };
    setMessages((m) => [...m, userMsg]);

    const history = messages.map((m) => ({ role: m.role, content: m.content }));

    const { error: insertError } = await supabase.from('ai_messages').insert({
      conversation_id: activeConvId, user_id: user.id, role: 'user', content,
    });
    if (insertError) console.error('Save user msg:', insertError.message);

    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/ai-assistant`;
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          messages: [...history, { role: 'user', content }],
          farmContext: buildFarmContext(),
        }),
      });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const data = await res.json();
      const reply = data.content ?? 'Sorry, I could not generate a response. Please try again.';

      const assistantMsg: AIMessage = {
        id: 'temp-a-' + Date.now(), conversation_id: activeConvId, user_id: user.id,
        role: 'assistant', content: reply, farm_context: null, created_at: new Date().toISOString(),
      };
      setMessages((m) => [...m, assistantMsg]);

      await supabase.from('ai_messages').insert({
        conversation_id: activeConvId, user_id: user.id, role: 'assistant', content: reply,
        farm_context: { farm: activeFarm?.name, crops: crops.map((c) => c.crop_name) },
      });

      if (activeConvTitle === 'New conversation') {
        const newTitle = content.slice(0, 40) + (content.length > 40 ? '...' : '');
        const { error: tErr } = await supabase.from('ai_conversations').update({ title: newTitle, updated_at: new Date().toISOString() }).eq('id', activeConvId);
        if (!tErr) {
          setConversations((c) => c.map((x) => x.id === activeConvId ? { ...x, title: newTitle } : x));
          setActiveConv((prev) => prev ? { ...prev, title: newTitle } : prev);
        }
      }
    } catch (err: any) {
      const errorMsg: AIMessage = {
        id: 'temp-e-' + Date.now(), conversation_id: activeConvId, user_id: user.id,
        role: 'assistant', content: 'AI service is temporarily unavailable. Please try again later.', farm_context: null, created_at: new Date().toISOString(),
      };
      setMessages((m) => [...m, errorMsg]);
    }
    setSending(false);
  };

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="CropWise AI" description="Your context-aware farming assistant" icon={Brain} action={
        <Button size="sm" variant="outline" onClick={newConversation} className="gap-1">New chat</Button>
      } />

      <div className="grid gap-4 lg:grid-cols-4">
        {/* Conversation list */}
        <div className="lg:col-span-1">
          <SectionCard title="Conversations">
            {loading ? <p className="text-sm text-muted-foreground">Loading...</p> : conversations.length === 0 ? (
              <p className="text-sm text-muted-foreground">No conversations yet.</p>
            ) : (
              <div className="space-y-1">
                {conversations.map((c) => (
                  <div key={c.id} className={cn('group flex items-center justify-between rounded-lg px-2 py-1.5 text-sm', activeConv?.id === c.id ? 'bg-primary/10 text-foreground' : 'text-muted-foreground hover:bg-muted')}>
                    <button onClick={() => selectConversation(c)} className="flex-1 truncate text-left">{c.title}</button>
                    <button onClick={() => deleteConversation(c)} className="text-destructive opacity-0 group-hover:opacity-100"><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        {/* Chat */}
        <div className="lg:col-span-3">
          <SectionCard className="flex h-[600px] flex-col">
            <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto pr-1">
              {messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <span className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Brain size={32} /></span>
                  <p className="font-display text-lg font-semibold text-foreground">Ask CropWise AI anything</p>
                  <p className="mt-1 max-w-sm text-sm text-muted-foreground">I use your farm profile as context to give personalized guidance on crops, soil, livestock, finance and more.</p>
                  <div className="mt-6 grid w-full max-w-md gap-2">
                    {SUGGESTED.map((s) => (
                      <button key={s} onClick={() => send(s)} className="rounded-lg border border-border bg-card p-3 text-left text-sm text-muted-foreground transition-colors hover:border-primary/30 hover:bg-primary/5">
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((m) => <MessageBubble key={m.id} message={m} />)
              )}
              {sending && (
                <div className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Sprout size={16} /></span>
                  <div className="rounded-2xl rounded-tl-sm bg-muted px-4 py-2.5"><Loader2 size={16} className="animate-spin text-muted-foreground" /></div>
                </div>
              )}
            </div>

            <div className="mt-4 flex gap-2 border-t border-border pt-4">
              <Input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }} placeholder="Ask about crops, soil, livestock, finance..." disabled={sending} />
              <Button onClick={() => send()} disabled={sending || !input.trim()} className="gap-1"><Send size={16} /></Button>
            </div>
          </SectionCard>
          <Disclaimer>CropWise AI provides guidance, not guaranteed advice. For disease diagnosis it suggests &quot;possible issues&quot; — consult a professional for confirmation. Financial figures are estimates.</Disclaimer>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: AIMessage }) {
  const isUser = message.role === 'user';
  return (
    <div className={cn('flex items-start gap-3', isUser && 'flex-row-reverse')}>
      <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', isUser ? 'bg-secondary text-secondary-foreground' : 'bg-primary text-primary-foreground')}>
        {isUser ? <UserIcon size={16} /> : <Sprout size={16} />}
      </span>
      <div className={cn('max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm', isUser ? 'rounded-tr-sm bg-primary text-primary-foreground' : 'rounded-tl-sm bg-muted text-foreground')}>
        {message.content}
      </div>
    </div>
  );
}
