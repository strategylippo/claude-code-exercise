// Order Controller - Contains BOLA Vulnerability
// EXERCISE: Find and fix the authorization issues

interface Order {
  id: string;
  userId: string;  // Owner of the order
  items: string[];
  total: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered';
  shippingAddress: string;
  paymentMethod: string;
  createdAt: Date;
}

interface Request {
  params: Record<string, string>;
  body: Record<string, unknown>;
  user?: { id: string; role: string };
}

interface Response {
  status: (code: number) => Response;
  json: (data: unknown) => void;
}

// Mock database
const orders: Map<string, Order> = new Map([
  ['order-1', {
    id: 'order-1',
    userId: 'user-1',
    items: ['Product A', 'Product B'],
    total: 150.00,
    status: 'paid',
    shippingAddress: '123 Main St, City',
    paymentMethod: 'card-ending-4242',
    createdAt: new Date('2024-06-01'),
  }],
  ['order-2', {
    id: 'order-2',
    userId: 'user-2',
    items: ['Product C'],
    total: 75.00,
    status: 'shipped',
    shippingAddress: '456 Oak Ave, Town',
    paymentMethod: 'card-ending-1234',
    createdAt: new Date('2024-06-15'),
  }],
]);

export class OrderController {
  // VULNERABLE: No check if order belongs to requesting user
  async getOrder(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const order = orders.get(id);

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    // VULNERABLE: Returns order without checking if user owns it
    // Any authenticated user can access any order by ID
    res.status(200).json({ order });
  }

  // VULNERABLE: No ownership check on update
  async updateOrder(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const order = orders.get(id);

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    // VULNERABLE: Anyone can update any order's shipping address
    const { shippingAddress } = req.body as { shippingAddress: string };
    order.shippingAddress = shippingAddress;

    res.status(200).json({ order });
  }

  // VULNERABLE: No ownership check on cancel
  async cancelOrder(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const order = orders.get(id);

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    // VULNERABLE: Anyone can cancel any order
    if (order.status !== 'pending' && order.status !== 'paid') {
      res.status(400).json({ error: 'Cannot cancel shipped orders' });
      return;
    }

    orders.delete(id);
    res.status(200).json({ message: 'Order cancelled' });
  }

  // VULNERABLE: Lists ALL orders, not just user's orders
  async listOrders(req: Request, res: Response): Promise<void> {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // VULNERABLE: Returns all orders in the system
    const allOrders = Array.from(orders.values());

    res.status(200).json({ orders: allOrders });
  }
}
