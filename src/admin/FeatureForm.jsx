import { Create, Edit, SimpleForm, TextInput, useRecordContext } from 'react-admin';
import { AdminFormToolbar } from './AdminFormToolbar.jsx';

const FeatureTitle = () => {
  const record = useRecordContext();
  return record ? <span>الميزة: {record.title}</span> : null;
};

const FeatureFormFields = () => (
  <SimpleForm toolbar={<AdminFormToolbar />}>
    <TextInput 
      source="title" 
      label="عنوان الميزة" 
      fullWidth 
      isRequired 
      validate={(value) => {
        if (!value) return 'مطلوب';
        if (value.length < 3) return 'يجب أن يكون العنوان 3 أحرف على الأقل';
        return undefined;
      }}
    />
    <TextInput 
      source="description" 
      label="وصف الميزة" 
      multiline 
      fullWidth
      validate={(value) => {
        if (value && value.length < 10) return 'يجب أن يكون الوصف 10 أحرف على الأقل';
        return undefined;
      }}
    />
    <TextInput 
      source="icon" 
      label="اسم الأيقونة (اختياري)" 
      fullWidth 
      helperText="مثال: star, heart, check"
      validate={(value) => {
        if (value && value.length < 2) return 'يجب أن يكون اسم الأيقونة حرفين على الأقل';
        return undefined;
      }}
    />
  </SimpleForm>
);

function generateFeatureId(title) {
  const clean = (title || 'feature')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase()
    .trim();
  return `${clean || 'feature'}-${Date.now()}`;
}

export function FeatureCreate() {
  return (
    <Create
      title="إضافة ميزة جديدة"
      redirect="list"
      transform={(values) => ({
        ...values,
        title: (values.title || '').trim(),
        description: (values.description || '').trim(),
        icon: (values.icon || '').trim(),
        id: generateFeatureId(values.title),
      })}
    >
      <FeatureFormFields />
    </Create>
  );
}

export function FeatureEdit() {
  return (
    <Edit title={<FeatureTitle />} redirect="list">
      <FeatureFormFields />
    </Edit>
  );
}
