import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

const initialTasks = {
    todo: {
        name: 'To Do',
        tasks: [
            { id: uuidv4(), title: 'Task 1' },
            { id: uuidv4(), title: 'Task 2' },
        ],
    },
    inProgress: {
        name: 'In Progress',
        tasks: [],
    },
    done: {
        name: 'Done',
        tasks: [],
    },
};

function SortableItem({ id, title, onDelete }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="bg-white shadow p-2 mb-2 rounded flex justify-between touch-none"
        >
            {title}
            <button onClick={() => onDelete(id)}>❌</button>
        </div>
    );
}

function Droppable({ id, children }) {
    const { setNodeRef } = useSortable({ id });
    return (
        <div ref={setNodeRef} className="bg-gray-100 p-4 rounded min-h-[200px]">
            {children}
        </div>
    );
}

export default function TaskBoard() {
    const [tasks, setTasks] = useState(initialTasks);
    const [newTask, setNewTask] = useState('');

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;
        console.log('Drag event:', { active: active.id, over: over?.id });

        if (!over) {
            console.log('No drop target');
            return;
        }

        let sourceColumn = null;
        let sourceIndex = null;
        for (const columnId in tasks) {
            const index = tasks[columnId].tasks.findIndex((task) => task.id === active.id);
            if (index !== -1) {
                sourceColumn = columnId;
                sourceIndex = index;
                break;
            }
        }

        if (!sourceColumn) {
            console.log('Source column not found for task:', active.id);
            return;
        }

        let destinationColumn = null;
        let destinationIndex = null;

        for (const columnId in tasks) {
            const index = tasks[columnId].tasks.findIndex((task) => task.id === over.id);
            if (index !== -1) {
                destinationColumn = columnId;
                destinationIndex = index;
                break;
            }
        }

        if (!destinationColumn && tasks[over.id]) {
            destinationColumn = over.id;
            destinationIndex = tasks[over.id].tasks.length;
        }

        if (!destinationColumn) {
            console.log('Destination column not found for over:', over.id);
            return;
        }

        console.log('Moving task:', {
            sourceColumn,
            sourceIndex,
            destinationColumn,
            destinationIndex,
        });

        const updatedTasks = { ...tasks };

        if (sourceColumn === destinationColumn && destinationIndex !== sourceIndex) {
            const newTasks = [...tasks[sourceColumn].tasks];
            const [movedTask] = newTasks.splice(sourceIndex, 1);
            newTasks.splice(destinationIndex, 0, movedTask);
            updatedTasks[sourceColumn] = { ...tasks[sourceColumn], tasks: newTasks };
        } else if (sourceColumn !== destinationColumn) {
            const sourceTasks = [...tasks[sourceColumn].tasks];
            const destinationTasks = [...tasks[destinationColumn].tasks];
            const [movedTask] = sourceTasks.splice(sourceIndex, 1);
            destinationTasks.splice(destinationIndex, 0, movedTask);
            updatedTasks[sourceColumn] = { ...tasks[sourceColumn], tasks: sourceTasks };
            updatedTasks[destinationColumn] = { ...tasks[destinationColumn], tasks: destinationTasks };
        }

        setTasks(updatedTasks);
    };

    const handleCreate = () => {
        if (!newTask.trim()) return;
        const id = uuidv4();
        const updatedTasks = {
            ...tasks,
            todo: {
                ...tasks.todo,
                tasks: [...tasks.todo.tasks, { id, title: newTask }],
            },
        };
        setTasks(updatedTasks);
        setNewTask('');
    };

    const handleDelete = (id) => {
        const updatedTasks = {};
        for (const column in tasks) {
            updatedTasks[column] = {
                ...tasks[column],
                tasks: tasks[column].tasks.filter((task) => task.id !== id),
            };
        }
        setTasks(updatedTasks);
    };

    return (
        <div className="p-4">
            <div className="flex gap-2 mb-4">
                <input
                    className="border p-2 rounded w-full"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="New Task"
                />
                <button onClick={handleCreate} className="bg-blue-500 text-white px-4 rounded">
                    Add
                </button>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <div className="grid grid-cols-3 gap-4">
                    {Object.entries(tasks).map(([column, { name, tasks: items }]) => (
                        <Droppable key={column} id={column}>
                            <h2 className="font-bold mb-2 capitalize">{name}</h2>
                            <SortableContext
                                id={column}
                                items={items.map((task) => task.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                {items.map((task) => (
                                    <SortableItem
                                        key={task.id}
                                        id={task.id}
                                        title={task.title}
                                        onDelete={handleDelete}
                                    />
                                ))}
                            </SortableContext>
                        </Droppable>
                    ))}
                </div>
            </DndContext>
        </div>
    );
}