import { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { useNotification } from '../lib/NotificationContext';
import { api } from '../services/api';

// Simple text sanitization to prevent script/HTML injection
function sanitizeInput(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/<[^>]*>/g, '') // Strip HTML tags
    .replace(/[&<>"'/]/g, (m) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;'
    })[m])
    .trim();
}

export function ContactForm() {
  const { showSuccess, showWarning, showError } = useNotification();
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Client-side Rate Limiting (anti-spam check: 60s cooldown)
    const lastSubmitTime = localStorage.getItem('last_inquiry_submit');
    const now = Date.now();
    if (lastSubmitTime && now - parseInt(lastSubmitTime, 10) < 60000) {
      const waitSeconds = Math.ceil((60000 - (now - parseInt(lastSubmitTime, 10))) / 1000);
      showWarning(`من فضلكِ انتظري ${waitSeconds} ثانية قبل إرسال رسالة أخرى.`);
      return;
    }

    // 2. Validate Inputs
    const cleanName = sanitizeInput(formData.name);
    const cleanPhone = sanitizeInput(formData.phone);
    const cleanEmail = sanitizeInput(formData.email);
    const cleanMessage = sanitizeInput(formData.message);

    if (!cleanName || !cleanPhone || !cleanMessage) {
      showWarning('يرجى ملء جميع الحقول المطلوبة.');
      return;
    }

    // Basic phone validation
    const phoneDigits = cleanPhone.replace(/[^\d+]/g, '');
    if (phoneDigits.length < 7) {
      showWarning('يرجى إدخال رقم هاتف صحيح.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 3. Submit to database via API
      await api.submitInquiry({
        name: cleanName,
        phone: cleanPhone,
        email: cleanEmail,
        message: cleanMessage,
      });

      // 4. Save submission timestamp for rate limiting
      localStorage.setItem('last_inquiry_submit', String(Date.now()));

      // 5. Feedback & Reset
      showSuccess('تم إرسال استفساركِ بنجاح! سنتواصل معكِ قريباً.');
      setFormData({ name: '', phone: '', email: '', message: '' });
    } catch (err) {
      console.error('Failed to submit inquiry:', err);
      showError('تعذر إرسال الرسالة، يرجى المحاولة مرة أخرى لاحقاً.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <article className="contact-card">
      <div className="contact-intro">
        <p>يسعدنا الرد على جميع استفساراتك وأسئلتك. املئي النموذج وسنتواصل معكِ في أقرب وقت.</p>
      </div>

      <form className="contact-form" onSubmit={handleSubmit}>
        <div className="form-group-row">
          <div className="form-group">
            <label className="form-label" htmlFor="contact-name">
              الاسم الكامل <span>*</span>
            </label>
            <input
              type="text"
              id="contact-name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="اكتبي اسمكِ هنا"
              className="form-input"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="contact-phone">
              رقم الهاتف <span>*</span>
            </label>
            <input
              type="tel"
              id="contact-phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="مثال: 01000000000"
              className="form-input"
              required
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="contact-email">
            البريد الإلكتروني (اختياري)
          </label>
          <input
            type="email"
            id="contact-email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="example@domain.com"
            className="form-input"
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="contact-message">
            الرسالة <span>*</span>
          </label>
          <textarea
            id="contact-message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="اكتبي رسالتكِ أو استفساركِ بالتفصيل هنا..."
            className="form-textarea"
            required
            disabled={isSubmitting}
          />
        </div>

        <button
          type="submit"
          className="contact-submit-btn"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" />
              <span>جاري الإرسال...</span>
            </>
          ) : (
            <>
              <Send />
              <span>إرسال الاستفسار</span>
            </>
          )}
        </button>
      </form>
    </article>
  );
}
