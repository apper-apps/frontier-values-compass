import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ApperIcon from '@/components/ApperIcon'
import Button from '@/components/atoms/Button'
import { toast } from 'react-toastify'

const ExportModal = ({ isOpen, onClose, session }) => {
  const [exportFormat, setExportFormat] = useState('text')
  const [isExporting, setIsExporting] = useState(false)

  const formatData = () => {
    if (!session) return ''

    const { values, responses } = session
    const date = new Date().toLocaleDateString()

    let output = `Values Compass - Personal Values Assessment\n`
    output += `Generated on: ${date}\n\n`

    // Values Summary
    output += `CORE VALUES (Ranked by Importance)\n`
    output += `${'='.repeat(40)}\n\n`
    
    values.forEach((value, index) => {
      output += `${index + 1}. ${value.name.toUpperCase()}\n`
      if (value.descriptions && Object.keys(value.descriptions).length > 0) {
        Object.entries(value.descriptions).forEach(([key, desc]) => {
          output += `   ${key}: ${desc}\n`
        })
      }
      output += '\n'
    })

    // Detailed Responses
    output += `DETAILED RESPONSES\n`
    output += `${'='.repeat(40)}\n\n`

    const stepTitles = {
      'step1': 'Standard Elicitation',
      'step2': 'Motivation Strategy', 
      'step3': 'Threshold Values',
      'step4': 'Ranking',
      'step5': 'Validation',
      'step6': 'Complex Equivalents'
    }

    Object.entries(stepTitles).forEach(([stepId, title]) => {
      const stepResponses = responses.filter(r => r.stepId === stepId)
      if (stepResponses.length > 0) {
        output += `${title.toUpperCase()}\n`
        output += `${'-'.repeat(title.length)}\n`
        stepResponses.forEach(response => {
          output += `Q: ${response.question}\n`
          output += `A: ${response.answer}\n`
          if (response.followUps && response.followUps.length > 0) {
            response.followUps.forEach(followUp => {
              output += `   Follow-up: ${followUp}\n`
            })
          }
          output += '\n'
        })
      }
    })

    return output
  }

  const handleExport = async () => {
    setIsExporting(true)
    
    try {
      const content = formatData()
      
      if (exportFormat === 'text') {
        const blob = new Blob([content], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `values-assessment-${new Date().toISOString().split('T')[0]}.txt`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } else if (exportFormat === 'copy') {
        await navigator.clipboard.writeText(content)
        toast.success('Assessment copied to clipboard!')
      }
      
      onClose()
    } catch (error) {
      toast.error('Failed to export assessment')
    } finally {
      setIsExporting(false)
    }
  }

  if (!session) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-xl text-primary">
                  Export Assessment
                </h3>
                <button
                  onClick={onClose}
                  className="p-2 text-secondary hover:text-primary transition-colors"
                >
                  <ApperIcon name="X" size={20} />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Export Format
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-3 border border-surface-200 rounded-lg cursor-pointer hover:bg-surface-50">
                      <input
                        type="radio"
                        name="format"
                        value="text"
                        checked={exportFormat === 'text'}
                        onChange={(e) => setExportFormat(e.target.value)}
                        className="text-primary"
                      />
                      <div className="flex items-center gap-2">
                        <ApperIcon name="FileText" size={16} />
                        <span className="text-sm">Download as Text File</span>
                      </div>
                    </label>
                    
                    <label className="flex items-center gap-3 p-3 border border-surface-200 rounded-lg cursor-pointer hover:bg-surface-50">
                      <input
                        type="radio"
                        name="format"
                        value="copy"
                        checked={exportFormat === 'copy'}
                        onChange={(e) => setExportFormat(e.target.value)}
                        className="text-primary"
                      />
                      <div className="flex items-center gap-2">
                        <ApperIcon name="Copy" size={16} />
                        <span className="text-sm">Copy to Clipboard</span>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="bg-surface-100 rounded-lg p-4">
                  <h4 className="font-medium text-primary mb-2">
                    What will be included:
                  </h4>
                  <ul className="text-sm text-secondary space-y-1">
                    <li>• Ranked list of your core values</li>
                    <li>• Detailed descriptions and meanings</li>
                    <li>• All your responses from each step</li>
                    <li>• Date and time of assessment</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  onClick={onClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleExport}
                  loading={isExporting}
                  icon={exportFormat === 'text' ? 'Download' : 'Copy'}
                  className="flex-1"
                >
                  {exportFormat === 'text' ? 'Download' : 'Copy'}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default ExportModal