const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all tasks for the current user (isolated by email/userId)
exports.getTasks = async (req, res) => {
  try {
    // Get tasks only for this specific user
    const tasks = await prisma.task.findMany({
      where: {
        OR: [
          { userId: req.user.userId },       // tasks assigned to me
          { createdById: req.user.userId }   // tasks I created
        ]
      },
      orderBy: { dueDate: 'asc' },
      include: {
        assignedTo: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        user: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        createdBy: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      }
    });

    // Format tasks for frontend
    const formattedTasks = tasks.map(task => {
      let assigneeName = 'Unassigned';
      
      // Check if assigned to an employee
      if (task.assignedTo) {
        assigneeName = `${task.assignedTo.firstName} ${task.assignedTo.lastName}`;
      } 
      // Check if assigned to a user (via userId)
      else if (task.user) {
        assigneeName = `${task.user.firstName} ${task.user.lastName}`;
      }
      
      return {
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate ? task.dueDate.toISOString().split('T')[0] : null,
        assignee: assigneeName,
        creator: `${task.createdBy.firstName} ${task.createdBy.lastName}`
      };
    });

    res.json(formattedTasks);

  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Error fetching tasks' });
  }
};

// Create a new task
exports.createTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, assignedToId } = req.body;

    // Optional: Verify assigned employee exists
    if (assignedToId) {
      const employeeExists = await prisma.employee.findUnique({
        where: { id: assignedToId }
      });
      if (!employeeExists) return res.status(400).json({ message: 'Assigned employee not found' });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: status || 'pending',
        priority: priority || 'medium',
        dueDate: dueDate ? new Date(dueDate) : null,
        assignedTo: assignedToId ? { connect: { id: assignedToId } } : undefined,
        createdBy: { connect: { id: req.user.userId } } // must connect to creator
      },
      include: {
        assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true, email: true } }
      }
    });

    let assigneeName = 'Unassigned';
    if (task.assignedTo) {
      assigneeName = `${task.assignedTo.firstName} ${task.assignedTo.lastName}`;
    } else if (task.user) {
      assigneeName = `${task.user.firstName} ${task.user.lastName}`;
    }
    
    res.status(201).json({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.toISOString().split('T')[0] : null,
      assignee: assigneeName,
      creator: `${task.createdBy.firstName} ${task.createdBy.lastName}`
    });

  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Error creating task', error: error.message });
  }
};

// Update task status
exports.updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const task = await prisma.task.update({
      where: { id },
      data: { status },
      include: {
        assignedTo: { select: { firstName: true, lastName: true } },
        user: { select: { firstName: true, lastName: true } },
        createdBy: { select: { firstName: true, lastName: true } }
      }
    });

    let assigneeName = 'Unassigned';
    if (task.assignedTo) {
      assigneeName = `${task.assignedTo.firstName} ${task.assignedTo.lastName}`;
    } else if (task.user) {
      assigneeName = `${task.user.firstName} ${task.user.lastName}`;
    }
    
    res.json({
      id: task.id,
      title: task.title,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.toISOString().split('T')[0] : null,
      assignee: assigneeName,
      creator: `${task.createdBy.firstName} ${task.createdBy.lastName}`
    });

  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Error updating task' });
  }
};
