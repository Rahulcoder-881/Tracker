import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TaskCard, TaskCardProps } from './TaskCard';

interface SortableTaskItemProps extends Omit<TaskCardProps, 'dragHandleProps' | 'isDragging'> {
  isDragDisabled?: boolean;
}

export const SortableTaskItem: React.FC<SortableTaskItemProps> = (props) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: props.task.id,
    disabled: props.isDragDisabled,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    position: 'relative',
    opacity: isDragging ? 0.75 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <TaskCard
        {...props}
        dragHandleProps={props.isDragDisabled ? undefined : { ...attributes, ...listeners }}
        isDragging={isDragging}
      />
    </div>
  );
};
