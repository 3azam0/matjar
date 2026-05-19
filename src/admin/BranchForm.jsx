import {
  Create,
  Edit,
  SimpleForm,
  TextInput,
  ArrayInput,
  SimpleFormIterator,
  useRecordContext,
} from 'react-admin';
import { AdminFormToolbar } from './AdminFormToolbar.jsx';

const BranchTitle = () => {
  const record = useRecordContext();
  return record ? <span>الفرع: {record.name}</span> : null;
};

function generateBranchId(name) {
  const clean = (name || 'branch')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase()
    .trim();
  return `${clean || 'branch'}-${Date.now()}`;
}

function normalizePhoneTel(phone, phoneTel) {
  const trimmedPhoneTel = (phoneTel || '').trim();
  if (trimmedPhoneTel) return trimmedPhoneTel;

  const digits = (phone || '').replace(/\D/g, '');
  if (digits.startsWith('0')) return `+2${digits}`;
  if (digits.startsWith('20')) return `+${digits}`;
  return digits ? `+${digits}` : '';
}

function cleanBranchValues(values, includeGeneratedId = false) {
  const mobile1 = (values.mobile_1 || '').trim();
  const phone = (values.phone || '').trim() || mobile1;

  return {
    id: includeGeneratedId
      ? (values.id && values.id.trim() ? values.id.trim() : generateBranchId(values.name))
      : values.id,
    name: (values.name || '').trim(),
    phone,
    phone_tel: normalizePhoneTel(phone, values.phone_tel),
    mobile_1: mobile1,
    mobile_2: (values.mobile_2 || '').trim(),
    landline: (values.landline || '').trim(),
    address_lines: Array.isArray(values.address_lines) ? values.address_lines.filter(Boolean) : [],
    map_query: (values.map_query || '').trim(),
    order_index: values.order_index ? parseInt(values.order_index, 10) : 0,
  };
}

const MapPreview = () => {
  const record = useRecordContext();
  const mapQuery = record?.map_query;
  
  if (!mapQuery) return null;
  
  const encodedQuery = encodeURIComponent(mapQuery);
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedQuery}`;
  
  return (
    <div style={{ marginTop: '0.5rem' }}>
      <a
        href={googleMapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 1rem',
          background: '#4285f4',
          color: '#fff',
          textDecoration: 'none',
          borderRadius: '4px',
          fontSize: '0.875rem',
        }}
      >
        عرض في خرائط جوجل ↗
      </a>
    </div>
  );
};

const BranchFormFields = () => (
  <SimpleForm toolbar={<AdminFormToolbar />}>
    <TextInput 
      source="name" 
      label="اسم الفرع" 
      fullWidth 
      isRequired 
      validate={(value) => {
        if (!value) return 'مطلوب';
        if (value.length < 3) return 'يجب أن يكون الاسم 3 أحرف على الأقل';
        return undefined;
      }}
    />
    <TextInput 
      source="mobile_1" 
      label="رقم الموبايل الأول" 
      fullWidth 
      helperText="مثال: 01121030583" 
      isRequired
      validate={(value) => {
        if (!value) return 'مطلوب';
        if (!/^\d{8,15}$/.test(value.replace(/\s/g, ''))) return 'رقم الهاتف غير صحيح (8-15 رقم)';
        return undefined;
      }}
    />
    <TextInput 
      source="mobile_2" 
      label="رقم الموبايل الثاني (اختياري)" 
      fullWidth 
      helperText="مثال: 01223456789" 
      validate={(value) => {
        if (value && !/^\d{8,15}$/.test(value.replace(/\s/g, ''))) return 'رقم الهاتف غير صحيح (8-15 رقم)';
        return undefined;
      }}
    />
    <TextInput 
      source="landline" 
      label="الهاتف الأرضي (اختياري)" 
      fullWidth 
      helperText="مثال: 0225901234" 
      validate={(value) => {
        if (value && !/^\d{7,15}$/.test(value.replace(/\s/g, ''))) return 'رقم الهاتف الأرضي غير صحيح (7-15 رقم)';
        return undefined;
      }}
    />
    <TextInput 
      source="phone" 
      label="رقم الهاتف الاحتياطي/القديم (اختياري)" 
      fullWidth 
      helperText="تلقائياً يتطابق مع الموبايل الأول في حال تركه فارغاً" 
    />
    <TextInput 
      source="phone_tel" 
      label="رقم الاتصال الدولي الاحتياطي (اختياري)" 
      fullWidth 
      helperText="مثال: +201121030583"
    />
    <ArrayInput source="address_lines" label="عنوان الفرع (سطراً سطراً)">
      <SimpleFormIterator>
        <TextInput source="" label="سطر العنوان" fullWidth />
      </SimpleFormIterator>
    </ArrayInput>
    <TextInput 
      source="map_query" 
      label="نص البحث في الخريطة" 
      fullWidth 
      helperText="مثال: ٤٢ شارع الموسكي الاول، القاهرة، مصر"
      validate={(value) => {
        if (value && value.length < 5) return 'يجب أن يكون نص البحث 5 أحرف على الأقل';
        return undefined;
      }}
    />
    <MapPreview />
    <TextInput 
      source="order_index" 
      label="ترتيب العرض" 
      fullWidth 
      type="number"
      validate={(value) => {
        if (value && (isNaN(value) || value < 0)) return 'يجب أن يكون رقماً موجباً';
        return undefined;
      }}
    />
  </SimpleForm>
);

export function BranchCreate() {
  return (
    <Create
      title="إضافة فرع جديد"
      redirect="list"
      transform={(values) => cleanBranchValues(values, true)}
      mutationMode="pessimistic"
    >
      <BranchFormFields />
    </Create>
  );
}

export function BranchEdit() {
  return (
    <Edit
      title={<BranchTitle />}
      redirect="list"
      transform={(values) => cleanBranchValues(values)}
      mutationMode="pessimistic"
      mutationOptions={{ meta: { returning: 'representation' } }}
    >
      <BranchFormFields />
    </Edit>
  );
}
