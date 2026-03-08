import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import Task from '../models/Task.js';

const router = express.Router();

// ─── Validation helper ────────────────────────────────────────
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// ─── Validators ───────────────────────────────────────────────
const taskBodyValidators = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 120 }),
  body('description').optional().trim().isLength({ max: 1000 }),
  body('status').optional().isIn(['todo', 'in-progress', 'done']),
  body('priority').optional().isIn(['low', 'medium', 'high']),
  body('tags').optional().isArray({ max: 5 }),
  body('dueDate').optional({ nullable: true }).isISO8601().withMessage('Invalid date format'),
];

// ─── GET /api/tasks ───────────────────────────────────────────
// Query params: status, priority, search, sortBy, order
router.get(
  '/',
  [
    query('status').optional().isIn(['todo', 'in-progress', 'done']),
    query('priority').optional().isIn(['low', 'medium', 'high']),
    query('sortBy').optional().isIn(['createdAt', 'updatedAt', 'dueDate', 'priority', 'order']),
    query('order').optional().isIn(['asc', 'desc']),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { status, priority, search, sortBy = 'order', order = 'asc' } = req.query;

      const filter = {};
      if (status) filter.status = status;
      if (priority) filter.priority = priority;
      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } },
        ];
      }

      const sortOrder = order === 'desc' ? -1 : 1;
      const tasks = await Task.find(filter)
        .sort({ [sortBy]: sortOrder, createdAt: -1 })
        .lean({ virtuals: true });

      res.json({ success: true, count: tasks.length, data: tasks });
    } catch (err) {
      next(err);
    }
  }
);

// ─── GET /api/tasks/stats ─────────────────────────────────────
router.get('/stats', async (_req, res, next) => {
  try {
    const [statusCounts, priorityCounts, totalCount] = await Promise.all([
      Task.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Task.aggregate([{ $group: { _id: '$priority', count: { $sum: 1 } } }]),
      Task.countDocuments(),
    ]);

    const stats = {
      total: totalCount,
      byStatus: statusCounts.reduce((acc, { _id, count }) => ({ ...acc, [_id]: count }), {}),
      byPriority: priorityCounts.reduce((acc, { _id, count }) => ({ ...acc, [_id]: count }), {}),
    };

    res.json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/tasks/:id ───────────────────────────────────────
router.get(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid task ID')],
  validate,
  async (req, res, next) => {
    try {
      const task = await Task.findById(req.params.id).lean({ virtuals: true });
      if (!task) return res.status(404).json({ error: 'Task not found' });
      res.json({ success: true, data: task });
    } catch (err) {
      next(err);
    }
  }
);

// ─── POST /api/tasks ──────────────────────────────────────────
router.post('/', taskBodyValidators, validate, async (req, res, next) => {
  try {
    const { title, description, status, priority, tags, dueDate } = req.body;

    // Assign order = max existing order + 1
    const maxOrder = await Task.find({ status: status || 'todo' })
      .sort({ order: -1 })
      .limit(1)
      .select('order');
    const order = maxOrder.length ? maxOrder[0].order + 1 : 0;

    const task = await Task.create({ title, description, status, priority, tags, dueDate, order });
    res.status(201).json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
});

// ─── PATCH /api/tasks/:id ─────────────────────────────────────
router.patch(
  '/:id',
  [param('id').isMongoId(), ...taskBodyValidators.map((v) => v.optional())],
  validate,
  async (req, res, next) => {
    try {
      const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      }).lean({ virtuals: true });

      if (!task) return res.status(404).json({ error: 'Task not found' });
      res.json({ success: true, data: task });
    } catch (err) {
      next(err);
    }
  }
);

// ─── DELETE /api/tasks/:id ────────────────────────────────────
router.delete(
  '/:id',
  [param('id').isMongoId()],
  validate,
  async (req, res, next) => {
    try {
      const task = await Task.findByIdAndDelete(req.params.id);
      if (!task) return res.status(404).json({ error: 'Task not found' });
      res.json({ success: true, message: 'Task deleted successfully' });
    } catch (err) {
      next(err);
    }
  }
);

// ─── PATCH /api/tasks/reorder ─────────────────────────────────
router.patch('/bulk/reorder', async (req, res, next) => {
  try {
    const { tasks } = req.body; // [{ id, order, status }]
    const ops = tasks.map(({ id, order, status }) => ({
      updateOne: { filter: { _id: id }, update: { order, status } },
    }));
    await Task.bulkWrite(ops);
    res.json({ success: true, message: 'Tasks reordered' });
  } catch (err) {
    next(err);
  }
});

export default router;
