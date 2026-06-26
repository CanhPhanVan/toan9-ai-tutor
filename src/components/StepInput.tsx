'use client'
import { useRef, useImperativeHandle, forwardRef } from 'react'
import { UseFormRegister, FieldErrors, useFormContext } from 'react-hook-form'

export interface StepInputHandle {
  insertAtCursor: (text: string) => void
  focus: () => void
}

interface StepFeedback {
  isCorrect: boolean
  feedback: string
  wrongReason?: string | null
}

interface StepInputProps {
  stepNumber: number
  label: string
  placeholder?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: UseFormRegister<any>
  errors: FieldErrors
  fieldName: string
  hint?: string
  feedback?: StepFeedback
  onFocus?: (fieldName: string) => void
}

export const StepInput = forwardRef<StepInputHandle, StepInputProps>(
  function StepInput({ stepNumber, label, placeholder, register, errors, fieldName, hint, feedback, onFocus }, ref) {
    const textareaRef = useRef<HTMLTextAreaElement | null>(null)
    const { setValue, getValues } = useFormContext()

    useImperativeHandle(ref, () => ({
      insertAtCursor(text: string) {
        const el = textareaRef.current
        if (!el) return
        const start = el.selectionStart ?? 0
        const end = el.selectionEnd ?? 0
        const current = getValues(fieldName) ?? ''
        const newVal = current.slice(0, start) + text + current.slice(end)
        setValue(fieldName, newVal, { shouldDirty: true })
        // Restore cursor after inserted text
        setTimeout(() => {
          el.focus()
          el.setSelectionRange(start + text.length, start + text.length)
        }, 0)
      },
      focus() {
        textareaRef.current?.focus()
      },
    }))

    const { ref: registerRef, ...registerRest } = register(fieldName)

    return (
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          <span className="inline-flex items-center justify-center w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold mr-2">
            {stepNumber}
          </span>
          {label}
        </label>
        {hint && (
          <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-1.5 mb-2 border border-amber-100">
            💡 Gợi ý: {hint}
          </p>
        )}
        <textarea
          {...registerRest}
          ref={(el) => {
            registerRef(el)
            textareaRef.current = el
          }}
          placeholder={placeholder ?? `Nhập bước ${stepNumber}...`}
          rows={3}
          onFocus={() => onFocus?.(fieldName)}
          className={`w-full rounded-xl border px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-colors resize-none ${
            feedback
              ? feedback.isCorrect
                ? 'border-green-300 bg-green-50 focus:ring-green-300'
                : 'border-red-300 bg-red-50 focus:ring-red-300'
              : 'border-gray-200 bg-white hover:border-indigo-200'
          }`}
        />
        {errors[fieldName] && (
          <p className="text-xs text-red-500 mt-1">{String(errors[fieldName]?.message)}</p>
        )}
        {feedback && (
          <div className={`mt-2 rounded-lg p-3 text-sm ${feedback.isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-start gap-2">
              <span>{feedback.isCorrect ? '✅' : '❌'}</span>
              <div>
                <p className={feedback.isCorrect ? 'text-green-700' : 'text-red-700'}>{feedback.feedback}</p>
                {!feedback.isCorrect && feedback.wrongReason && (
                  <p className="text-red-500 text-xs mt-1">Lý do: {feedback.wrongReason}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }
)
