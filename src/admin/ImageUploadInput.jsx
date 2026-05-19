import { useCallback, useEffect, useRef, useState } from 'react';
import { useInput, useNotify } from 'react-admin';
import { FormControl, FormHelperText, FormLabel } from '@mui/material';
import { supabase, SUPABASE_CONFIGURED } from '../lib/supabase';

const BUCKET = 'product-images';
const MAX_FILE_BYTES = 5 * 1024 * 1024;

/**
 * Pick several images; uploads to Supabase Storage when configured,
 * otherwise stores base64 data URLs. Keeps every selected image in the array.
 */
export const ImageUploadInput = (props) => {
  const { label = 'صور المنتج' } = props;
  const {
    field: { value = [], onChange },
    fieldState: { error },
    isRequired,
  } = useInput(props);
  const notify = useNotify();
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const readImages = (raw) => (Array.isArray(raw) ? raw.filter(Boolean) : []);

  /** Always up to date — avoids losing images when adding files before React re-renders */
  const imagesRef = useRef(readImages(value));
  const replaceInputRef = useRef(null);

  useEffect(() => {
    imagesRef.current = readImages(value);
  }, [value]);

  const currentImages = readImages(value);

  const commitImages = useCallback(
    (next) => {
      const normalized = readImages(next);
      imagesRef.current = normalized;
      onChange(normalized);
    },
    [onChange]
  );

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('فشل قراءة الملف'));
      reader.readAsDataURL(file);
    });

  const uploadToStorage = async (file) => {
    const safeName = file.name.replace(/[^\w.-]+/g, '_') || 'image.jpg';
    const path = `products/${Date.now()}-${Math.random().toString(36).slice(2)}-${safeName}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });
    if (error) throw error;
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return data.publicUrl;
  };

  const handleFiles = useCallback(
    async (fileList) => {
      const files = Array.from(fileList || []);
      if (files.length === 0) return;

      setUploading(true);
      const added = [];

      for (const file of files) {
        if (!file.type.startsWith('image/')) {
          notify(`الملف "${file.name}" ليس صورة`, { type: 'warning' });
          continue;
        }
        if (file.size > MAX_FILE_BYTES) {
          notify(`الملف "${file.name}" كبير جداً (أقصى 5MB)`, { type: 'warning' });
          continue;
        }

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

        if (url) added.push(url);
      }

      if (added.length > 0) {
        commitImages([...imagesRef.current, ...added]);
        notify(`تمت إضافة ${added.length} صورة (المجموع: ${imagesRef.current.length})`, {
          type: 'success',
        });
      }

      setUploading(false);
    },
    [commitImages, notify]
  );

  const removeUrl = (idx) => {
    const arr = [...imagesRef.current];
    arr.splice(idx, 1);
    commitImages(arr);
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
        const arr = [...imagesRef.current];
        arr[idx] = url;
        commitImages(arr);
        notify('تم استبدال الصورة بنجاح', { type: 'success' });
      }
      setUploading(false);
    },
    [commitImages, notify]
  );

  const [activeIdx, setActiveIdx] = useState(null);

  const handleDeleteActive = () => {
    const idx = activeIdx;
    if (idx === null) return;
    removeUrl(idx);
    
    const total = currentImages.length;
    if (total <= 1) {
      setActiveIdx(null);
    } else if (idx >= total - 1) {
      setActiveIdx(total - 2);
    } else {
      // Keeps same index which naturally display the next available image
    }
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    setActiveIdx((prev) => (prev - 1 + currentImages.length) % currentImages.length);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setActiveIdx((prev) => (prev + 1) % currentImages.length);
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
  }, [activeIdx, currentImages.length]);

  const hasError = Boolean(error?.message);

  return (
    <FormControl error={hasError} required={isRequired} fullWidth sx={{ mb: 2 }} dir="ltr">
      <FormLabel required={isRequired} sx={{ mb: 1 }}>
        {label}
      </FormLabel>

      <div
        role="button"
        tabIndex={0}
        onDragEnter={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
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
            handleFiles(e.target.files);
            e.target.value = '';
          }}
        />
        <span>{uploading ? 'جاري الرفع…' : 'اختيار عدة صور أو سحبها هنا'}</span>
        <p style={{ margin: '8px 0 0', fontSize: 13, color: '#666' }}>
          يمكنك اختيار أكثر من صورة دفعة واحدة — تُحفظ كلها مع المنتج
        </p>
      </div>

      {currentImages.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 12,
            marginTop: 16,
          }}
        >
          {currentImages.map((url, idx) => (
            <div
              key={`${idx}-${String(url).slice(0, 32)}`}
              onClick={() => setActiveIdx(idx)}
              style={{
                position: 'relative',
                height: 180,
                width: 'auto',
                borderRadius: 8,
                overflow: 'hidden',
                cursor: 'pointer',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <img
                src={url}
                alt={`صورة ${idx + 1}`}
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
                  removeUrl(idx);
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
                aria-label="حذف الصورة"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Branded Dashboard Image Preview Lightbox Overlay */}
      {activeIdx !== null && currentImages[activeIdx] && (
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
              src={currentImages[activeIdx]}
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
            {currentImages.length > 1 && (
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
            {activeIdx + 1} / {currentImages.length}
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
              onClick={() => fileInputRef.current?.click()}
              style={{
                background: '#6d8b4e',
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
                boxShadow: '0 4px 12px rgba(109, 139, 78, 0.3)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#5c7841';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#6d8b4e';
                e.currentTarget.style.transform = 'translateY(0)';
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