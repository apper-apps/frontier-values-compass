import { useState, forwardRef, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSpeechSynthesis, useSpeechRecognition } from 'react-speech-kit'
import ApperIcon from '@/components/ApperIcon'
const TextArea = forwardRef(({ 
  label,
  error,
  hint,
  autoExpand = true,
  minRows = 3,
  maxRows = 10,
  showCount = false,
  maxLength,
  className = '',
  ...props 
}, ref) => {
const [isFocused, setIsFocused] = useState(false)
  const [hasValue, setHasValue] = useState(props.value || props.defaultValue || false)
  const [charCount, setCharCount] = useState(0)
  const [isListening, setIsListening] = useState(false)
  const [speechError, setSpeechError] = useState('')
  const textareaRef = useRef(null)
  const combinedRef = ref || textareaRef

  const { listen, listening, stop, supported } = useSpeechRecognition({
    onResult: (result) => {
      const currentValue = props.value || ''
      const newValue = currentValue + (currentValue ? ' ' : '') + result
      
      // Create synthetic event to trigger onChange
      const syntheticEvent = {
        target: { value: newValue }
      }
      
      handleChange(syntheticEvent)
      setSpeechError('')
    },
    onError: (error) => {
      setSpeechError('Speech recognition failed. Please try again.')
      setIsListening(false)
    },
    onEnd: () => {
      setIsListening(false)
    }
  })
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
    const value = e.target.value
    setHasValue(value.length > 0)
    setCharCount(value.length)
    
    if (autoExpand && e.target) {
      const textarea = e.target
      textarea.style.height = 'auto'
      const scrollHeight = textarea.scrollHeight
      const minHeight = minRows * 24 // Approximate line height
      const maxHeight = maxRows * 24
      textarea.style.height = Math.min(Math.max(scrollHeight, minHeight), maxHeight) + 'px'
    }
    
    props.onChange?.(e)
  }

  const handleVoiceClick = () => {
    if (listening) {
      stop()
      setIsListening(false)
    } else if (supported) {
      setSpeechError('')
      setIsListening(true)
      listen({ continuous: true, interimResults: false })
    } else {
      setSpeechError('Speech recognition is not supported in your browser')
    }
  }

  useEffect(() => {
    setIsListening(listening)
  }, [listening])

  useEffect(() => {
    if (props.value !== undefined) {
      setHasValue(props.value.length > 0)
      setCharCount(props.value.length)
    }
  }, [props.value])

  const isFloating = isFocused || hasValue

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <textarea
          ref={combinedRef}
          className={`
            w-full px-4 py-3 bg-white border-2 border-surface-200 rounded-lg
            transition-all duration-200 ease-out resize-none
            focus:border-primary focus:ring-2 focus:ring-primary/20
            placeholder-transparent
            ${error ? 'border-error focus:border-error focus:ring-error/20' : ''}
          `}
          placeholder={label}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          rows={minRows}
          maxLength={maxLength}
          {...props}
        />
        
        {label && (
          <motion.label
            initial={false}
            animate={{
              y: isFloating ? -28 : 12,
              scale: isFloating ? 0.85 : 1,
              color: error ? '#C1666B' : isFocused ? '#2C5530' : '#8B7355'
            }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute left-4 top-3 origin-left pointer-events-none font-medium"
          >
            {label}
          </motion.label>
        )}
{/* Voice Input Button */}
        <div className="absolute right-3 top-3 flex gap-2">
          {supported && (
            <motion.button
              type="button"
              onClick={handleVoiceClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`
                p-2 rounded-full transition-all duration-200
                ${isListening 
                  ? 'bg-error text-white shadow-lg animate-pulse' 
                  : 'bg-surface-100 text-secondary hover:bg-surface-200 hover:text-primary'
                }
              `}
              title={isListening ? 'Stop recording' : 'Start voice input'}
            >
              <ApperIcon 
                name={isListening ? "MicOff" : "Mic"} 
                size={16} 
              />
            </motion.button>
          )}
        </div>
      </div>
      
      <div className="flex justify-between items-start mt-1">
        <div className="flex-1">
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-error flex items-center gap-1"
            >
              <ApperIcon name="AlertCircle" size={14} />
              {error}
            </motion.p>
          )}
          
          {speechError && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-warning flex items-center gap-1"
            >
              <ApperIcon name="AlertTriangle" size={14} />
              {speechError}
            </motion.p>
          )}
          
          {isListening && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-primary flex items-center gap-1"
            >
              <ApperIcon name="Mic" size={14} />
              Listening... Speak now
            </motion.p>
          )}
          
          {hint && !error && !speechError && !isListening && (
            <p className="text-sm text-secondary">
              {hint}
            </p>
          )}
        </div>
        
        {showCount && (
          <p className={`text-xs ml-2 ${
            maxLength && charCount > maxLength * 0.9 ? 'text-warning' : 'text-secondary'
          }`}>
            {charCount}{maxLength && `/${maxLength}`}
          </p>
        )}
      </div>
    </div>
  )
})

TextArea.displayName = 'TextArea'

export default TextArea