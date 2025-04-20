import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";
import {
  forwardRef,
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

  // Now you can safely use `ref` and all the destructured props.

  const activeTasks = tasks.filter((t) => t.status !== "done");
  const doneTasks = tasks.filter((t) => t.status === "done");

  const renderDefaultTask = (task) => (
    <>
      <div className="font-semibold">{task.title}</div>
      <div>{task.description}</div>
      <div className="text-sm text-gray-500">
        Created by: <strong>{task.creatorName}</strong> at{" "}
        {new Date(task.createdAt).toLocaleString()}
      </div>
      <div>Status: {task.status}</div>
      {task.status === "pending" && (
        <div className="mt-2 space-x-2">
          <button
            onClick={() => onEdit(task)}
            className="text-blue-600"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="text-red-600"
          >
            Delete
          </button>
        </div>
      )}
    </>
  );

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Your Tasks</h3>

      {/* Status Filter */}
      <div className="mb-4">
        <label className="mr-2 font-medium">Filter by status:</label>
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          className="border p-1 rounded"
        >
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="done">Done</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="taskList">
          {(provided) => (
            <ul
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-2"
            >
              {activeTasks.map((task, index) => (
                <Draggable key={task.id} draggableId={task.id} index={index}>
                  {(provided) => (
                    <li
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      ref={provided.innerRef}
                      className="border p-4 rounded bg-white"
                    >
                      {editableId === task.id ? (
                        <>
                          <input
                            className="border p-2 w-full mb-2"
                            value={editTitle}
                            onChange={(e) => onEditTitleChange(e.target.value)}
                          />
                          <textarea
                            className="border p-2 w-full mb-2"
                            value={editDescription}
                            onChange={(e) => onEditDescriptionChange(e.target.value)}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => onEditSave(task.id)}
                              className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                            >
                              Save
                            </button>
                            <button
                              onClick={onEditCancel}
                              className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400"
                            >
                              Cancel
                            </button>
                          </div>
                        </>
                      ) : (
                        renderTask ? renderTask(task) : renderDefaultTask(task)
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
            className="text-sm text-gray-700 underline"
          >
            {showDone ? "Hide Done Tasks" : `Show Done Tasks (${doneTasks.length})`}
          </button>
          {showDone && (
            <ul className="mt-2 space-y-2">
              {doneTasks.map((task) => (
                <li key={task.id} className="border p-4 rounded">
                  {renderTask ? renderTask(task) : renderDefaultTask(task)}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {statusFilter === "done" && doneTasks.length > 0 && (
        <ul className="mt-6 space-y-2">
          {doneTasks.map((task) => (
            <li key={task.id} className="border p-4 rounded">
              {renderTask ? renderTask(task) : renderDefaultTask(task)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});

export default TaskList;
