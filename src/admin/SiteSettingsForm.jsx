import { Edit, SimpleForm, TextInput, NumberInput, useRecordContext } from 'react-admin';
import { AdminFormToolbar } from './AdminFormToolbar.jsx';
import { HeroImageUploadInput } from './HeroImageUploadInput.jsx';

const SiteSettingsTitle = () => {
  const record = useRecordContext();
  return record ? <span>إعدادات الموقع</span> : null;
};

const SiteSettingsFormFields = () => (
  <SimpleForm toolbar={<AdminFormToolbar backLabel="العودة للإعدادات" />}>
    <TextInput 
      source="site_name" 
      label="اسم الموقع" 
      fullWidth 
      isRequired 
      validate={(value) => {
        if (!value) return 'مطلوب';
        if (value.length < 3) return 'يجب أن يكون الاسم 3 أحرف على الأقل';
        return undefined;
      }}
    />
    <TextInput 
      source="site_description" 
      label="وصف الموقع" 
      multiline 
      fullWidth
      validate={(value) => {
        if (value && value.length < 10) return 'يجب أن يكون الوصف 10 أحرف على الأقل';
        return undefined;
      }}
    />
    <TextInput 
      source="contact_email" 
      label="البريد الإلكتروني للتواصل" 
      fullWidth 
      type="email"
      validate={(value) => {
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'البريد الإلكتروني غير صحيح';
        }
        return undefined;
      }}
    />
    <TextInput 
      source="contact_phone" 
      label="رقم الهاتف للتواصل" 
      fullWidth
      validate={(value) => {
        if (value && !/^\d{8,15}$/.test(value.replace(/\s/g, ''))) {
          return 'رقم الهاتف غير صحيح (8-15 رقم)';
        }
        return undefined;
      }}
    />
    <TextInput 
      source="social_facebook" 
      label="رابط فيسبوك" 
      fullWidth
      validate={(value) => {
        if (value && !/^https?:\/\/.+/i.test(value)) {
          return 'الرابط يجب أن يبدأ بـ http:// أو https://';
        }
        return undefined;
      }}
    />
    <TextInput 
      source="social_instagram" 
      label="رابط إنستغرام" 
      fullWidth
      validate={(value) => {
        if (value && !/^https?:\/\/.+/i.test(value)) {
          return 'الرابط يجب أن يبدأ بـ http:// أو https://';
        }
        return undefined;
      }}
    />
    <TextInput 
      source="social_whatsapp" 
      label="رابط واتساب" 
      fullWidth
      validate={(value) => {
        if (value && !/^https?:\/\/.+/i.test(value)) {
          return 'الرابط يجب أن يبدأ بـ http:// أو https://';
        }
        return undefined;
      }}
    />
    <HeroImageUploadInput source="hero_images" label="صور الهيرو (حتى 3)" />
    <NumberInput 
      source="products_per_page" 
      label="عدد المنتجات في الصفحة" 
      fullWidth 
      defaultValue={12}
      validate={(value) => {
        if (!value || value < 1) return 'يجب أن يكون رقماً موجباً';
        if (value > 100) return 'الحد الأقصى هو 100 منتج في الصفحة';
        return undefined;
      }}
    />
    <TextInput 
      source="hours_weekday" 
      label="مواعيد العمل (طوال الأسبوع)" 
      fullWidth
    />
    <TextInput 
      source="hours_friday" 
      label="مواعيد العمل (الأيام الاستثنائية/الأحد)" 
      fullWidth
    />
  </SimpleForm>
);

export function SiteSettingsEdit() {
  return (
    <Edit title={<SiteSettingsTitle />} redirect={false}>
      <SiteSettingsFormFields />
    </Edit>
  );
}
