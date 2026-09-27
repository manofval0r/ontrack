import React from 'react'

interface InputFieldProps {
  id: string
  label: string
  type?: string
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  required?: boolean
  autoComplete?: string
  hint?: React.ReactNode
  error?: string
  rightElement?: React.ReactNode
}

/**
 * Labeled input field with optional hint, error state, and right-side slot
 * (used for "Forgot password?" link).
 */
export const InputField: React.FC<InputFieldProps> = ({
  id,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  required = false,
  autoComplete,
  hint,
  error,
  rightElement,
}) => {
  return (
    <div className="flex flex-col gap-1.5">
      {/* Label row */}
      <div className="flex items-center justify-between">
        <label
          htmlFor={id}
          className="text-sm font-semibold text-[#071E2D]"
        >
          {label}
          {required && (
            <span className="text-[#00C4B3] ml-0.5" aria-hidden="true">
              *
            </span>
          )}
        </label>
        {rightElement && (
          <div className="text-sm">{rightElement}</div>
        )}
      </div>

      {/* Input */}
      <input
        id={id}
        name={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        autoComplete={autoComplete}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={
          error ? `${id}-error` : hint ? `${id}-hint` : undefined
        }
        className={`
          w-full px-4 py-3 rounded-xl
          border-2 bg-white
          font-sans text-[#071E2D] text-sm
          placeholder:text-[#071E2D]/40
          transition-colors duration-150
          focus:outline-none focus:border-[#00C4B3]
          ${error
            ? 'border-red-400 bg-red-50'
            : 'border-[#071E2D]/20 hover:border-[#071E2D]/40'
          }
        `.trim()}
      />

      {/* Hint text */}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs text-[#071E2D]/55">
          {hint}
        </p>
      )}

      {/* Error text */}
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="text-xs text-red-600 font-medium"
        >
          {error}
        </p>
      )}
    </div>
  )
}
