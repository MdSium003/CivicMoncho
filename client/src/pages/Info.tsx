import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Send, Bot, User } from 'lucide-react';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

export default function InfoPage() {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  //useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    // Initial bot message
    setMessages([
      { sender: 'bot', text: t('হ্যালো! আমি সিভিকমঞ্চের সহায়ক। আপনার যা কিছু জানার আছে, আমাকে জিজ্ঞাসা করতে পারেন।', 'Hello! I am the CivicMoncho assistant. You can ask me anything you need to know.') }
    ]);
  }, [t]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const apiKey = "AIzaSyDsx1urYO77n-G52IBKaE_Td2O7uLbyK84"; // Kept empty as per instructions
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

      const systemPrompt = "You are a helpful AI assistant for a platform called 'CivicMoncho' in Bangladesh. Your goal is to provide useful, concise, and friendly information about civic services, community projects, local events, and general knowledge relevant to a citizen of Bangladesh. Always answer in the language of the user's query (Bangla or English).";
      
      const payload = {
        contents: [{ parts: [{ text: input }] }],
        systemInstruction: {
            parts: [{ text: systemPrompt }]
        },
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const result = await response.json();
      const botResponseText = result.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (botResponseText) {
        const botMessage: Message = { sender: 'bot', text: botResponseText };
        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error("No response text from API.");
      }

    } catch (error) {
      console.error("Failed to fetch from Gemini API:", error);
      const errorMessage: Message = { sender: 'bot', text: t('দুঃখিত, আমি এই মুহূর্তে উত্তর দিতে পারছি না। অনুগ্রহ করে একটু পরে আবার চেষ্টা করুন।', 'Sorry, I am unable to respond at the moment. Please try again later.') };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex-1 py-16 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t("তথ্য কেন্দ্র", "Information Desk")}
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            {t("আপনার প্রশ্ন জিজ্ঞাসা করুন এবং আমাদের AI সহকারীর কাছ থেকে তাৎক্ষণিক উত্তর পান।", "Ask your questions and get instant answers from our AI assistant.")}
          </p>
        </div>

        <Card className="w-full max-w-2xl mx-auto animate-fade-in shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="text-primary" />
              {t("AI সহকারী", "AI Assistant")}
            </CardTitle>
            <CardDescription>{t('আমি আপনাকে সাহায্য করার জন্য এখানে আছি।', "I'm here to help you.")}</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px] overflow-y-auto p-4 border-t border-b">
            <div className="space-y-4">
              {messages.map((msg, index) => (
                <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                  {msg.sender === 'bot' && <div className="bg-primary text-primary-foreground rounded-full p-2"><Bot size={20}/></div>}
                  <div className={`rounded-lg px-4 py-2 max-w-[80%] ${msg.sender === 'user' ? 'bg-muted' : 'bg-primary/10'}`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                  </div>
                   {msg.sender === 'user' && <div className="bg-muted rounded-full p-2"><User size={20}/></div>}
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start gap-3">
                   <div className="bg-primary text-primary-foreground rounded-full p-2"><Bot size={20}/></div>
                  <div className="rounded-lg px-4 py-2 bg-primary/10">
                    <div className="flex items-center space-x-1">
                        <span className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="h-2 w-2 bg-primary rounded-full animate-bounce"></span>
                    </div>
                  </div>
                </div>
              )}
               <div ref={messagesEndRef} />
            </div>
          </CardContent>
          <CardFooter className="p-4">
            <form onSubmit={handleSendMessage} className="flex w-full items-center space-x-2">
              <Input
                type="text"
                placeholder={t("আপনার প্রশ্ন এখানে লিখুন...", "Type your question here...")}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}

