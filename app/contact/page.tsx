'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Mail, MapPin, Phone, Send, Loader2 } from 'lucide-react';

import { PublicHeader } from '@/components/public/public-header';
import { PublicFooter } from '@/components/public/public-footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      toast.error('Please fill all fields.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setName('');
      setEmail('');
      setMessage('');
      toast.success('Thank you! We will get back to you soon.');
    }, 700);
  };

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Contact CropWise</h1>
          <p className="mt-4 text-muted-foreground">Questions, feedback, or partnership inquiries — we&apos;d love to hear from you.</p>
        </div>
        <div className="mx-auto mt-12 grid max-w-4xl gap-8 md:grid-cols-3">
          <Card className="text-center">
            <CardContent className="p-6">
              <Mail className="mx-auto mb-2 text-primary" size={22} />
              <p className="text-sm font-medium text-foreground">Email</p>
              <p className="text-sm text-muted-foreground">hello@cropwise.example</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <Phone className="mx-auto mb-2 text-primary" size={22} />
              <p className="text-sm font-medium text-foreground">Phone</p>
              <p className="text-sm text-muted-foreground">1800-123-456 (toll free)</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <MapPin className="mx-auto mb-2 text-primary" size={22} />
              <p className="text-sm font-medium text-foreground">Office</p>
              <p className="text-sm text-muted-foreground">Coimbatore, Tamil Nadu, India</p>
            </CardContent>
          </Card>
        </div>
        <Card className="mx-auto mt-10 max-w-xl">
          <CardHeader>
            <CardTitle>Send us a message</CardTitle>
            <CardDescription>We typically reply within 2 business days.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" rows={5} value={message} onChange={(e) => setMessage(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full gap-2" disabled={loading}>
                {loading ? <Loader2 size={18} className="animate-spin" /> : <>Send message <Send size={16} /></>}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      <PublicFooter />
    </div>
  );
}
