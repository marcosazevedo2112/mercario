import {Router} from 'express';

const router = Router();

const products = [
  {id: 1, name: 'Shampoo Elseve', price: 39.9, stock: 12, profit: 14.5, sold: 18},
  {id: 2, name: 'Camiseta Oversized', price: 89.9, stock: 4, profit: 28.5, sold: 11},
  {id: 3, name: 'Perfume Essence 100ml', price: 129.9, stock: 22, profit: 42.0, sold: 24},
  {id: 4, name: 'Tênis Casual Branco', price: 219.9, stock: 2, profit: 65.0, sold: 7},
];

const customers = [
  {id: 1, name: 'Ana Paula', nickname: 'Ana', phone: '+55 31 98888-1234', purchases: 34, lastPurchase: '04/08/2026'},
  {id: 2, name: 'João Carlos', nickname: 'João', phone: '+55 31 97777-4567', purchases: 21, lastPurchase: '03/08/2026'},
  {id: 3, name: 'Marcos Azevedo', nickname: 'Marcos Técnico', phone: '+55 31 98951-9694', purchases: 18, lastPurchase: '01/08/2026'},
  {id: 4, name: 'Fernanda Souza', nickname: 'Fernanda', phone: '+55 31 96666-7788', purchases: 14, lastPurchase: '31/07/2026'},
  {id: 5, name: 'Carlos Silva', nickname: 'Carlos', phone: '+55 31 95555-1122', purchases: 9, lastPurchase: '30/07/2026'},
];

const sales = [
  {id: 4832, customer: 'Ana Paula', initials: 'AP', products: 3, total: 599.9, time: '09:42', date: 'Hoje', status: 'paid'},
  {id: 4831, customer: 'Marcos Azevedo', initials: 'MA', products: 1, total: 99.99, time: '11:05', date: 'Hoje', status: 'paid'},
  {id: 4830, customer: 'Carlos Silva', initials: 'CS', products: 1, total: 89, time: '15:30', date: 'Ontem', status: 'paid'},
  {id: 4829, customer: 'Fernanda Souza', initials: 'FS', products: 4, total: 246, time: '18:12', date: 'Ontem', status: 'paid'},
  {id: 4828, customer: 'João Carlos', initials: 'JC', products: 2, total: 99.99, time: '10:20', date: '31 jul', status: 'paid'},
];

const charges = [
  {id: 1, customer: 'Ana Paula', initials: 'AP', value: 599, due: 'Hoje', priority: 'red', method: 'PIX', installment: '2/3'},
  {id: 2, customer: 'Marcos Azevedo', initials: 'MA', value: 99.99, due: 'Hoje', priority: 'red', method: 'Cartão', installment: '1/1'},
  {id: 3, customer: 'Carlos', initials: 'CS', value: 320, due: 'Amanhã', priority: 'orange', method: 'PIX', installment: '2/3'},
  {id: 4, customer: 'Fernanda', initials: 'FS', value: 89, due: '18 ago', priority: 'green', method: 'PIX', installment: '1/2'},
  {id: 5, customer: 'João Carlos', initials: 'JC', value: 149, due: '18 ago', priority: 'green', method: 'Cartão', installment: '2/4'},
];

router.get('/', (_req, res) => {
  res.render('home', {
    title: 'Mercario — Início',
    active: 'home',
    metrics: {sales: 23756.91, profit: 3563.53, customers: 127, products: 76},
    recentSales: sales.slice(0, 3),
  });
});

router.get('/clientes', (_req, res) => {
  res.render('customers/index', {title: 'Mercario — Clientes', active: 'customers', customers});
});

router.get('/clientes/:id', (req, res) => {
  const customer = customers.find(item => item.id === Number(req.params.id)) || customers[0];
  res.render('customers/show', {title: `Mercario — ${customer.name}`, active: 'customers', customer, sales: sales.slice(0, 3)});
});

router.get('/produtos', (_req, res) => {
  res.render('products/index', {title: 'Mercario — Produtos', active: 'products', products});
});

router.get('/produtos/:id', (req, res) => {
  const product = products.find(item => item.id === Number(req.params.id)) || products[0];
  res.render('products/show', {title: `Mercario — ${product.name}`, active: 'products', product, sales: sales.slice(0, 3)});
});

router.get('/vendas', (_req, res) => {
  res.render('sales/index', {title: 'Mercario — Vendas', active: 'sales', sales});
});

router.get('/vendas/:id', (req, res) => {
  const sale = sales.find(item => item.id === Number(req.params.id)) || sales[0];
  const saleProducts = [
    {name: 'Vestido', quantity: 2, total: 299},
    {name: 'Blusa', quantity: 1, total: 69},
  ];
  res.render('sales/show', {title: `Mercario — Venda #${sale.id}`, active: 'sales', sale, saleProducts});
});

router.get('/cobrancas', (_req, res) => {
  res.render('charges/index', {title: 'Mercario — Cobranças', active: 'charges', charges});
});

router.get('/cobrancas/:id', (req, res) => {
  const charge = charges.find(item => item.id === Number(req.params.id)) || charges[0];
  res.render('charges/show', {title: `Mercario — Cobrança`, active: 'charges', charge});
});

export default router;
