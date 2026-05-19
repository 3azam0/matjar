import {
  Create,
  Edit,
  ReferenceInput,
  SelectInput,
  SimpleForm,
  TextInput,
  useRecordContext,
} from 'react-admin';
import { AdminFormToolbar } from './AdminFormToolbar.jsx';

const linkTypeChoices = [
  { id: 'whatsapp', name: 'واتساب' },
  { id: 'instagram', name: 'إنستغرام' },
  { id: 'facebook', name: 'فيسبوك' },
  { id: 'tiktok', name: 'تيك توك' },
];

const BranchLinkTitle = () => {
  const record = useRecordContext();
  return record ? <span>رابط: {record.label || record.type}</span> : null;
};

function generateBranchLinkId(branchId, type) {
  const cleanBranch = (branchId || 'branch').replace(/[^\w-]/g, '').toLowerCase();
  const cleanType = (type || 'link').replace(/[^\w-]/g, '').toLowerCase();
  return `link-${cleanBranch}-${cleanType}-${Date.now()}`;
}

const BranchLinkFormFields = () => (
  <SimpleForm toolbar={<AdminFormToolbar />}>
    <ReferenceInput source="branch_id" reference="branches" label="الفرع">
      <SelectInput optionText="name" fullWidth isRequired />
    </ReferenceInput>
    <SelectInput
      source="type"
      label="نوع الرابط"
      choices={linkTypeChoices}
      fullWidth
      isRequired
      validate={(value) => (value ? undefined : 'مطلوب')}
    />
    <TextInput
      source="label"
      label="النص الظاهر"
      fullWidth
      helperText="مثال: واتساب، إنستغرام، فيسبوك"
    />
    <TextInput
      source="href"
      label="الرابط"
      fullWidth
      isRequired
      helperText="مثال: https://wa.me/201121030583"
      validate={(value) => {
        if (!value) return 'مطلوب';
        if (!/^https?:\/\/.+/i.test(value)) return 'الرابط يجب أن يبدأ بـ http:// أو https://';
        return undefined;
      }}
    />
  </SimpleForm>
);

export function BranchLinkCreate() {
  return (
    <Create
      title="إضافة رابط تواصل"
      redirect="list"
      transform={(values) => ({
        ...values,
        branch_id: values.branch_id,
        type: values.type,
        label: (values.label || '').trim(),
        href: (values.href || '').trim(),
        id: values.id && values.id.trim()
          ? values.id.trim()
          : generateBranchLinkId(values.branch_id, values.type),
      })}
    >
      <BranchLinkFormFields />
    </Create>
  );
}

export function BranchLinkEdit() {
  return (
    <Edit title={<BranchLinkTitle />} redirect="list">
      <BranchLinkFormFields />
    </Edit>
  );
}
