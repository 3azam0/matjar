import { Datagrid, EditButton } from 'react-admin';

/** List table with a visible تعديل button column + row click to edit */
export function AdminDatagrid({ children, ...props }) {
  return (
    <Datagrid rowClick="edit" bulkActionButtons {...props}>
      {children}
      <EditButton label="تعديل" />
    </Datagrid>
  );
}
