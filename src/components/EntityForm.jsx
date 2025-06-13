// src/components/DynamicEntityForm.jsx
import React, { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'

export default function DynamicEntityForm({
  schema,            // array of field configs
  defaultValues = {},// initial values object
  onSubmit,          // handler
  apiEndpoints = {}, // for fetching options
  computedFields = {} // for auto-computed values
}) {
  const [fetchedOptions, setFetchedOptions] = useState({})
  const [computedValues, setComputedValues] = useState({})
  const [loading, setLoading] = useState(false)

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors }
  } = useForm({ defaultValues })

  // Watch all fields for computed value dependencies
  const watchedValues = watch()

  // Fetch options for dynamic fields
  useEffect(() => {
    const fetchOptions = async () => {
      setLoading(true)
      const promises = schema
        .filter(field => field.type === 'select-fetch' || field.type === 'multiselect-fetch')
        .map(async field => {
          try {
            const endpoint = field.fetchEndpoint || apiEndpoints[field.fetchKey]
            if (!endpoint) return null

            const response = await fetch(endpoint)
            const data = await response.json()
            
            // Transform data based on field config
            const options = field.transformOptions 
              ? field.transformOptions(data)
              : data.map(item => ({
                  value: item[field.valueKey || 'id'] || item.id,
                  label: item[field.labelKey || 'name'] || item.name
                }))
            
            return { [field.name]: options }
          } catch (error) {
            console.error(`Error fetching options for ${field.name}:`, error)
            return { [field.name]: [] }
          }
        })

      const results = await Promise.all(promises)
      const newFetchedOptions = results.reduce((acc, result) => ({ ...acc, ...result }), {})
      setFetchedOptions(newFetchedOptions)
      setLoading(false)
    }

    fetchOptions()
  }, [schema, apiEndpoints])

  // Handle computed values
  useEffect(() => {
    schema.forEach(field => {
      if (field.computed && field.computeFrom) {
        const dependencies = Array.isArray(field.computeFrom) ? field.computeFrom : [field.computeFrom]
        const hasAllDependencies = dependencies.every(dep => watchedValues[dep] !== undefined && watchedValues[dep] !== '')
        
        if (hasAllDependencies) {
          let computedValue
          
          if (field.computeFunction) {
            // Custom compute function
            computedValue = field.computeFunction(watchedValues, getValues())
          } else if (field.computeTemplate) {
            // Template-based computation (e.g., "https://flagcdn.com/w80/{code}.png")
            computedValue = field.computeTemplate.replace(/\{(\w+)\}/g, (match, key) => watchedValues[key] || '')
          } else if (field.computeConcat) {
            // Concatenation with separator
            computedValue = dependencies
              .map(dep => watchedValues[dep])
              .filter(Boolean)
              .join(field.computeConcat.separator || '')
          }
          
          if (computedValue && computedValue !== watchedValues[field.name]) {
            setValue(field.name, computedValue)
            setComputedValues(prev => ({ ...prev, [field.name]: computedValue }))
          }
        }
      }
    })
  }, [watchedValues, schema, setValue, getValues])

  const renderField = (field) => {
    const { name, label, type, rules = {}, options = [], placeholder, help } = field
    const error = errors[name]?.message
    const isComputed = field.computed && computedValues[name]

    switch (type) {
      case 'textarea':
        return (
          <textarea
            {...register(name, rules)}
            placeholder={placeholder}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            rows={field.rows || 4}
            disabled={isComputed}
          />
        )

      case 'select':
        return (
          <select
            {...register(name, rules)}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            disabled={isComputed}
          >
            <option value="">{placeholder || 'Select…'}</option>
            {options.map(o => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        )

      case 'select-fetch':
      case 'multiselect-fetch':
        const fetchedOpts = fetchedOptions[name] || []
        return (
          <select
            {...register(name, rules)}
            multiple={type === 'multiselect-fetch'}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            disabled={loading || isComputed}
          >
            {type === 'select-fetch' && <option value="">{loading ? 'Loading…' : (placeholder || 'Select…')}</option>}
            {fetchedOpts.map(o => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        )

      case 'multiselect':
        return (
          <select
            {...register(name, rules)}
            multiple
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            disabled={isComputed}
          >
            {options.map(o => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        )

      case 'checkbox':
        return (
          <div className="mt-1">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                {...register(name, rules)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                disabled={isComputed}
              />
              <span className="ml-2 text-sm text-gray-700">{field.checkboxLabel || 'Enable'}</span>
            </label>
          </div>
        )

      case 'checkbox-group':
        return (
          <div className="mt-1 space-y-2">
            {options.map(o => (
              <label key={o.value} className="inline-flex items-center">
                <input
                  type="checkbox"
                  value={o.value}
                  {...register(name, rules)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  disabled={isComputed}
                />
                <span className="ml-2 text-sm text-gray-700">{o.label}</span>
              </label>
            ))}
          </div>
        )

      case 'radio':
        return (
          <div className="mt-1 space-y-2">
            {options.map(o => (
              <label key={o.value} className="inline-flex items-center">
                <input
                  type="radio"
                  value={o.value}
                  {...register(name, rules)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  disabled={isComputed}
                />
                <span className="ml-2 text-sm text-gray-700">{o.label}</span>
              </label>
            ))}
          </div>
        )

case 'file-or-url':
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { onChange, value } }) => {
        const [inputType, setInputType] = useState(
          value instanceof File ? 'file' : 'url'
        );
        const [preview, setPreview] = useState(
          typeof value === 'string' ? value : null
        );

        // Auto-compute from `code` once you have 2 letters
        useEffect(() => {
          if (field.computedValue && !value && watchedValues.code?.length === 2) {
            const computed = field.computedValue(watchedValues);
            if (computed) {
              onChange(computed);
              setPreview(computed);
            }
          }
        }, [watchedValues.code, field.computedValue]);

        // Update preview on value change
        useEffect(() => {
          if (typeof value === 'string' && value) {
            setPreview(value);
          } else if (value instanceof File) {
            const url = URL.createObjectURL(value);
            setPreview(url);
            return () => URL.revokeObjectURL(url);
          }
        }, [value]);

        const handleInputTypeChange = (type) => {
          setInputType(type);

          if (type === 'url' && value instanceof File) {
            // switch back to computed or blank if code invalid
            const computed =
              watchedValues.code?.length === 2 && field.computedValue
                ? field.computedValue(watchedValues)
                : '';
            onChange(computed);
            setPreview(computed || null);

          } else if (type === 'file' && typeof value === 'string') {
            // clear URL
            onChange(null);
            setPreview(null);
          }
        };

        return (
          <div className="space-y-3">
            {/* URL / File radio toggle */}
            <div className="flex items-center space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name={`${name}_input_type`}
                  value="url"
                  checked={inputType === 'url'}
                  onChange={() => handleInputTypeChange('url')}
                  className="h-4 w-4 text-indigo-600"
                />
                <span className="ml-2 text-sm">URL</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name={`${name}_input_type`}
                  value="file"
                  checked={inputType === 'file'}
                  onChange={() => handleInputTypeChange('file')}
                  className="h-4 w-4 text-indigo-600"
                />
                <span className="ml-2 text-sm">Upload File</span>
              </label>
            </div>

            {/* URL input */}
            {inputType === 'url' && (
              <input
                type="url"
                value={typeof value === 'string' ? value : ''}
                onChange={e => {
                  const url = e.target.value;
                  onChange(url);
                  setPreview(url || null);
                }}
                placeholder={field.urlPlaceholder}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
              />
            )}

            {/* File input */}
            {inputType === 'file' && (
              <input
                type="file"
                accept={field.accept}
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) {
                    onChange(file);
                    const objUrl = URL.createObjectURL(file);
                    setPreview(objUrl);
                  }
                }}
                className="w-full text-sm text-gray-500 file:py-2 file:px-4 file:rounded file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
            )}

            {/* Preview */}
            {field.preview && preview && (
              <div className="mt-2">
                <img
                  src={preview}
                  alt="Preview"
                  className="h-16 w-16 object-cover rounded border"
                  onError={e => {
                    e.currentTarget.style.display = 'none';
                    setPreview(null);
                  }}
                />
              </div>
            )}
          </div>
        );
      }}
    />
  )


      case 'file':
        return (
          <Controller
            name={name}
            control={control}
            rules={rules}
            render={({ field: { onChange } }) => (
              <input
                type="file"
                accept={field.accept}
                onChange={e => onChange(e.target.files?.[0] || null)}
                className="mt-1 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                disabled={isComputed}
              />
            )}
          />
        )

      case 'number':
        return (
          <input
            type="number"
            {...register(name, rules)}
            placeholder={placeholder}
            min={field.min}
            max={field.max}
            step={field.step}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            disabled={isComputed}
          />
        )

      case 'range':
        return (
          <div className="mt-1">
            <input
              type="range"
              {...register(name, rules)}
              min={field.min || 0}
              max={field.max || 100}
              step={field.step || 1}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              disabled={isComputed}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{field.min || 0}</span>
              <span>{watchedValues[name] || field.min || 0}</span>
              <span>{field.max || 100}</span>
            </div>
          </div>
        )

      case 'color':
        return (
          <div className="mt-1 flex items-center space-x-2">
            <input
              type="color"
              {...register(name, rules)}
              className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
              disabled={isComputed}
            />
            <input
              type="text"
              {...register(name, rules)}
              placeholder="#000000"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              disabled={isComputed}
            />
          </div>
        )

      case 'json':
        return (
          <textarea
            {...register(name, {
              ...rules,
              validate: value => {
                if (!value) return true
                try {
                  JSON.parse(value)
                  return true
                } catch {
                  return 'Invalid JSON format'
                }
              }
            })}
            placeholder={placeholder || '{"key": "value"}'}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
            rows={field.rows || 6}
            disabled={isComputed}
          />
        )

      default:
        // text, email, password, date, datetime-local, url, tel, etc.
        return (
          <input
            type={type}
            {...register(name, rules)}
            placeholder={placeholder}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            disabled={isComputed}
          />
        )
    }
  }

  const onFormSubmit = (data) => {
    // Transform data before submission if needed
    const transformedData = { ...data }
    
    schema.forEach(field => {
      if (field.transform && transformedData[field.name] !== undefined) {
        transformedData[field.name] = field.transform(transformedData[field.name], transformedData)
      }
    })

    onSubmit(transformedData)
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {schema.map(field => {
        const error = errors[field.name]?.message
        const isComputed = field.computed && computedValues[field.name]

        return (
          <div key={field.name} className={field.className}>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {isComputed && (
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  Auto-computed
                </span>
              )}
            </div>
            
            {renderField(field)}
            
            {field.help && (
              <p className="text-xs text-gray-500 mt-1">{field.help}</p>
            )}
            
            {error && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </p>
            )}
          </div>
        )
      })}

      <div className="flex justify-end space-x-3 pt-6 border-t">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  )
}

// JavaScript for handling file-or-url radio button toggle
if (typeof document !== 'undefined') {
  document.addEventListener('change', function(e) {
    if (e.target.type === 'radio' && e.target.name.endsWith('_input_type')) {
      const fieldName = e.target.name.replace('_input_type', '')
      const urlInput = document.getElementById(`${fieldName}_url_input`)
      const fileInput = document.getElementById(`${fieldName}_file_input`)
      
      if (e.target.value === 'url') {
        urlInput.style.display = 'block'
        fileInput.style.display = 'none'
      } else {
        urlInput.style.display = 'none'
        fileInput.style.display = 'block'
      }
    }
  })
}