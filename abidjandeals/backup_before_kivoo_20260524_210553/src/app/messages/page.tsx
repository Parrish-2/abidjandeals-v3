'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { supabase } from '@/lib/supabase'
import { useStore } from '@/lib/store'
import { Send, MessageCircle, Search, ChevronLeft } from 'lucide-react'
import toast from 'react-hot-toast'

export default function MessagesPage() {
  const router = useRouter()
  const { user, setAuthModalOpen } = useStore()
  const [conversations, setConversations] = useState<any[]>([])
  const [activeConv, setActiveConv]       = useState<any>(null)
  const [messages, setMessages]           = useState<any[]>([])
  const [newMsg, setNewMsg]               = useState('')
  const [loading, setLoading]             = useState(true)
  const [sending, setSending]             = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!user) { setAuthModalOpen(true); router.push('/'); return }
    loadConversations()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  useEffect(() => {
    if (activeConv) {
      loadMessages(activeConv.id)
      const channel = supabase
        .channel(`messages:${activeConv.id}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${activeConv.id}` },
          payload => setMessages(prev => [...prev, payload.new]))
        .subscribe()
      return () => { supabase.removeChannel(channel) }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConv])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function loadConversations() {
    if (!user) return
    const { data } = await supabase
      .from('conversations')
      .select('*, ads(title,photos,emoji), profiles!other_user_id(prenom,nom)')
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .order('updated_at', { ascending: false })
    setConversations(data || [])
    setLoading(false)
  }

  async function loadMessages(convId: string) {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true })
    setMessages(data || [])
    await supabase.from('messages').update({ read: true })
      .eq('conversation_id', convId).neq('sender_id', user?.id)
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!newMsg.trim() || !activeConv || !user) return
    setSending(true)
    const { error } = await supabase.from('messages').insert({
      conversation_id: activeConv.id,
      sender_id: user.id,
      content: newMsg.trim(),
    })
    if (!error) {
      setNewMsg('')
      await supabase.from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', activeConv.id)
    } else {
      toast.error('Erreur lors de l\'envoi')
    }
    setSending(false)
  }

  if (!user) return null

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto px-4 py-6 w-full">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-card overflow-hidden" style={{height: 'calc(100vh - 180px)'}}>
          <div className="flex h-full">

            {/* Liste conversations */}
            <div className={`w-full md:w-80 border-r border-gray-100 flex flex-col ${activeConv && isMobile ? 'hidden' : 'flex'}`}>
              <div className="p-4 border-b border-gray-100">
                <h2 className="font-sans font-bold text-lg text-dark mb-3">Messages</h2>
                <div className="relative">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" placeholder="Rechercher..." className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-400" />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="p-4 space-y-3">
                    {[1,2,3].map(i => <div key={i} className="flex gap-3 animate-pulse"><div className="w-12 h-12 bg-gray-200 rounded-full" /><div className="flex-1 space-y-2"><div className="h-3 bg-gray-200 rounded w-3/4" /><div className="h-3 bg-gray-200 rounded w-1/2" /></div></div>)}
                  </div>
                ) : conversations.length > 0 ? (
                  conversations.map(conv => (
                    <button key={conv.id} onClick={() => setActiveConv(conv)}
                      className={`w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-left ${activeConv?.id === conv.id ? 'bg-orange-50' : ''}`}>
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                        {conv.profiles?.prenom?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-dark text-sm">{conv.profiles?.prenom} {conv.profiles?.nom}</p>
                        <p className="text-xs text-gray-500 line-clamp-1">{conv.ads?.title}</p>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <MessageCircle size={40} className="text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">Aucun message</p>
                    <p className="text-xs text-gray-400 mt-1">Contactez un vendeur depuis une annonce</p>
                  </div>
                )}
              </div>
            </div>

            {/* Zone messages */}
            <div className={`flex-1 flex flex-col ${!activeConv && isMobile ? 'hidden' : 'flex'}`}>
              {activeConv ? (
                <>
                  {/* Header conv */}
                  <div className="flex items-center gap-3 p-4 border-b border-gray-100">
                    <button onClick={() => setActiveConv(null)} className="md:hidden p-2 -ml-1 text-gray-500">
                      <ChevronLeft size={20} />
                    </button>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold">
                      {activeConv.profiles?.prenom?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="font-semibold text-dark text-sm">{activeConv.profiles?.prenom} {activeConv.profiles?.nom}</p>
                      <p className="text-xs text-gray-400 line-clamp-1">{activeConv.ads?.title}</p>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages.length === 0 && (
                      <div className="text-center py-8 text-gray-400 text-sm">Démarrez la conversation</div>
                    )}
                    {messages.map(msg => (
                      <div key={msg.id} className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm ${msg.sender_id === user.id ? 'bg-orange-500 text-white rounded-br-sm' : 'bg-gray-100 text-dark rounded-bl-sm'}`}>
                          {msg.content}
                          <div className={`text-xs mt-1 opacity-60`}>
                            {new Date(msg.created_at).toLocaleTimeString('fr', {hour:'2-digit', minute:'2-digit'})}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={bottomRef} />
                  </div>

                  {/* Input */}
                  <form onSubmit={sendMessage} className="p-4 border-t border-gray-100 flex gap-3">
                    <input type="text" value={newMsg} onChange={e => setNewMsg(e.target.value)}
                      placeholder="Votre message..."
                      className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
                    <button type="submit" disabled={!newMsg.trim() || sending}
                      className="btn-primary px-4 disabled:opacity-50 disabled:cursor-not-allowed">
                      <Send size={16} />
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                  <MessageCircle size={56} className="text-gray-200 mb-4" />
                  <h3 className="font-semibold text-dark mb-2">Sélectionnez une conversation</h3>
                  <p className="text-sm text-gray-500">Choisissez une conversation à gauche pour commencer</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
