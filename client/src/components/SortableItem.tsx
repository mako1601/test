import * as React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Box, Grid2, Paper, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const SortableItem = ({
  id,
  text,
  onRemove,
  activeId,
  setActiveId,
  isRemovable
}: {
  id: string;
  text: string;
  onRemove: () => void;
  activeId: string;
  setActiveId: (id: string) => void;
  isRemovable: boolean;
}) => {
  const [hovered, setHovered] = React.useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const isActive = activeId === id;

  return (
    <Grid2 size={{ xs: 3, sm: 2, md: 1 }} ref={setNodeRef}>
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%'
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {hovered && !isDragging && isRemovable && (
          <IconButton
            size="small"
            title="Удалить вопрос"
            onClick={(event) => {
              event.stopPropagation();
              onRemove();
            }}
            style={{
              position: 'absolute',
              top: 1,
              right: 1,
              zIndex: 2,
              border: 0,
              borderRadius: 20,
              backgroundColor: 'rgb(212, 212, 212)',
              width: '1.5rem',
              height: '1.5rem'
            }}
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>
        )}
        <Paper
          {...attributes}
          {...listeners}
          sx={{
            transition,
            transform: CSS.Transform.toString(transform),
            outline: isDragging ? '2px solid #1976d2' : isActive ? '2px solid #ff9800' : 'none',
            cursor: 'grab',
            userSelect: 'none',
            background: isDragging ? '#e3f2fd' : 'white',
            boxShadow: isDragging ? '0px 4px 10px rgba(0, 0, 0, 0.2)' : 'none',
            borderRadius: 1,
            aspectRatio: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: isDragging ? 2 : 1,
            position: 'relative',
            width: '100%',
            height: '100%',
            pointerEvents: 'auto'
          }}
          onClick={(event) => {
            event.stopPropagation();
            if (!isActive) {
              setActiveId(id);
            }
          }}
        >
          <Typography
            sx={{
              padding: '0.3rem',
              overflow: 'hidden',
              wordBreak: 'break-word',
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 4,
            }}
          >
            {text}
          </Typography>
        </Paper>
      </Box>
    </Grid2>
  );
}

export default SortableItem;