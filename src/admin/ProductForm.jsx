import {
  Edit,
  SimpleForm,
  TextInput,
  SelectInput,
  BooleanInput,
  useRecordContext,
  useGetList,
  required,
  minLength,
} from 'react-admin';
import { ImageUploadInput } from './ImageUploadInput';
import { normalizeProductImages } from './normalizeProductImages';
import { AdminFormToolbar } from './AdminFormToolbar.jsx';

const validateProductTitle = [required('عنوان المنتج مطلوب'), minLength(3, 'يجب أن يكون العنوان 3 أحرف على الأقل')];
const validateCategory = [required('التصنيف مطلوب')];
const validateProductImages = [
  (value) => {
    const count = normalizeProductImages(value).length;
    if (count === 0) return 'يجب إضافة صورة واحدة على الأقل';
    return undefined;
  },
];

const ProductTitle = () => {
  const record = useRecordContext();
  return record ? <span>المنتج: {record.name}</span> : null;
};

const ProductFormFields = ({ toolbar = <AdminFormToolbar /> }) => {
  const { data: categories, isLoading } = useGetList('categories', {
    pagination: { page: 1, perPage: 100 },
    sort: { field: 'id', order: 'ASC' },
  });

  const categoryChoices = (categories || []).map((cat) => ({
    id: cat.id,
    name: cat.title,
  }));

  return (
    <SimpleForm toolbar={toolbar}>
      <TextInput
        source="name"
        label="عنوان المنتج"
        fullWidth
        isRequired
        validate={validateProductTitle}
      />
      <TextInput
        source="description"
        label="وصف المنتج"
        multiline
        fullWidth
        validate={(value) => {
          if (value && value.length < 10) return 'يجب أن يكون الوصف 10 أحرف على الأقل';
          return undefined;
        }}
      />
      <TextInput
        source="note"
        label="ملاحظة"
        fullWidth
        helperText="مثال: تطريز ذهبي — متوفر مقاسات S إلى XXL"
      />
      <BooleanInput
        source="is_visible"
        label="عرض المنتج في الكتالوج"
        defaultValue={true}
      />
      <SelectInput
        source="category_id"
        label="التصنيف"
        choices={categoryChoices}
        isLoading={isLoading}
        fullWidth
        isRequired
        validate={validateCategory}
      />
      <ImageUploadInput
        source="images"
        label="صور المنتج"
        defaultValue={[]}
        isRequired
        validate={validateProductImages}
      />
    </SimpleForm>
  );
};

export function ProductEdit() {
  return (
    <Edit
      title={<ProductTitle />}
      redirect="list"
      transform={(values) => ({
        ...values,
        name: (values.name || '').trim(),
        description: (values.description || '').trim(),
        note: (values.note || '').trim(),
        images: normalizeProductImages(values.images),
      })}
    >
      <ProductFormFields toolbar={<AdminFormToolbar showDelete />} />
    </Edit>
  );
}