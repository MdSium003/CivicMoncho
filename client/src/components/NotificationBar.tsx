import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Bell, Plus, Globe, MapPin, Check, Eye, Trash2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  titleBn: string;
  titleEn: string;
  messageBn: string;
  messageEn: string;
  targetType: 'thana' | 'countrywide';
  targetThana?: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationBarProps {
  isOpen: boolean;
  onClose: () => void;
}

// Notification creation form component
function CreateNotificationForm({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    titleBn: '',
    titleEn: '',
    messageBn: '',
    messageEn: '',
    targetType: 'countrywide' as 'thana' | 'countrywide',
    targetThana: '',
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error('Failed to create notification');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/admin'] });
      toast({
        title: t('বিজ্ঞপ্তি তৈরি হয়েছে', 'Notification created'),
        description: t('নতুন বিজ্ঞপ্তি সফলভাবে প্রকাশিত হয়েছে।', 'New notification has been published successfully.'),
      });
      onClose();
      setFormData({
        titleBn: '',
        titleEn: '',
        messageBn: '',
        messageEn: '',
        targetType: 'countrywide',
        targetThana: '',
      });
    },
    onError: (err: any) => {
      toast({
        title: t('ত্রুটি', 'Error'),
        description: err.message || t('বিজ্ঞপ্তি তৈরি ব্যর্থ', 'Failed to create notification'),
        variant: 'destructive',
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titleBn || !formData.titleEn || !formData.messageBn || !formData.messageEn) {
      toast({
        title: t('ত্রুটি', 'Error'),
        description: t('সব ক্ষেত্র পূরণ করুন', 'Please fill all fields'),
        variant: 'destructive',
      });
      return;
    }
    if (formData.targetType === 'thana' && !formData.targetThana) {
      toast({
        title: t('ত্রুটি', 'Error'),
        description: t('থানা নির্বাচন করুন', 'Please select a thana'),
        variant: 'destructive',
      });
      return;
    }
    createMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto z-[200]">
        <DialogHeader>
          <DialogTitle>{t('নতুন বিজ্ঞপ্তি তৈরি করুন', 'Create New Notification')}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="titleBn">{t('শিরোনাম (বাংলা)', 'Title (Bengali)')}</Label>
              <Input
                id="titleBn"
                value={formData.titleBn}
                onChange={(e) => setFormData(prev => ({ ...prev, titleBn: e.target.value }))}
                placeholder={t('বিজ্ঞপ্তির শিরোনাম লিখুন', 'Enter notification title')}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="titleEn">{t('শিরোনাম (ইংরেজি)', 'Title (English)')}</Label>
              <Input
                id="titleEn"
                value={formData.titleEn}
                onChange={(e) => setFormData(prev => ({ ...prev, titleEn: e.target.value }))}
                placeholder="Enter notification title"
                required
              />
            </div>
          </div>

          {/* Message Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="messageBn">{t('বার্তা (বাংলা)', 'Message (Bengali)')}</Label>
              <Textarea
                id="messageBn"
                value={formData.messageBn}
                onChange={(e) => setFormData(prev => ({ ...prev, messageBn: e.target.value }))}
                placeholder={t('বিজ্ঞপ্তির বিস্তারিত লিখুন', 'Enter notification details')}
                rows={4}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="messageEn">{t('বার্তা (ইংরেজি)', 'Message (English)')}</Label>
              <Textarea
                id="messageEn"
                value={formData.messageEn}
                onChange={(e) => setFormData(prev => ({ ...prev, messageEn: e.target.value }))}
                placeholder="Enter notification details"
                rows={4}
                required
              />
            </div>
          </div>

          {/* Target Type */}
          <div className="space-y-4">
            <Label>{t('লক্ষ্য এলাকা', 'Target Area')}</Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="countrywide"
                  checked={formData.targetType === 'countrywide'}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setFormData(prev => ({ ...prev, targetType: 'countrywide', targetThana: '' }));
                    }
                  }}
                />
                <Label htmlFor="countrywide" className="flex items-center space-x-2">
                  <Globe className="w-4 h-4" />
                  <span>{t('সারা দেশব্যাপী', 'Countrywide')}</span>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="thana"
                  checked={formData.targetType === 'thana'}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setFormData(prev => ({ ...prev, targetType: 'thana' }));
                    }
                  }}
                />
                <Label htmlFor="thana" className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>{t('নির্দিষ্ট থানা', 'Specific Thana')}</span>
                </Label>
              </div>
            </div>

            {/* Thana Input */}
            {formData.targetType === 'thana' && (
              <div className="space-y-2">
                <Label htmlFor="targetThana">{t('থানার নাম লিখুন', 'Enter Thana Name')}</Label>
                <Input
                  id="targetThana"
                  type="text"
                  value={formData.targetThana}
                  onChange={(e) => setFormData(prev => ({ ...prev, targetThana: e.target.value }))}
                  placeholder={t('থানার নাম লিখুন', 'Enter thana name')}
                  required
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t('বাতিল', 'Cancel')}
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? t('তৈরি হচ্ছে...', 'Creating...') : t('বিজ্ঞপ্তি প্রকাশ করুন', 'Publish Notification')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function NotificationBar({ isOpen, onClose }: NotificationBarProps) {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [userRole, setUserRole] = useState<'citizen' | 'governmental' | null>(null);

  // Check user role
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (res.ok) {
          const me = await res.json();
          if (!cancelled) setUserRole(me.role);
        }
      } catch {}
    })();
    return () => { cancelled = true; };
  }, []);

  // Fetch notifications based on user role
  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ['/api/notifications'],
    enabled: isOpen && userRole !== null,
  });

  // Mark notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const res = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST',
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to mark as read');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    }
  });

  // Mark all as read
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/notifications/read-all', {
        method: 'POST',
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to mark all as read');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      toast({
        title: t('সফল', 'Success'),
        description: t('সব বিজ্ঞপ্তি পঠিত হিসেবে চিহ্নিত হয়েছে', 'All notifications marked as read'),
      });
    }
  });

  // Deactivate notification (government only)
  const deactivateMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const res = await fetch(`/api/notifications/${notificationId}/deactivate`, {
        method: 'PATCH',
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to deactivate');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/admin'] });
      toast({
        title: t('সফল', 'Success'),
        description: t('বিজ্ঞপ্তি নিষ্ক্রিয় করা হয়েছে', 'Notification deactivated'),
      });
    }
  });

  const handleMarkAsRead = (notificationId: string) => {
    markAsReadMutation.mutate(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const handleDeactivate = (notificationId: string) => {
    deactivateMutation.mutate(notificationId);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return t('এখনই', 'Just now');
    if (diffInMinutes < 60) return t(`${diffInMinutes} মিনিট আগে`, `${diffInMinutes}m ago`);
    if (diffInMinutes < 1440) return t(`${Math.floor(diffInMinutes / 60)} ঘন্টা আগে`, `${Math.floor(diffInMinutes / 60)}h ago`);
    return t(`${Math.floor(diffInMinutes / 1440)} দিন আগে`, `${Math.floor(diffInMinutes / 1440)}d ago`);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <>
    <div
      className={`fixed inset-0 z-[100] transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Notification Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-card text-card-foreground shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center space-x-2">
            <h2 className="text-lg font-semibold">{t("বিজ্ঞপ্তি", "Notifications")}</h2>
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </div>
            <div className="flex items-center space-x-2">
                {userRole === 'governmental' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsCreateFormOpen(true)}
                    title={t('নতুন বিজ্ঞপ্তি তৈরি করুন', 'Create new notification')}
                  >
                    <Plus className="h-4 w-4" />
                </Button>
                )}
                <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close notifications">
                  <X className="h-5 w-5" />
                </Button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-grow overflow-y-auto p-4 space-y-3">
              {isLoading ? (
                <div className="text-center text-muted-foreground py-10">
                  <p>{t("লোড হচ্ছে...", "Loading...")}</p>
                </div>
              ) : notifications.length > 0 ? (
              notifications.map(notification => (
                  <div 
                    key={notification.id} 
                    className={`flex items-start p-3 rounded-lg transition-colors hover:bg-muted ${
                      !notification.isRead ? 'bg-primary/10 border-l-4 border-l-primary' : ''
                    }`}
                  >
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-muted flex items-center justify-center mr-3">
                      {notification.targetType === 'countrywide' ? (
                        <Globe className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-grow min-w-0">
                          <h4 className="text-sm font-semibold text-card-foreground mb-1">
                            {language === 'bn' ? notification.titleBn : notification.titleEn}
                          </h4>
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-3">
                            {language === 'bn' ? notification.messageBn : notification.messageEn}
                          </p>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground">
                              {formatTime(notification.createdAt)}
                            </p>
                            <div className="flex items-center space-x-1">
                              {notification.targetType === 'thana' && (
                                <Badge variant="outline" className="text-xs">
                                  {notification.targetThana}
                                </Badge>
                              )}
                              {notification.targetType === 'countrywide' && (
                                <Badge variant="secondary" className="text-xs">
                                  {t('সারা দেশ', 'Countrywide')}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 ml-2">
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="h-6 w-6"
                              title={t('পঠিত হিসেবে চিহ্নিত করুন', 'Mark as read')}
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          )}
                          {userRole === 'governmental' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeactivate(notification.id)}
                              className="h-6 w-6 text-destructive hover:text-destructive"
                              title={t('নিষ্ক্রিয় করুন', 'Deactivate')}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-10">
                  <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t("আপনার কোন বিজ্ঞপ্তি নেই", "You have no notifications")}</p>
              </div>
            )}
          </div>
          
          {/* Footer */}
            {notifications.length > 0 && unreadCount > 0 && (
             <div className="p-4 border-t border-border">
                <Button 
                  className="w-full" 
                  onClick={handleMarkAllAsRead}
                  disabled={markAllAsReadMutation.isPending}
                >
                  {markAllAsReadMutation.isPending 
                    ? t("প্রক্রিয়াকরণ...", "Processing...") 
                    : t("সবগুলো পঠিত হিসেবে চিহ্নিত করুন", "Mark all as read")
                  }
                </Button>
             </div>
          )}
        </div>
      </div>
    </div>

      {/* Create Notification Form */}
      <CreateNotificationForm 
        isOpen={isCreateFormOpen} 
        onClose={() => setIsCreateFormOpen(false)} 
      />
    </>
  );
}