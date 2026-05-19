import { Create, Edit, SimpleForm, TextInput, useRecordContext } from 'react-admin';
import { AdminFormToolbar } from './AdminFormToolbar.jsx';

const CategoryTitle = () => {
  const record = useRecordContext();
  return record ? <span>التصنيف: {record.title}</span> : null;
};

const CategoryFormFields = () => (
  <SimpleForm toolbar={<AdminFormToolbar />}>
    <TextInput 
      source="title" 
      label="اسم التصنيف" 
      fullWidth 
      isRequired 
      validate={(value) => {
        if (!value) return 'مطلوب';
        if (value.length < 3) return 'يجب أن يكون الاسم 3 أحرف على الأقل';
        return undefined;
      }}
    />
    <TextInput 
      source="description" 
      label="وصف التصنيف" 
      multiline 
      fullWidth
      validate={(value) => {
        if (value && value.length < 10) return 'يجب أن يكون الوصف 10 أحرف على الأقل';
        return undefined;
      }}
    />
  </SimpleForm>
);

function generateCategoryId(title) {
  const clean = (title || 'category')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase()
    .trim();
  return `${clean || 'category'}-${Date.now()}`;
}

export function CategoryCreate() {
  return (
    <Create
      title="إضافة تصنيف جديد"
      redirect="list"
      transform={(values) => ({
        ...values,
        title: (values.title || '').trim(),
        description: (values.description || '').trim(),
        id: generateCategoryId(values.title),
      })}
    >
      <CategoryFormFields />
    </Create>
  );
}

export function CategoryEdit() {
  return (
    <Edit title={<CategoryTitle />} redirect="list">
      <CategoryFormFields />
    </Edit>
  );
}