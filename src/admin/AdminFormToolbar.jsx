import { Toolbar, SaveButton, ListButton, DeleteButton } from 'react-admin';

/**
 * Shared form footer: gold Save + outline Back to list (+ optional Delete on edit).
 */
export function AdminFormToolbar({ showDelete = false, saveLabel = 'حفظ', backLabel = 'العودة للقائمة' }) {
  return (
    <Toolbar className="admin-form-toolbar">
      <div className="admin-form-toolbar__actions">
        <SaveButton label={saveLabel} className="admin-btn-save" />
        <ListButton label={backLabel} className="admin-btn-back" />
        {showDelete ? <DeleteButton /> : null}
      </div>
    </Toolbar>
  );
}
