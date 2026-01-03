import React, { useId } from 'react'
import { cn } from '@/lib/utils'
import { CheckCircle2 } from 'lucide-react';

type SelectOption = { value: string; label: string }

type CommonProps = {
  label?: string
  description?: React.ReactNode
  descriptionClassName?: string
  error?: string
  containerClassName?: string
  rightComponent?: React.ReactNode
  leftIcon?: React.ReactNode
  showSyncStatus?: boolean
  synced?: boolean
  syncIconClassName?: string
  wrapperOnly?: boolean
}

type InputLikeProps = CommonProps &
  (
    | ({ as?: 'input' } & React.ComponentPropsWithoutRef<'input'>)
    | ({ as: 'textarea' } & React.ComponentPropsWithoutRef<'textarea'>)
    | ({ as: 'select'; options: SelectOption[] } & React.ComponentPropsWithoutRef<'select'>)
  )

const baseControlClasses =
  'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-2 border-foreground/15 hover:border-foreground/30 w-full min-w-0 rounded-md bg-transparent px-3 py-2 text-base outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-all duration-[150ms] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 aria-invalid:border-destructive'

export function Input(props: InputLikeProps) {

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { label, description, error, className, descriptionClassName, syncIconClassName, rightComponent, leftIcon, containerClassName, synced, showSyncStatus, wrapperOnly, children, as = 'input', ...rest } = props as any
  
  const reactId = useId()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const id = (rest as any).id ?? reactId
  const describedBy = error ? `${id}-error` : description ? `${id}-description` : undefined

  let control: React.ReactNode

  if (as === 'textarea') {
    control = (
      <textarea
        {...(rest as React.ComponentPropsWithoutRef<'textarea'>)}
        id={id}
        aria-invalid={!!error}
        aria-describedby={describedBy}
        className={cn(baseControlClasses, 'min-h-30 resize-vertical', className)}
      />
    )
  } else if (as === 'select') {
    const { options, ...selectRest } = rest as React.ComponentPropsWithoutRef<'select'> & { options: SelectOption[] }
    control = (
      <select
        {...selectRest}
        id={id}
        aria-invalid={!!error}
        aria-describedby={describedBy}
        className={cn(baseControlClasses, className)}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    )
  } else {
    control = (
      <div className='relative flex gap-2 items-stretch'>
        {leftIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            {leftIcon}
          </span>
        )}
        <input
          {...(rest as React.ComponentPropsWithoutRef<'input'>)}
          id={id}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={cn(baseControlClasses, leftIcon && 'pl-10', className)}
        />
        {rightComponent && rightComponent}
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col gap-1.5', containerClassName)}>
      {label && (
        <div className='flex items-center gap-2'>
          <label htmlFor={id} className="text-sm font-medium text-secondary-foreground">
            {label}
          </label>
          {
            showSyncStatus && (
              <CheckCircle2 strokeWidth={2.25} className={cn(
                "size-4",
                synced ? "text-primary" : "text-secondary-foreground/50",
                syncIconClassName
              )} />
            )
          }
        </div>
      )}
      {wrapperOnly ? children : control}
      {description && !error && (
        <p id={`${id}-description`} className={cn(
          "text-xs text-muted-foreground",
          descriptionClassName
        )}>
          {description}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
