// Require DB models
const {
  Customer,
  MenuItem,
  Order,
} = require('../db/rds.js');

// Require dependencies
const moment = require('moment');

// Update helpers functions
// These functions are called as the analytics builder (index.js)
// iterates through each order object in order to minimize iterations
module.exports = {

  updateTotalRevenueLastNDays(analytics, order, days) {
    const now = moment(Date.now());
    const completed = moment(order.completedAt);
    const diffInDays = now.diff(completed, 'days');

    if (diffInDays <= days) {
      analytics[`totalRevenueLast${days}Days`] += order.total;
    }

    return null;
  },

  updateTotalRevenue(analytics, order) {
    analytics.totalRevenue += order.total;
    return null;
  },

  updateTotalRevenueByDayOfWeek(analytics, order) {
    const day = moment(order.completedAt).format('dddd');
    analytics.totalRevenueByDayOfWeek.data[day] += order.total;
  },

  updateTotalRevenueByMonth(analytics, order) {
    const month = moment(order.completedAt).format('MMM');
    analytics.totalRevenueByMonth.data[month] += order.total;
  },

  updateCustomerDirectory(analytics, order, customers) {
    const currentCustomer = order.Customer.userName;

    if (!customers[currentCustomer]) {
      customers[currentCustomer] = {
        orders: 1,
        totalRevenue: order.total,
        averageRevenue: order.total,
        lastOrderDate: order.completedAt,
        lastOrderDateHumanReadable: moment(order.completedAt).format('MMMM DD, YYYY'),
        customerId: order.CustomerId,
      };
    } else {
      customers[currentCustomer].orders++;
      customers[currentCustomer].totalRevenue += order.total;
      customers[currentCustomer].averageRevenue =
        customers[currentCustomer].totalRevenue /
        customers[currentCustomer].orders;
      if (customers[currentCustomer.lastOrderDate < order.completedAt]) {
        customers[currentCustomer].lastOrderDate = order.completedAt;
      }
    }
  },

  updateItemOrderTotals(analytics, order) {
    order.MenuItems.forEach((item) => {
      if (!analytics.itemOrderTotals.data[item.id]) {
        analytics.itemOrderTotals.data[item.id] = {
          name: item.name,
          orders: 1,
          totalRevenue: item.price,
        };
      } else {
        analytics.itemOrderTotals.data[item.id].orders++;
        analytics.itemOrderTotals.data[item.id].totalRevnue += item.price;
      }
    });
  },
};
