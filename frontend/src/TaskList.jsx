import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";
import {
  forwardRef,
  useState,
} from "react";

const TaskList = forwardRef((props, ref) => {
  const {
    tasks,
    onEdit,
    onDelete,
    editableId,
    editTitle,
    editDescription,
    onEditTitleChange,
    onEditDescriptionChange,
    onEditCancel,
    onEditSave,
    onDragEnd,
    statusFilter,
    onStatusFilterChange,
    showDone,
    onToggleDone,
    showDoneToggle,
    renderTask,
  } = props;
  
  const [isDragging, setIsDragging] = useState(false);

  // Filter tasks by status
  const activeTasks = tasks.filter((t) => t.status !== "done");
  const doneTasks = tasks.filter((t) => t.status === "done");

  // Handle drag events
  const handleDragEnd = (result) => {
    setIsDragging(false);
    onDragEnd?.(result);
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const renderDefaultTask = (task) => (
    <>
      <div className="task-title">{task.title}</div>
      <div className="task-description">{task.description}</div>
      <div className="task-meta">
        <div className="task-creator">
          Created by: <span className="task-creator-name">{task.creatorName}</span>
          <span className="task-date ml-2">
            {new Date(task.createdAt).toLocaleString()}
          </span>
        </div>
      </div>
      <div className="task-status mt-2">
        <span className={`text-badge text-badge-${task.status}`}>
          {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
        </span>
      </div>
      {task.status === "pending" && (
        <div className="task-actions">
          <button
            onClick={() => onEdit(task)}
            className="btn btn-sm btn-outline-primary"
          >
            <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Edit
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="btn btn-sm btn-ghost-danger"
          >
            <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 6h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Delete
          </button>
        </div>
      )}
    </>
  );

  return (
    <div className="content-section">
      <h3 className="section-title">
        <svg className="inline-block w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 11l3 3L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Tasks
      </h3>

      {/* Status Filter */}
      <div className="filter-bar">
        <span className="filter-label">Filter by status:</span>
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          className="form-input"
        >
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="done">Done</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <DragDropContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
        <Droppable droppableId="taskList">
          {(provided) => (
            <ul
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="task-list"
            >
              {activeTasks.length === 0 && (
                <div className="py-6 text-center text-gray-500">
                  No tasks found. Create a new task to get started.
                </div>
              )}
              
              {activeTasks.map((task, index) => (
                <Draggable key={task.id} draggableId={task.id} index={index}>
                  {(provided, snapshot) => (
                    <li
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      ref={provided.innerRef}
                      className={`task-card task-card-${task.status} ${snapshot.isDragging ? 'is-dragging' : ''}`}
                    >
                      {editableId === task.id ? (
                        <div className="task-edit-form">
                          <input
                            className="form-input"
                            value={editTitle}
                            onChange={(e) => onEditTitleChange(e.target.value)}
                            placeholder="Task title"
                          />
                          <textarea
                            className="form-input form-textarea"
                            value={editDescription}
                            onChange={(e) => onEditDescriptionChange(e.target.value)}
                            placeholder="Task description"
                          />
                          <div className="edit-actions">
                            <button
                              onClick={onEditCancel}
                              className="btn btn-outline"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => onEditSave(task.id)}
                              className="btn btn-primary"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="drag-handle" title="Drag to reorder"></div>
                          {renderTask ? renderTask(task) : renderDefaultTask(task)}
                        </>
                      )}
                    </li>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>

      {/* Done Tasks Toggle */}
      {statusFilter === "" && showDoneToggle && doneTasks.length > 0 && (
        <div className="mt-6">
          <button
            onClick={onToggleDone}
            className={`done-tasks-toggle ${showDone ? 'open' : ''}`}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {showDone ? "Hide Done Tasks" : `Show Done Tasks (${doneTasks.length})`}
          </button>
          
          {showDone && (
            <div className="done-tasks-section">
              <ul className="task-list">
                {doneTasks.map((task) => (
                  <li key={task.id} className="task-card task-card-done">
                    {renderTask ? renderTask(task) : renderDefaultTask(task)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {statusFilter === "done" && doneTasks.length > 0 && (
        <ul className="task-list mt-4">
          {doneTasks.map((task) => (
            <li key={task.id} className="task-card task-card-done">
              {renderTask ? renderTask(task) : renderDefaultTask(task)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});

export default TaskList;