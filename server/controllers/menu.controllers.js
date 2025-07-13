import Menu from '../models/menu.models.js';

export const getMenus = async (_req, res) => {
  const list = await Menu.find().sort({ name: 1 });
  res.json(list);
};

export const getMenuById = async (req, res) => {
  const item = await Menu.findById(req.params.id);
  if (!item) return res.status(404).json({ message: 'Not found' });
  res.json(item);
};