import { useCallback, useEffect, useRef, useState } from 'react';
import { useInput, useNotify } from 'react-admin';
import { FormControl, FormHelperText, FormLabel } from '@mui/material';
import { supabase, SUPABASE_CONFIGURED } from '../lib/supabase';

const BUCKET = 'hero-images';
const MAX_FILE_BYTES = 5 * 1024 * 1024;

/**
 * Multi-image upload for hero section images (up to 3).
 * Shows all current images as a row, allows replacing and removing individually.
 * Stores URLs as a JSON stringified array in the `hero_images` source field.
 */
export const HeroImageUploadInput = (props) => {
  const { label = 'صور الهيرو' } = props;
  const {
    field: { value, onChange },
    fieldState: { error },
    isRequired,
  } = useInput(props);
  const notify = useNotify();
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const replaceInputRef = useRef(null);

  // Parse the stored value (text[] array from DB or JSON string)
  const images = Array.isArray(value) ? value : [];

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('فشل قراءة الملف'));
      reader.readAsDataURL(file);
    });

  const [activeIdx, setActiveIdx] = useState(null);

  const handlePrev = (e) => {
    e.stopPropagation();
    setActiveIdx((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setActiveIdx((prev) => (prev + 1) % images.length);
  };

  // Keyboard navigation for admin lightbox
  useEffect(() => {
    if (activeIdx === null) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setActiveIdx(null);
      if (e.key === 'ArrowRight') handlePrev(e);
      if (e.key === 'ArrowLeft') handleNext(e);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIdx, images.length]);

  const uploadToStorage = async (file) => {
    const ext = file.name.split('.').pop() || 'png';
    const path = `hero-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });
    if (error) throw error;
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return data.publicUrl;
  };

  const checkImageDimensions = (file) =>
    new Promise((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = () => {
        resolve(null);
      };
    });

  const processFiles = useCallback(
    async (files) => {
      const validFiles = Array.from(files).filter((f) => {
        if (!f.type.startsWith('image/')) {
          notify(`"${f.name}" ليس صورة`, { type: 'warning' });
          return false;
        }
        if (f.size > MAX_FILE_BYTES) {
          notify(`"${f.name}" كبير جداً (أقصى 5MB)`, { type: 'warning' });
          return false;
        }
        return true;
      });

      // Limit to stay within 3 total
      const maxCanAdd = 3 - images.length;
      const toUpload = validFiles.slice(0, maxCanAdd);

      if (toUpload.length === 0) {
        notify('تم الوصول للحد الأقصى (3 صور)', { type: 'warning' });
        return;
      }

      if (toUpload.length < validFiles.length) {
        notify(`تم اختيار ${toUpload.length} صورة فقط (الحد الأقصى 3)`, { type: 'info' });
      }

      setUploading(true);
      const urls = [];

      for (const file of toUpload) {
        const dims = await checkImageDimensions(file);
        if (dims && (dims.width < 1200 || dims.height < 600)) {
          notify(
            `تنبيه: الصورة "${file.name}" أبعادها صغيرة (${dims.width}x${dims.height}). يفضل مقاس 1920x1080 لضمان دقة كاملة.`,
            { type: 'warning' }
          );
        }

        let url = null;

        if (SUPABASE_CONFIGURED) {
          try {
            url = await uploadToStorage(file);
          } catch (err) {
            notify(`تعذر رفع "${file.name}": ${err.message}`, { type: 'warning' });
          }
        }

        if (!url) {
          try {
            url = await fileToBase64(file);
          } catch (err) {
            notify(`فشل قراءة "${file.name}": ${err.message}`, { type: 'error' });
          }
        }

        if (url) urls.push(url);
      }

      if (urls.length > 0) {
        onChange([...images, ...urls]);
        notify(`تم إضافة ${urls.length} صورة`, { type: 'success' });
      }

      setUploading(false);
    },
    [images, onChange, notify]
  );

  const removeImage = (index) => {
    const updated = images.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleReplaceFile = useCallback(
    async (file, idx) => {
      if (!file) return;
      if (!file.type.startsWith('image/')) {
        notify(`الملف "${file.name}" ليس صورة`, { type: 'warning' });
        return;
      }
      if (file.size > MAX_FILE_BYTES) {
        notify(`الملف "${file.name}" كبير جداً (أقصى 5MB)`, { type: 'warning' });
        return;
      }

      const dims = await checkImageDimensions(file);
      if (dims && (dims.width < 1200 || dims.height < 600)) {
        notify(
          `تنبيه: الصورة "${file.name}" أبعادها صغيرة (${dims.width}x${dims.height}). يفضل مقاس 1920x1080 لضمان دقة كاملة.`,
          { type: 'warning' }
        );
      }

      setUploading(true);
      let url = null;
      if (SUPABASE_CONFIGURED) {
        try {
          url = await uploadToStorage(file);
        } catch (err) {
          notify(`تعذر رفع "${file.name}" للتخزين، سيتم حفظها محلياً: ${err.message}`, {
            type: 'warning',
          });
        }
      }

      if (!url) {
        try {
          url = await fileToBase64(file);
        } catch (err) {
          notify(`فشل قراءة "${file.name}": ${err.message}`, { type: 'error' });
        }
      }

      if (url) {
        const arr = [...images];
        arr[idx] = url;
        onChange(arr);
        notify('تم استبدال صورة الهيرو بنجاح', { type: 'success' });
      }
      setUploading(false);
    },
    [images, onChange, notify]
  );

  const handleDeleteActive = () => {
    const idx = activeIdx;
    if (idx === null) return;
    removeImage(idx);
    
    const total = images.length;
    if (total <= 1) {
      setActiveIdx(null);
    } else if (idx >= total - 1) {
      setActiveIdx(total - 2);
    } else {
      // Keeps same index which naturally display the next available image
    }
  };

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);
      const files = e.dataTransfer.files;
      if (files.length > 0) processFiles(files);
    },
    [processFiles]
  );

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const hasError = Boolean(error?.message);
  const canAddMore = images.length < 3;

  return (
    <FormControl error={hasError} required={isRequired} fullWidth sx={{ mb: 2 }} dir="ltr">
      <FormLabel required={isRequired} sx={{ mb: 1 }}>
        {label} {images.length > 0 && `(${images.length}/3)`}
      </FormLabel>

      {/* Current images preview */}
      {images.length > 0 && (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
          {images.map((img, i) => (
            <div
              key={i}
              onClick={() => setActiveIdx(i)}
              style={{
                position: 'relative',
                height: 180,
                width: 'auto',
                cursor: 'pointer',
                borderRadius: 8,
                overflow: 'hidden',
                border: '1px solid rgba(0,0,0,0.08)',
                transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.04) translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <img
                src={img}
                alt={`صورة الهيرو ${i + 1}`}
                style={{
                  height: '100%',
                  width: 'auto',
                  display: 'block',
                }}
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(i);
                }}
                disabled={uploading}
                style={{
                  position: 'absolute',
                  top: 6,
                  right: 6,
                  width: 26,
                  height: 26,
                  border: 'none',
                  borderRadius: '50%',
                  background: 'rgba(0,0,0,0.7)',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: 16,
                  display: 'grid',
                  placeItems: 'center',
                  lineHeight: 1,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                  transition: 'background-color 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(211, 47, 47, 0.9)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.7)';
                }}
                title="إزالة"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload area (hidden when max reached) */}
      {canAddMore && (
        <div
          role="button"
          tabIndex={0}
          onDragEnter={() => setIsDragging(true)}
          onDragOver={handleDragOver}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          style={{
            border: `2px dashed ${hasError ? '#d32f2f' : isDragging ? '#c9a227' : '#ccc'}`,
            borderRadius: 8,
            padding: '1.25rem',
            textAlign: 'center',
            cursor: uploading ? 'not-allowed' : 'pointer',
            opacity: uploading ? 0.7 : 1,
            background: isDragging ? 'rgba(201, 162, 39, 0.08)' : hasError ? 'rgba(211, 47, 47, 0.04)' : '#fafafa',
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            disabled={uploading}
            onChange={(e) => {
              if (e.target.files.length > 0) {
                processFiles(e.target.files);
              }
              e.target.value = '';
            }}
          />
          <span>
            {uploading
              ? 'جاري الرفع…'
              : images.length > 0
                ? 'اسحب صورة جديدة أو انقر لإضافتها'
                : 'اسحب صورة أو انقر لاختيارها'}
          </span>
          <p style={{ margin: '8px 0 0', fontSize: 13, color: '#666', lineHeight: 1.5 }}>
            المقاس المثالي: <strong>1920 × 1080 بكسل</strong> (أو نسبة 16:9) بحجم أقصى 5MB.
            <br />
            💡 <em>نصيحة التصميم:</em> يفضل وضع <strong>العارضة/المنتج في الجانب الأيمن</strong> من الصورة كي لا تغطيها نصوص واجهة الموقع على اليسار. يمكن إضافة حتى 3 صور.
          </p>
        </div>
      )}

      {/* Branded Dashboard Image Preview Lightbox Overlay */}
      {activeIdx !== null && images[activeIdx] && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(10, 10, 10, 0.95)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
          onClick={() => setActiveIdx(null)}
        >
          {/* Close button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveIdx(null);
            }}
            style={{
              position: 'absolute',
              top: 20,
              right: 20,
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#fff',
              width: 48,
              height: 48,
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'grid',
              placeItems: 'center',
              fontSize: 28,
              fontWeight: 'light',
              transition: 'background-color 0.2s, transform 0.2s',
              zIndex: 10000,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
            aria-label="إغلاق المعاينة"
          >
            ×
          </button>

          {/* Image Container with navigation buttons */}
          <div
            style={{
              position: 'relative',
              maxWidth: '100%',
              width: '100%',
              maxHeight: '80vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[activeIdx]}
              alt={`معاينة الصورة الكاملة ${activeIdx + 1}`}
              style={{
                maxWidth: '90%',
                maxHeight: '75vh',
                objectFit: 'contain',
                borderRadius: 12,
                boxShadow: '0 24px 64px rgba(0, 0, 0, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            />

            {/* Left and Right navigation buttons */}
            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  style={{
                    position: 'absolute',
                    left: '4%',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#fff',
                    width: 50,
                    height: 50,
                    borderRadius: '50%',
                    cursor: 'pointer',
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: 20,
                    transition: 'all 0.2s',
                    backdropFilter: 'blur(8px)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                    e.currentTarget.style.transform = 'scale(1.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                  aria-label="الصورة السابقة"
                >
                  ⟨
                </button>
                <button
                  onClick={handleNext}
                  style={{
                    position: 'absolute',
                    right: '4%',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#fff',
                    width: 50,
                    height: 50,
                    borderRadius: '50%',
                    cursor: 'pointer',
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: 20,
                    transition: 'all 0.2s',
                    backdropFilter: 'blur(8px)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                    e.currentTarget.style.transform = 'scale(1.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                  aria-label="الصورة التالية"
                >
                  ⟩
                </button>
              </>
            )}
          </div>

          {/* Indicator label */}
          <div
            style={{
              marginTop: 20,
              color: '#fff',
              fontSize: 15,
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              padding: '8px 18px',
              borderRadius: 30,
              backdropFilter: 'blur(10px)',
              fontWeight: 'light',
              letterSpacing: '1px',
            }}
          >
            {activeIdx + 1} / {images.length}
          </div>

          {/* Hidden replacement file input */}
          <input
            type="file"
            ref={replaceInputRef}
            style={{ display: 'none' }}
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                handleReplaceFile(file, activeIdx);
              }
              e.target.value = '';
            }}
          />

          {/* Floating Action Toolbar */}
          <div
            style={{
              display: 'flex',
              gap: '12px',
              marginTop: '20px',
              zIndex: 10001,
            }}
          >
            {/* Add New Image Button */}
            <button
              onClick={() => {
                if (images.length >= 3) {
                  notify('تم الوصول للحد الأقصى (3 صور هيرو)', { type: 'warning' });
                } else {
                  fileInputRef.current?.click();
                }
              }}
              style={{
                background: images.length >= 3 ? '#a0a0a0' : '#6d8b4e',
                color: '#fff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: images.length >= 3 ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: images.length >= 3 ? 'none' : '0 4px 12px rgba(109, 139, 78, 0.3)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                if (images.length < 3) {
                  e.currentTarget.style.backgroundColor = '#5c7841';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (images.length < 3) {
                  e.currentTarget.style.backgroundColor = '#6d8b4e';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              <span>+ إضافة صورة</span>
            </button>

            {/* Replace / Edit Active Image Button */}
            <button
              onClick={() => replaceInputRef.current?.click()}
              style={{
                background: '#b38e4d',
                color: '#fff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(179, 142, 77, 0.3)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#9e7b40';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#b38e4d';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <span>✎ استبدال الصورة</span>
            </button>

            {/* Delete Active Image Button */}
            <button
              onClick={handleDeleteActive}
              style={{
                background: '#d32f2f',
                color: '#fff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(211, 47, 47, 0.3)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#b71c1c';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#d32f2f';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <span>🗑️ حذف الصورة</span>
            </button>
          </div>
        </div>
      )}

      {hasError ? <FormHelperText>{error.message}</FormHelperText> : null}
    </FormControl>
  );
};