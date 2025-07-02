// src/components/DynamicEntityForm.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useForm, Controller } from 'react-hook-form'
import api from "../api/axios"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

export default function DynamicEntityForm({
  schema,            // array of field configs
  defaultValues = {},// initial values object
  onSubmit,          // handler
  apiEndpoints = {}, // for fetching options
  computedFields = {}, // for auto-computed values
  onCancel // <-- add this prop
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

  // Memoize select-fetch fields to prevent unnecessary re-computation
  const selectFetchFields = useMemo(() => {
    return schema.filter(field => field.type === 'select-fetch' || field.type === 'multiselect-fetch')
  }, [schema])

  // Memoize API endpoints to prevent unnecessary re-fetching
  const stableApiEndpoints = useMemo(() => apiEndpoints, [JSON.stringify(apiEndpoints)])

  // Fetch options for dynamic fields with proper dependency management
  const fetchOptions = useCallback(async (fields) => {
    if (fields.length === 0) return

    // Check if we already have all the options
    const fieldsNeedingFetch = fields.filter(field => 
      !fetchedOptions[field.name] || fetchedOptions[field.name].length === 0
    )
    
    if (fieldsNeedingFetch.length === 0) return

    setLoading(true)
    
    try {
      const promises = fieldsNeedingFetch.map(async field => {
        try {
          let endpoint = field.fetchEndpoint || stableApiEndpoints[field.fetchKey]
          if (!endpoint) return { [field.name]: [] }

          const response = await api.get(endpoint)
          
          // Handle different response structures
          let items = []
          if (response.data && response.data.success) {
            const responseData = response.data.data
            if (Array.isArray(responseData)) {
              items = responseData
            } else if (responseData && typeof responseData === 'object') {
              const possibleArrays = Object.values(responseData).filter(Array.isArray)
              items = possibleArrays.length > 0 ? possibleArrays[0] : []
            }
          } else if (Array.isArray(response.data)) {
            items = response.data
          } else if (response.data && Array.isArray(response.data.data)) {
            items = response.data.data
          }

          const options = field.transformOptions 
            ? field.transformOptions(items)
            : items.map(item => ({
                value: item[field.valueKey || '_id'] || item.id || item._id,
                label: item[field.labelKey || 'name'] || item.name || item.label
              }))
          
          return { [field.name]: options }
        } catch (error) {
          console.error(`Error fetching options for ${field.name}:`, error)
          return { [field.name]: [] }
        }
      })

      const results = await Promise.all(promises)
      const newFetchedOptions = results.reduce((acc, result) => ({ ...acc, ...result }), {})
      
      setFetchedOptions(prev => ({ ...prev, ...newFetchedOptions }))
    } catch (error) {
      console.error('Error in fetchOptions:', error)
    } finally {
      setLoading(false)
    }
  }, [fetchedOptions, stableApiEndpoints])

  // Effect for fetching options - only runs when selectFetchFields change
  useEffect(() => {
    fetchOptions(selectFetchFields)
  }, [fetchOptions, selectFetchFields])

  // Memoize computed fields to prevent recreation
  const computedFieldsMap = useMemo(() => {
    return schema.reduce((acc, field) => {
      if (field.computed && field.computeFrom) {
        acc[field.name] = field
      }
      return acc
    }, {})
  }, [schema])

  // Handle computed values with proper dependencies
  useEffect(() => {
    Object.values(computedFieldsMap).forEach(field => {
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
    })
  }, [watchedValues, computedFieldsMap, setValue, getValues])

  // Memoized field renderer to prevent unnecessary re-renders
  const renderField = useCallback((field) => {
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
        const isFieldLoading = loading && fetchedOpts.length === 0
        
        return (
          <select
            {...register(name, rules)}
            multiple={type === 'multiselect-fetch'}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            disabled={isFieldLoading || isComputed}
          >
            {type === 'select-fetch' && (
              <option value="">
                {isFieldLoading ? 'Loading…' : (placeholder || 'Select…')}
              </option>
            )}
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
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCA2NCA2NCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMzIgNGMxNS40NjQgMCAyOCAxMi41MzYgMjggMjhzLTEyLjUzNiAyOC0yOCAyOFM0IDQ3LjQ2NCA0IDMyIDQgMTYuNTM2IDMyIDR6IiBmaWxsPSIjZjNmNGY2Ii8+PHBhdGggZD0iTTIyIDI0aDIwdjE2SDIyVjI0eiIgZmlsbD0iI2U1ZTdlYiIvPjxwYXRoIGQ9Im0yNiAzMCA2LTZoOGwtNCA0djZoLTEweiIgZmlsbD0iI2Q1ZDdkYyIvPjwvc3ZnPg==';
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

      case 'datetime-local':
        return (
          <Controller
            name={name}
            control={control}
            rules={rules}
            render={({ field: { onChange, value } }) => (
              <DatePicker
                selected={value ? new Date(value) : null}
                onChange={(date) => {
                  if (date) {
                    onChange(date.toISOString());
                  } else {
                    onChange(null);
                  }
                }}
                showTimeSelect
                timeIntervals={15}
                dateFormat="yyyy-MM-dd HH:mm"
                minDate={new Date()}
                placeholderText={placeholder || "Select date and time"}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                disabled={isComputed}
                isClearable
                popperClassName="react-datepicker-popper"
                calendarClassName="react-datepicker-calendar"
              />
            )}
          />
        )

      case 'time-range':
        // expects value: { start: Date, end: Date }
        return (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium min-w-[80px]">Start Time</label>
              <Controller
                name={`${name}.start`}
                control={control}
                rules={rules.start || rules}
                render={({ field: { onChange, value } }) => (
                  <DatePicker
                    selected={value ? new Date(value) : null}
                    onChange={date => onChange(date)}
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={15}
                    timeCaption="Start"
                    dateFormat="h:mm aa"
                    placeholderText="Start time"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                )}
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium min-w-[80px]">End Time</label>
              <Controller
                name={`${name}.end`}
                control={control}
                rules={rules.end || rules}
                render={({ field: { onChange, value } }) => (
                  <DatePicker
                    selected={value ? new Date(value) : null}
                    onChange={date => onChange(date)}
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={15}
                    timeCaption="End"
                    dateFormat="h:mm aa"
                    placeholderText="End time"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                )}
              />
            </div>
          </div>
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
  }, [register, control, errors, computedValues, fetchedOptions, loading, watchedValues])

  // Memoized form submission handler
  const onFormSubmit = useCallback((data) => {
    // Transform file inputs back for submission
    const transformedData = { ...data }
    
    schema.forEach(field => {
      if (field.type === 'file-or-url' && transformedData[field.name]) {
        // Keep as-is: File objects or URL strings will be handled by the parent
      }
    })
    
    onSubmit(transformedData)
  }, [onSubmit, schema])

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {schema.map((field) => (
        <div key={field.name}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {field.label}
            {field.rules?.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          
          {renderField(field)}
          
          {errors[field.name] && (
            <p className="mt-1 text-sm text-red-600">{errors[field.name].message}</p>
          )}
          
          {field.help && (
            <p className="mt-1 text-xs text-gray-500">{field.help}</p>
          )}
        </div>
      ))}
      
      <div className="flex items-center justify-end space-x-3 pt-6 border-t">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : 'Submit'}
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