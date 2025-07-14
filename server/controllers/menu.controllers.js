import Menu from '../models/menu.models.js';
import Order from '../models/order.models.js';

export const getMenus = async (req, res) => {
  const { category } = req.query;
  const filter =
    !category || category === '전체'
      ? {}
      : { category };
  const list = await Menu.aggregate([
    { $match: filter },
    {
      $addFields: {
        effPriority: { $ifNull: ['$adminPriority', 99999] },
      },
    },
    {
      $sort: {
        effPriority: 1,
        popularity: -1,
        name: 1,
      },
    },
    {
      $project: {
        effPriority: 0,
        __v: 0,
      },
    },
  ]);
  res.json(list);
};

export const getMenuById = async (req, res) => {
  const item = await Menu.findById(req.params.id);
  if (!item) return res.status(404).json({ message: 'Not found' });
  res.json(item);
};
export const updatePriority = async (req, res) => {
  const { id } = req.params;
  const { adminPriority } = req.body;       // 숫자 또는 null

  /* 입력 검증 (선택) */
  if (adminPriority !== null && isNaN(adminPriority))
    return res.status(400).json({ error: 'adminPriority must be number or null' });

  await Menu.updateOne({ _id: id }, { adminPriority });
  res.json({ ok: true });
};
export const createOrder = async (req, res) => {
  const order = await Order.create(req.body);

  // 메뉴별 주문 수만큼 popularity 1씩 증가
  for (const it of order.items) {
    await Menu.updateOne(
      { _id: it.menuId },
      { $inc: { popularity: it.qty } }
    );
  }
  res.status(201).json(order);
};