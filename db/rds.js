const Sequelize = require('sequelize');
const DataTypes = require('sequelize/lib/data-types');

const {
  database,
  username,
  password,
  host,
  port,
} = require('../config/rds.js');

const sequelize = new Sequelize(database, username, password, {
  host,
  port,
  dialect: 'mysql',
  operatorsAliases: false,
  logging: false,
  pool: { maxConnections: 5, maxIdleTime: 15 },
  dialectOptions: {
    requestTimeout: 5000
  }
});

const Restaurant = sequelize.define('Restaurant', {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  addressOne: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  addressTwo: Sequelize.STRING,
  city: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  state: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  zip: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  email: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false,
    validate: {
      notEmpty: true,
      isEmail: true,
    },
  },
  phone: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  description: Sequelize.STRING,
  genre: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  // type: Sequelize.STRING,
  paymentId: Sequelize.STRING,
  latitude: DataTypes.DECIMAL(10, 8),
  longitude: DataTypes.DECIMAL(11, 8),
});

const MenuItem = sequelize.define('MenuItem', {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  //description: Sequelize.STRING,
  price: {
    type: Sequelize.FLOAT,
    allowNull: false,
  },
  vegan: Sequelize.BOOLEAN,
  vegetarian: Sequelize.BOOLEAN,
  glutenFree: Sequelize.BOOLEAN,
  spicy: Sequelize.BOOLEAN,
  image: Sequelize.STRING,
  prepTime: Sequelize.INTEGER,
  rating: {
    type: Sequelize.INTEGER,
    defaultValue: 1,
  },
  status: {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: 'draft',
  },
});

const MenuSection = sequelize.define('MenuSection', {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  description: Sequelize.STRING,
});

const Order = sequelize.define('Order', {
  status: Sequelize.STRING,
  total: Sequelize.FLOAT,
  completedAt: Sequelize.DATE,
  transactionId: Sequelize.STRING,
  table: Sequelize.STRING,
});

const OrderItem = sequelize.define('OrderItem', {
  special: Sequelize.STRING,
  price: Sequelize.FLOAT,
});

const RestaurantUser = sequelize.define('RestaurantUser', {
  email: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false,
    validate: {
      notEmpty: true,
      isEmail: true,
    },
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  phone: Sequelize.STRING,
});

const Customer = sequelize.define('Customer', {
  userName: {
    type: Sequelize.STRING,
    unique: true,
  },
  firstName: Sequelize.STRING,
  lastName: Sequelize.STRING,
  password: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  email: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false,
    validate: {
      notEmpty: true,
      isEmail: true,
    },
  },
  phone: Sequelize.STRING,
  availVotes: Sequelize.INTEGER,
  paymentId: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  vendor: Sequelize.BOOLEAN,
  apiKey: Sequelize.STRING,
});

const CustomerRating = sequelize.define('CustomerRating', {
  total: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },
});

const PaymentMethods = sequelize.define('PaymentMethod', {
  cardId: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false,
  },
  zip: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  brand: Sequelize.STRING,
  country: Sequelize.STRING,
  exp_month: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  exp_year: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  last4: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  default: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
  description: {
    type: Sequelize.STRING,
  },
});

RestaurantUser.belongsTo(Restaurant);
Restaurant.hasMany(RestaurantUser);

MenuItem.belongsTo(Restaurant);
Restaurant.hasMany(MenuItem);

MenuItem.belongsTo(MenuSection);
MenuSection.hasMany(MenuItem);

MenuSection.belongsTo(Restaurant);
Restaurant.hasMany(MenuSection);

Order.belongsTo(Restaurant);
Restaurant.hasMany(Order);

Order.belongsTo(Customer);
Customer.hasMany(Order);

Order.belongsToMany(MenuItem, { through: 'OrderItem' });
MenuItem.belongsToMany(Order, { through: 'OrderItem' });

Customer.belongsToMany(MenuItem, { through: 'CustomerRating' });
MenuItem.belongsToMany(Customer, { through: 'CustomerRating' });

PaymentMethods.belongsTo(Customer);
Customer.hasMany(PaymentMethods);

module.exports = {
  Restaurant,
  RestaurantUser,
  MenuItem,
  MenuSection,
  Order,
  OrderItem,
  Customer,
  CustomerRating,
  PaymentMethods,
};
