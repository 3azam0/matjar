import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Admin, Resource, List, Datagrid, TextField, SearchInput, DeleteButton, ReferenceField } from 'react-admin';
import CategoryIcon from '@mui/icons-material/Category';
import InventoryIcon from '@mui/icons-material/Inventory';
import StoreIcon from '@mui/icons-material/Store';
import StarIcon from '@mui/icons-material/Star';
import SettingsIcon from '@mui/icons-material/Settings';
import LinkIcon from '@mui/icons-material/Link';
import polyglotI18nProvider from 'ra-i18n-polyglot';
import { ProductEdit } from './ProductForm.jsx';
import { ProductCreate } from './ProductCreateForm.jsx';
import { ProductList } from './ProductList.jsx';
import { CategoryCreate, CategoryEdit } from './CategoryForm.jsx';
import { BranchCreate, BranchEdit } from './BranchForm.jsx';
import { BranchLinkCreate, BranchLinkEdit } from './BranchLinkForm.jsx';
import { Dashboard } from './Dashboard.jsx';
import { AdminDatagrid } from './AdminDatagrid.jsx';
import { saharAdminTheme } from './adminTheme.js';
import './adminButtons.css';
import { FeatureCreate, FeatureEdit } from './FeatureForm.jsx';
import { SiteSettingsEdit } from './SiteSettingsForm.jsx';
import EmailIcon from '@mui/icons-material/Email';
import { InquiryList } from './InquiryList.jsx';
import { supabaseDataProvider, supabaseAuthProvider, LoginPage } from 'ra-supabase';
import {
  SUPABASE_CONFIGURED,
  supabase,
  resolvedSupabaseUrl,
  resolvedSupabaseAnonKey,
} from '../lib/supabase';

const arabicMessages = {
  ra: {
    action: {
      add: 'إضافة',
      add_filter: 'إضافة فلتر',
      back: 'رجوع',
      bulk_actions: 'العنصر المحدد |||| %{smart_count} عنصر محدد',
      cancel: 'إلغاء',
      clear_array_input: 'مسح القائمة',
      clear_input_value: 'مسح القيمة',
      clone: 'نسخ',
      confirm: 'تأكيد',
      create: 'إضافة',
      create_item: 'إنشاء %{item}',
      delete: 'حذف',
      edit: 'تعديل',
      export: 'تصدير',
      list: 'قائمة',
      move_down: 'تحريك لأسفل',
      move_up: 'تحريك لأعلى',
      next: 'التالي',
      prev: 'السابق',
      remove: 'إزالة',
      remove_filter: 'حذف الفلتر',
      save: 'حفظ',
      search: 'بحث',
      select_all: 'تحديد الكل',
      select_row: 'تحديد هذا العنصر',
      show: 'عرض',
      sort: 'ترتيب',
      undo: 'إلغاء',
      unselect: 'إلغاء التحديد',
      update: 'تحديث',
      close: 'إغلاق',
    },
    boolean: {
      true: 'نعم',
      false: 'لا',
      null: '',
    },
    page: {
      create: 'إنشاء %{name}',
      dashboard: 'لوحة التحكم',
      edit: '%{name} #%{id}',
      error: 'حدث خطأ',
      list: 'قائمة %{name}',
      loading: 'جاري التحميل',
      not_found: 'غير موجود',
      show: '%{name} #%{id}',
      empty: 'لا يوجد %{name} بعد',
      invite: 'هل تريد إضافة %{name}؟',
    },
    input: {
      file: {
        upload_several: 'أفلت بعض الملفات للتحميل، أو انقر لتحديد واحد.',
        upload_single: 'أفلت ملفاً للتحميل، أو انقر لتحديده.',
      },
      image: {
        upload_several: 'أفلت بعض الصور للتحميل، أو انقر لتحديد واحدة.',
        upload_single: 'أفلت صورة للتحميل، أو انقر لتحديدها.',
      },
      references: {
        all_missing: 'غير قادر على إيجاد البيانات.',
        many_missing: 'واحد على الأقل من البيانات المرتبطة لم يعد متوفراً.',
        single_missing: 'البيانات المرتبطة غير متوفرة.',
      },
      password: {
        toggle_visible: 'إظهار كلمة السر',
        toggle_hidden: 'إخفاء كلمة السر',
      },
    },
    message: {
      about: 'حول',
      are_you_sure: 'هل أنت متأكد؟',
      bulk_delete_content:
        'هل أنت متأكد من حذف %{name}؟ |||| هل أنت متأكد من حذف %{smart_count} عنصراً؟',
      bulk_delete_title: 'حذف %{name} |||| حذف %{smart_count} عنصراً',
      bulk_update_content: 'هل أنت متأكد من تحديث %{name}؟',
      bulk_update_title: 'تحديث %{name}',
      delete_content: 'هل أنت متأكد من حذف هذا العنصر؟',
      delete_title: 'حذف %{name} #%{id}',
      details: 'تفاصيل',
      error: 'حدث خطأ في المتصفح ولم يتم حل طلبك.',
      invalid_form: 'النموذج غير صحيح. يرجى التحقق من الأخطاء.',
      loading: 'جاري تحميل الصفحة، يرجى الانتظار.',
      no: 'لا',
      not_found: 'لقد أدخلت رابطاً خاطئاً، أو اتبعت رابطاً سيئاً.',
      yes: 'نعم',
      unsaved_changes: 'بعض التغييرات لم يتم حفظها. هل أنت متأكد من المغادرة؟',
    },
    navigation: {
      no_results: 'لم يتم العثور على نتائج',
      no_more_results: 'الصفحة %{page} خارج الحدود. جرب الصفحة السابقة.',
      page_out_of_boundaries: 'رقم الصفحة %{page} خارج النطاق',
      page_out_from_end: 'لا يمكن الذهاب بعد الصفحة الأخيرة',
      page_out_from_begin: 'لا يمكن الذهاب قبل الصفحة الأولى',
      page_range_info: '%{offsetBegin}-%{offsetEnd} من %{total}',
      page_rows_per_page: 'عدد الصفوف في الصفحة:',
      next: 'التالي',
      prev: 'السابق',
      skip_nav: 'اذهب إلى المحتوى',
    },
    sort: {
      sort_by: 'رتب حسب %{field} %{order}',
      ASC: 'تصاعدي',
      DESC: 'تنازلي',
    },
    auth: {
      auth_check_error: 'يرجى تسجيل الدخول للمتابعة',
      user_menu: 'الملف الشخصي',
      username: 'اسم المستخدم',
      password: 'كلمة السر',
      sign_in: 'تسجيل الدخول',
      sign_in_error: 'فشل تسجيل الدخول، يرجى المحاولة مرة أخرى',
      logout: 'تسجيل الخروج',
    },
    notification: {
      updated: 'تم التحديث |||| تم تحديث %{smart_count} عنصراً',
      created: 'تم الإنشاء',
      deleted: 'تم الحذف |||| تم حذف %{smart_count} عنصراً',
      bad_item: 'عنصر غير صحيح',
      item_doesnt_exist: 'العنصر غير موجود',
      http_error: 'حدث خطأ في الاتصال',
      data_provider_error: 'خطأ من مزود البيانات. تحقق من السجلات.',
      i18n_error: 'تعذر تحميل الترجمات',
      canceled: 'تم الإلغاء',
      logged_out: 'انتهت الجلسة، يرجى إعادة تسجيل الدخول',
      not_authorized: 'ليس لديك صلاحية للوصول إلى هذا المورد.',
    },
    validation: {
      required: 'مطلوب',
      minLength: 'يجب أن يكون على الأقل %{min} أحرف',
      maxLength: 'يجب أن يكون على الأكثر %{max} أحرف',
      minValue: 'يجب أن يكون %{min} على الأقل',
      maxValue: 'يجب أن يكون %{max} على الأكثر',
      number: 'يجب أن يكون رقماً',
      email: 'يجب أن يكون بريداً إلكترونياً صحيحاً',
      oneOf: 'يجب أن يكون واحداً من: %{options}',
      regex: 'يجب أن يطابق النمط (regex): %{pattern}',
    },
  },
  resources: {
    categories: {
      name: 'التصنيفات',
    },
    products: {
      name: 'المنتجات',
    },
    branches: {
      name: 'الفروع والمواقع',
    },
    branch_links: {
      name: 'روابط الفروع',
    },
    features: {
      name: 'المميزات',
    },
    site_settings: {
      name: 'إعدادات الموقع',
    },
    inquiries: {
      name: 'استفسارات العملاء',
    },
  },
};

const i18nProvider = polyglotI18nProvider(() => arabicMessages, 'ar');

function AdminShell() {
  const dataProvider = useMemo(
    () =>
      supabaseDataProvider({
        instanceUrl: resolvedSupabaseUrl,
        apiKey: resolvedSupabaseAnonKey,
        supabaseClient: supabase,
      }),
    []
  );

  const authProvider = useMemo(
    () =>
      supabaseAuthProvider(supabase, {
        getIdentity: async (user) => ({
          id: user.id,
          fullName: user.email,
        }),
      }),
    []
  );

  const categoryFilters = [<SearchInput source="title" alwaysOn placeholder="بحث بالاسم" />];
  const branchFilters = [<SearchInput source="name" alwaysOn placeholder="بحث بالاسم" />];

  return (
    <div className="ra-admin-root" dir="ltr" lang="en">
      <Admin
        dataProvider={dataProvider}
        authProvider={authProvider}
        loginPage={LoginPage}
        i18nProvider={i18nProvider}
        basename="/admin"
        dashboard={Dashboard}
        lightTheme={saharAdminTheme}
      >
        <Resource name="categories" icon={CategoryIcon} list={<List filters={categoryFilters}><AdminDatagrid><TextField source="id" label="المعرف" /><TextField source="title" label="اسم التصنيف" /><TextField source="description" label="الوصف" /><DeleteButton /></AdminDatagrid></List>} create={CategoryCreate} edit={CategoryEdit} recordRepresentation="title" />
        <Resource name="products" icon={InventoryIcon} list={<ProductList />} create={ProductCreate} edit={ProductEdit} recordRepresentation="name" />
        <Resource name="branches" icon={StoreIcon} list={<List filters={branchFilters}><AdminDatagrid><TextField source="id" label="المعرف" /><TextField source="name" label="اسم الفرع" /><TextField source="phone" label="رقم الهاتف" /><TextField source="map_query" label="البحث في الخريطة" /><DeleteButton /></AdminDatagrid></List>} create={BranchCreate} edit={BranchEdit} recordRepresentation="name" />
        <Resource name="branch_links" icon={LinkIcon} list={<List><AdminDatagrid><TextField source="id" label="المعرف" /><ReferenceField source="branch_id" reference="branches" label="الفرع"><TextField source="name" /></ReferenceField><TextField source="type" label="النوع" /><TextField source="label" label="النص" /><TextField source="href" label="الرابط" /><DeleteButton /></AdminDatagrid></List>} create={BranchLinkCreate} edit={BranchLinkEdit} recordRepresentation="label" />
        <Resource name="features" icon={StarIcon} list={<List><AdminDatagrid><TextField source="id" label="المعرف" /><TextField source="title" label="عنوان الميزة" /><TextField source="description" label="الوصف" /><DeleteButton /></AdminDatagrid></List>} create={FeatureCreate} edit={FeatureEdit} recordRepresentation="title" />
        <Resource name="site_settings" icon={SettingsIcon} list={<List><AdminDatagrid bulkActionButtons={false}><TextField source="id" label="المعرف" /><TextField source="site_name" label="اسم الموقع" /></AdminDatagrid></List>} edit={SiteSettingsEdit} />
        <Resource name="inquiries" icon={EmailIcon} list={<InquiryList />} recordRepresentation="name" />
      </Admin>
    </div>
  );
}

function AdminMissingEnv() {
  return (
    <div className="admin-missing-env" dir="rtl">
      <h1>إعداد Supabase</h1>
      <p>
        لوحة التحكم تحتاج عنوان المشروع ومفتاح anon. أنشئ ملف <code>.env</code> في جذر المشروع ثم أعد تشغيل
        <code> npm run dev</code>:
      </p>
      <pre className="admin-missing-env-pre">
        {`VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`}
      </pre>
      <p>
        <Link to="/">العودة للموقع</Link>
      </p>
    </div>
  );
}

export function AdminApp() {
  if (!SUPABASE_CONFIGURED) {
    return <AdminMissingEnv />;
  }
  return <AdminShell />;
}
