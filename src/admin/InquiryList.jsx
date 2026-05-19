import { List, Datagrid, TextField, EmailField, DateField, DeleteButton, SearchInput } from 'react-admin';
import { AdminDatagrid } from './AdminDatagrid.jsx';

const inquiryFilters = [
  <SearchInput source="name" alwaysOn placeholder="بحث بالاسم" />,
  <SearchInput source="phone" placeholder="بحث بالهاتف" />,
];

export const InquiryList = () => (
  <List
    filters={inquiryFilters}
    sort={{ field: 'created_at', order: 'DESC' }}
    resource="inquiries"
  >
    <AdminDatagrid bulkActionButtons={true}>
      <TextField source="id" label="المعرف" />
      <TextField source="name" label="اسم العميل" />
      <TextField source="phone" label="رقم الهاتف" />
      <EmailField source="email" label="البريد الإلكتروني" />
      <TextField source="message" label="الرسالة" />
      <DateField source="created_at" label="تاريخ الإرسال" showTime />
      <DeleteButton />
    </AdminDatagrid>
  </List>
);
