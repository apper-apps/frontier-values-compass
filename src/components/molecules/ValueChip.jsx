import { motion } from "framer-motion";
import { Draggable } from "react-beautiful-dnd";
import ApperIcon from "@/components/ApperIcon";
import React from "react";

const ValueChip = ({ 
  value, 
  index, 
  isDragging = false, 
  showRank = false, 
  onEdit,
  onRemove,
  className = '' 
}) => {
  const chipContent = (
    <div className={`
      flex items-center gap-3 p-3 bg-white rounded-lg border border-surface-200
      transition-all duration-200 hover:shadow-md
      ${isDragging ? 'shadow-lg rotate-2' : ''}
      ${className}
    `}>
      {showRank && (
        <div className="flex items-center justify-center w-6 h-6 bg-primary text-white rounded-full text-xs font-bold">
          {index + 1}
        </div>
      )}
      
      <div className="flex-1 min-w-0">
        <p className="font-medium text-primary truncate">
          {value.name}
        </p>
        {value.category && (
          <p className="text-xs text-secondary capitalize">
            {value.category}
          </p>
        )}
      </div>
      
      <div className="flex items-center gap-1">
        <ApperIcon name="GripVertical" size={16} className="text-secondary" />
        {onEdit && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit(value)
            }}
            className="p-1 text-secondary hover:text-primary transition-colors"
          >
            <ApperIcon name="Edit2" size={14} />
          </button>
        )}
        {onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onRemove(value.id)
            }}
            className="p-1 text-secondary hover:text-error transition-colors"
          >
            <ApperIcon name="X" size={14} />
          </button>
        )}
      </div>
    </div>
  )

  if (index !== undefined) {
    return (
      <Draggable draggableId={value.id} index={index}>
        {(provided, snapshot) => (
          <motion.div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            {React.cloneElement(chipContent, { 
              isDragging: snapshot.isDragging,
              className: `${className} ${snapshot.isDragging ? 'shadow-lg rotate-2' : ''}`
            })}
          </motion.div>
        )}
      </Draggable>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      {chipContent}
    </motion.div>
  )
}

export default ValueChip