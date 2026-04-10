import React, { useMemo } from "react";
import OrderColumn from "./OrderColumn";
import { TASK_TYPES } from "../../hooks/useOrdersData";

function OrderBoard({
  columnOrder,
  groupedOrders,
  isAdmin,
  isTouchDevice,
  dragHandlers,
  onView,
  onEdit,
  onCancel,
  onMove,
  statusMessage,
}) {
  const columns = useMemo(() => columnOrder || [], [columnOrder]);

  return (
    <>
      <div className="min-w-[720px] mx-auto grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-1" role="region" aria-label="Order board">
        {columns.map((taskName) => {
          const orders = groupedOrders[taskName] || [];
          const isCancel = taskName === TASK_TYPES.CANCEL;
          const allowDrop = !isTouchDevice && !isCancel;

          return (
            <OrderColumn
              key={taskName}
              title={taskName}
              orders={orders}
              isAdmin={isAdmin}
              allowDrop={allowDrop}
              onDrop={dragHandlers.onDrop}
              onDragOver={dragHandlers.onDragOver}
              onDragStart={dragHandlers.onDragStart}
              onView={onView}
              onEdit={onEdit}
              onCancel={onCancel}
              onMove={onMove}
              isTouchDevice={isTouchDevice}
            />
          );
        })}
      </div>

      <div className="sr-only" aria-live="polite">{statusMessage}</div>
    </>
  );
}

const areOrderBoardPropsEqual = (prevProps, nextProps) => {
  const prevColumns = prevProps.columnOrder || [];
  const nextColumns = nextProps.columnOrder || [];

  if (prevColumns.length !== nextColumns.length) {
    return false;
  }

  for (let i = 0; i < prevColumns.length; i += 1) {
    if (prevColumns[i] !== nextColumns[i]) {
      return false;
    }
  }

  const prevGroups = prevProps.groupedOrders || {};
  const nextGroups = nextProps.groupedOrders || {};
  const prevKeys = Object.keys(prevGroups);
  const nextKeys = Object.keys(nextGroups);

  if (prevKeys.length !== nextKeys.length) {
    return false;
  }

  for (const key of prevKeys) {
    if (!nextGroups[key]) {
      return false;
    }

    if ((prevGroups[key]?.length || 0) !== (nextGroups[key]?.length || 0)) {
      return false;
    }
  }

  if (
    prevProps.isAdmin !== nextProps.isAdmin ||
    prevProps.isTouchDevice !== nextProps.isTouchDevice ||
    prevProps.statusMessage !== nextProps.statusMessage ||
    prevProps.dragHandlers !== nextProps.dragHandlers ||
    prevProps.onView !== nextProps.onView ||
    prevProps.onEdit !== nextProps.onEdit ||
    prevProps.onCancel !== nextProps.onCancel ||
    prevProps.onMove !== nextProps.onMove
  ) {
    return false;
  }

  return true;
};

export default React.memo(OrderBoard, areOrderBoardPropsEqual);
