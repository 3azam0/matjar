import { useQueryClient } from '@tanstack/react-query';
import {
  Create,
  SimpleForm,
  TextInput,
  SelectInput,
  useGetList,
  useNotify,
  useRedirect,
  useDataProvider,
  required,
  minLength,
  Toolbar,
  SaveButton,
  ListButton,
  BooleanInput,
} from 'react-admin';
import { useFormContext } from 'react-hook-form';
import { ImageUploadInput } from './ImageUploadInput';
import { normalizeProductImages } from './normalizeProductImages';
import { productOrderIndexNow } from '../lib/productSort.js';

const validateProductTitle = [required('عنوان المنتج مطلوب'), minLength(3, 'يجب أن يكون العنوان 3 أحرف على الأقل')];
const validateCategory = [required('التصنيف مطلوب')];
const validateProductImages = [
  (value) => {
    const count = normalizeProductImages(value).length;
    if (count === 0) return 'يجب إضافة صورة واحدة على الأقل';
    return undefined;
  },
];

export function buildProductRecord(values) {
  return {
    ...values,
    name: (values.name || '').trim(),
    description: (values.description || '').trim(),
    note: (values.note || '').trim(),
    images: normalizeProductImages(values.images),
    is_visible: values.is_visible !== false,
    order_index: productOrderIndexNow(),
    id:
      values.id && String(values.id).trim()
        ? String(values.id).trim()
        : generateProductId(values.name),
  };
}

function generateProductId(name) {
  const clean = (name || 'product')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase()
    .trim();
  return `${Date.now()}-${clean || 'product'}`;
}

function ProductCreateToolbar() {
  const notify = useNotify();
  const redirect = useRedirect();
  const dataProvider = useDataProvider();
  const queryClient = useQueryClient();
  const form = useFormContext();

  const handleSave = async (event) => {
    event?.preventDefault?.();
    event?.stopPropagation?.();

    const valid = await form.trigger();
    if (!valid) return;

    const record = buildProductRecord(form.getValues());

    try {
      const { data: created } = await dataProvider.create('products', {
        data: record,
        meta: { returning: 'representation' },
      });

      const saved = created?.id != null ? created : record;
      if (!saved?.id) {
        throw new Error('لم يُرجع الخادم معرف المنتج بعد الحفظ');
      }

      await queryClient.invalidateQueries({ queryKey: ['products'] });

      notify('تم حفظ المنتج بنجاح', { type: 'success' });
      redirect('list', 'products', saved.id, saved);
    } catch (error) {
      const message =
        typeof error === 'string'
          ? error
          : error?.message || 'فشل حفظ المنتج';
      notify(message, { type: 'error' });
    }
  };

  return (
    <Toolbar className="admin-form-toolbar">
      <div className="admin-form-toolbar__actions">
        <SaveButton label="حفظ" type="button" alwaysEnable={false} onClick={handleSave} className="admin-btn-save" />
        <ListButton label="العودة للقائمة" className="admin-btn-back" />
      </div>
    </Toolbar>
  );
}

function ProductCreateFields() {
  const { data: categories, isLoading } = useGetList('categories', {
    pagination: { page: 1, perPage: 100 },
    sort: { field: 'id', order: 'ASC' },
  });

  const categoryChoices = (categories || []).map((cat) => ({
    id: cat.id,
    name: cat.title,
  }));

  return (
    <SimpleForm toolbar={<ProductCreateToolbar />}>
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
}

export function ProductCreate() {
  return (
    <Create title="إضافة منتج جديد" redirect={false}>
      <ProductCreateFields />
    </Create>
  );
}
