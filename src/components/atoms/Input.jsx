import { useState, forwardRef } from 'react'
import { motion } from 'framer-motion'
import ApperIcon from '@/components/ApperIcon'

const Input = forwardRef(({ 
  label,
  type = 'text',
  error,
  hint,
  icon,
  rightIcon,
  className = '',
  ...props 
}, ref) => {
  const [isFocused, setIsFocused] = useState(false)
  const [hasValue, setHasValue] = useState(props.value || props.defaultValue || false)

  const handleFocus = (e) => {
    setIsFocused(true)
    props.onFocus?.(e)
  }

  const handleBlur = (e) => {
    setIsFocused(false)
    setHasValue(e.target.value.length > 0)
    props.onBlur?.(e)
  }

  const handleChange = (e) => {
    setHasValue(e.target.value.length > 0)
    props.onChange?.(e)
  }

  const isFloating = isFocused || hasValue

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary">
            <ApperIcon name={icon} size={18} />
          </div>
        )}
        
        <input
          ref={ref}
          type={type}
          className={`
            w-full px-4 py-3 bg-white border-2 border-surface-200 rounded-lg
            transition-all duration-200 ease-out
            focus:border-primary focus:ring-2 focus:ring-primary/20
            placeholder-transparent
            ${icon ? 'pl-10' : ''}
            ${rightIcon ? 'pr-10' : ''}
            ${error ? 'border-error focus:border-error focus:ring-error/20' : ''}
          `}
          placeholder={label}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          {...props}
        />
        
        {label && (
          <motion.label
            initial={false}
            animate={{
              y: isFloating ? -28 : 0,
              scale: isFloating ? 0.85 : 1,
              color: error ? '#C1666B' : isFocused ? '#2C5530' : '#8B7355'
            }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={`
              absolute left-4 top-1/2 transform -translate-y-1/2 origin-left
              pointer-events-none font-medium
              ${icon && !isFloating ? 'ml-6' : ''}
            `}
          >
            {label}
          </motion.label>
        )}
        
        {rightIcon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary">
            <ApperIcon name={rightIcon} size={18} />
          </div>
        )}
      </div>
      
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 text-sm text-error flex items-center gap-1"
        >
          <ApperIcon name="AlertCircle" size={14} />
          {error}
        </motion.p>
      )}
      
      {hint && !error && (
        <p className="mt-1 text-sm text-secondary">
          {hint}
        </p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input