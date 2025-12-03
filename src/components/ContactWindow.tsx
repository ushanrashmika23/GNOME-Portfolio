import { Mail, Github, Linkedin, BookOpen, Send, Check } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ContactWindowProps {
  theme: 'dark' | 'light';
}

export default function ContactWindow({ theme }: ContactWindowProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Reset button to normal state after 2 seconds when success
  useEffect(() => {
    if (submitStatus === 'success') {
      const timer = setTimeout(() => {
        setSubmitStatus('idle');
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [submitStatus]);

  const socialLinks = [
    {
      name: 'Email',
      icon: Mail,
      value: 'ushanrashmika23@gmail.com',
      link: 'mailto:ushanrashmika23@gmail.com',
      color: '#EA4335',
    },
    {
      name: 'GitHub',
      icon: Github,
      value: '@ushanrashmika23',
      link: 'https://github.com/ushanrashmika23',
      color: '#181717',
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      value: '@ushanrashmika23',
      link: 'https://linkedin.com/in/ushanrashmika23',
      color: '#0077B5',
    },
    {
      name: 'Journal',
      icon: BookOpen,
      value: 'Read My Journal',
      link: 'https://developer-journal.vercel.app/',
      color: '#8B5CF6',
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      alert('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Send email via API
      const response = await fetch('https://dev-journal-backend.vercel.app/email/sendPFmsg', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: formData.message,
        }),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', message: '' });
      } else {
        throw new Error('Failed to send message');
      }

    } catch (error) {
      console.error('Error sending message:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-[550px] sm:w-[550px] p-4 sm:p-8">
      <h2 className={`text-lg sm:text-xl mb-4 sm:mb-6 font-['JetBrains_Mono'] ${theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
        Get In Touch
      </h2>

      <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-6 sm:mb-8">
        {socialLinks.map((social) => {
          const Icon = social.icon;
          return (
            <a
              key={social.name}
              href={social.link}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-3 p-4 rounded-lg border transition-all group ${theme === 'dark'
                  ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                }`}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110"
                style={{ backgroundColor: social.color }}
              >
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-xs font-['JetBrains_Mono'] ${theme === 'dark' ? 'text-white/60' : 'text-gray-500'
                  }`}>
                  {social.name}
                </div>
                <div className={`text-sm font-['JetBrains_Mono'] truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                  {social.value}
                </div>
              </div>
            </a>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={`block text-sm font-['JetBrains_Mono'] mb-2 ${theme === 'dark' ? 'text-white/80' : 'text-gray-700'
            }`}>
            Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={`w-full px-4 py-2 rounded-lg border font-['JetBrains_Mono'] text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#3584e4] ${theme === 'dark'
                ? 'bg-white/5 border-white/10 text-white placeholder-white/40'
                : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
              }`}
            placeholder="Your name"
          />
        </div>

        <div>
          <label className={`block text-sm font-['JetBrains_Mono'] mb-2 ${theme === 'dark' ? 'text-white/80' : 'text-gray-700'
            }`}>
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className={`w-full px-4 py-2 rounded-lg border font-['JetBrains_Mono'] text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#3584e4] ${theme === 'dark'
                ? 'bg-white/5 border-white/10 text-white placeholder-white/40'
                : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
              }`}
            placeholder="your@email.com"
          />
        </div>

        <div>
          <label className={`block text-sm font-['JetBrains_Mono'] mb-2 ${theme === 'dark' ? 'text-white/80' : 'text-gray-700'
            }`}>
            Message
          </label>
          <textarea
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            rows={4}
            className={`w-full px-4 py-2 rounded-lg border font-['JetBrains_Mono'] text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#3584e4] resize-none ${theme === 'dark'
                ? 'bg-white/5 border-white/10 text-white placeholder-white/40'
                : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
              }`}
            placeholder="Tell me about your project..."
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3 rounded-lg font-['JetBrains_Mono'] transition-all flex items-center justify-center gap-2 group ${
            isSubmitting
              ? 'bg-gray-400 cursor-not-allowed text-white'
              : submitStatus === 'success'
              ? 'bg-green-500 text-white'
              : 'bg-[#3584e4] hover:bg-[#2f73c5] text-white'
            }`}
        >
          {submitStatus === 'success' ? (
            <Check className="w-4 h-4" />
          ) : (
            <Send className={`w-4 h-4 transition-transform ${
              isSubmitting ? '' : 'group-hover:translate-x-1'
            }`} />
          )}
          {submitStatus === 'success' 
            ? 'Sent' 
            : isSubmitting 
            ? 'Sending...' 
            : 'Send Message'}
        </button>

        {/* Status Messages */}
        {/* {submitStatus === 'success' && (
          <div className={`mt-4 p-3 rounded-lg text-sm font-['JetBrains_Mono'] ${theme === 'dark'
              ? 'bg-green-900/30 border border-green-700 text-green-400'
              : 'bg-green-100 border border-green-300 text-green-700'
            }`}>
            ✅ Message sent successfully! I'll get back to you soon.
          </div>
        )} */}

        {/* {submitStatus === 'error' && (
          <div className={`mt-4 p-3 rounded-lg text-sm font-['JetBrains_Mono'] ${theme === 'dark'
              ? 'bg-red-900/30 border border-red-700 text-red-400'
              : 'bg-red-100 border border-red-300 text-red-700'
            }`}>
            ❌ Failed to send message. Please check your internet connection or contact me directly at ushanrashmika23@gmail.com
          </div>
        )} */}
      </form>
    </div>
  );
}