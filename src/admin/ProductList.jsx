import {
  List,
  Datagrid,
  TextField,
  useGetList,
  useNavigate,
  useListContext,
  FunctionField,
  SelectInput,
  TextInput,
  DeleteButton,
  TopToolbar,
  FilterButton,
  CreateButton,
  BooleanField,
  useUpdate,
  useNotify,
  useRecordContext,
} from 'react-admin';
import {
  Button,
  Typography,
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField as MuiTextField,
  Switch,
} from '@mui/material';
import { formatProductAddedDate, PRODUCT_LIST_SORT } from '../lib/productSort.js';
import { AdminDatagrid } from './AdminDatagrid.jsx';

const ProductAddedDate = () => (
  <FunctionField
    label="تاريخ الإضافة"
    render={(record) => formatProductAddedDate(record)}
  />
);

const ToggleVisibilityButton = () => {
  const record = useRecordContext();
  const [update, { isLoading }] = useUpdate();
  const notify = useNotify();

  if (!record) return null;

  const handleChange = (event) => {
    event.stopPropagation();
    update(
      'products',
      { id: record.id, data: { is_visible: event.target.checked }, previousData: record },
      {
        onSuccess: () => {
          notify(event.target.checked ? 'تم عرض المنتج في الكتالوج' : 'تم إخفاء المنتج من الكتالوج', { type: 'info' });
        },
        onError: (error) => {
          notify(`حدث خطأ: ${error.message}`, { type: 'error' });
        }
      }
    );
  };

  return (
    <Switch
      checked={record.is_visible !== false}
      onChange={handleChange}
      disabled={isLoading}
      onClick={(e) => e.stopPropagation()}
      size="small"
      color="primary"
    />
  );
};

const ProductImage = () => (
  <FunctionField
    source="images"
    render={(record) => {
      const images = record?.images;
      if (!images || !Array.isArray(images) || images.length === 0) {
        return <Box sx={{ width: 50, height: 50, bgcolor: '#f5f5f5', borderRadius: 1 }} />;
      }
      return (
        <img
          src={images[0]}
          alt={record.name}
          style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }}
        />
      );
    }}
  />
);

const CategoryName = () => {
  const { data: categories } = useGetList('categories', {
    pagination: { page: 1, perPage: 100 },
    sort: { field: 'id', order: 'ASC' },
  });

  const categoryMap = (categories || []).reduce((acc, cat) => {
    acc[cat.id] = cat.title;
    return acc;
  }, {});

  return (
    <FunctionField
      source="category_id"
      render={(record) => categoryMap[record.category_id] || record.category_id}
    />
  );
};

const ImageCount = () => (
  <FunctionField
    source="images"
    label="عدد الصور"
    render={(record) => {
      const count = Array.isArray(record?.images) ? record.images.filter(Boolean).length : 0;
      return `${count} صورة`;
    }}
  />
);

const ProductListActions = () => {
  const { sort, setSort, filterValues, displayedFilters, setFilters } = useListContext();
  const currentSort = `${sort.field}:${sort.order}`;
  const searchValue = filterValues['name@ilike'] || '';

  const handleSortChange = (event) => {
    const [field, order] = event.target.value.split(':');
    setSort({ field, order });
  };

  const handleSearchChange = (event) => {
    const value = event.target.value;
    const nextFilters = { ...filterValues };

    if (value.trim()) {
      nextFilters['name@ilike'] = value;
    } else {
      delete nextFilters['name@ilike'];
    }

    setFilters(nextFilters, displayedFilters);
  };

  return (
    <TopToolbar
      sx={{
        width: '100%',
        gap: 1,
        flexWrap: 'nowrap',
        alignItems: 'center',
        overflowX: 'auto',
        pb: 0.5,
      }}
    >
      <MuiTextField
        size="small"
        label="بحث"
        placeholder="بحث باسم المنتج"
        value={searchValue}
        onChange={handleSearchChange}
        sx={{
          width: 'clamp(280px, 34vw, 440px)',
          flex: '0 0 clamp(280px, 34vw, 440px)',
        }}
      />
      <FormControl size="small" sx={{ minWidth: 190, flex: '0 0 190px' }}>
        <InputLabel id="product-sort-label">الترتيب</InputLabel>
        <Select
          labelId="product-sort-label"
          label="الترتيب"
          value={currentSort}
          onChange={handleSortChange}
        >
          <MenuItem value="order_index:DESC">الأحدث إضافة</MenuItem>
          <MenuItem value="order_index:ASC">الأقدم إضافة</MenuItem>
          <MenuItem value="name:ASC">أبجدي أ-ي</MenuItem>
          <MenuItem value="name:DESC">أبجدي ي-أ</MenuItem>
        </Select>
      </FormControl>
      <FilterButton />
      <CreateButton />
    </TopToolbar>
  );
};

export const ProductList = (props) => {
  const navigate = useNavigate();
  const { data: categories, isLoading, error } = useGetList('categories', {
    pagination: { page: 1, perPage: 25 },
    sort: { field: 'id', order: 'ASC' },
  });

  const hasCategories = !error && categories && categories.length > 0;
  const categoryChoices = (categories || []).map((cat) => ({
    id: cat.id,
    name: cat.title,
  }));

  const productFilters = [
    <SelectInput source="category_id" label="التصنيف" choices={categoryChoices} />,
    <SelectInput
      source="is_visible"
      label="حالة العرض"
      choices={[
        { id: true, name: 'معروض فقط' },
        { id: false, name: 'مخفي فقط' },
      ]}
    />,
    <TextInput source="description@ilike" label="بحث في الوصف" />,
    <TextInput source="note@ilike" label="بحث في الملاحظة" />,
  ];

  if (isLoading) return null;

  if (!hasCategories) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          لا توجد تصنيفات بعد
        </Typography>
        <Typography variant="body1" gutterBottom style={{ color: '#666', marginBottom: '1rem' }}>
          يجب إضافة تصنيف أولاً قبل إضافة المنتجات
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/admin/categories/create')}
          style={{ fontSize: '1rem', padding: '0.75rem 2rem' }}
        >
          إضافة تصنيف جديد
        </Button>
      </div>
    );
  }

  return (
    <List
      {...props}
      filters={productFilters}
      actions={<ProductListActions />}
      sort={PRODUCT_LIST_SORT}
      storeKey="products.list.byOrderIndex"
    >
      <AdminDatagrid>
        <ProductImage label="صورة" />
        <TextField source="name" label="اسم المنتج" sortable />
        <CategoryName label="التصنيف" />
        <ImageCount />
        <FunctionField label="معروض" render={() => <ToggleVisibilityButton />} />
        <TextField source="note" label="ملاحظة" />
        <ProductAddedDate />
        <DeleteButton />
      </AdminDatagrid>
    </List>
  );
};
