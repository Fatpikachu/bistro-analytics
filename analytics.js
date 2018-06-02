// Require dependencies
const moment = require('moment');

// Require db connection
const { db, Analysis } = require('./db/mongo.js');

// Require helper files
const updateHelpers = require('./helpers/updateHelpers');
const buildHelpers = require('./helpers/buildHelpers');
const widgetHelpers = require('./helpers/widgetHelpers');
const chartJsHelpers = require('./helpers/chartJsHelpers');

// Require DB models
const {
  Customer,
  MenuItem,
  Order,
} = require('./db/rds.js');

const analyticsData = null;

let customerDirectory = null;

const generateAnalyticsObject = () => {
  const defaultAnalyticsObject = {
    allCustomers: [],
    totalCustomers: 0,
    totalCustomersLast30Days: 0,
    totalCustomersLast60Days: 0,
    totalCustomersLast90Days: 0,
    totalRevenue: 0,
    totalRevenueLast30Days: 0,
    totalRevenueLast60Days: 0,
    totalRevenueByDayOfWeek: {
      data: {
        Monday: 0,
        Tuesday: 0,
        Wednesday: 0,
        Thursday: 0,
        Friday: 0,
        Saturday: 0,
        Sunday: 0,
      },
      widgetData: {
        datasets: [
          {
            label: null,
            data: [],
            backgroundColor: chartJsHelpers.colors,
          },
        ],
        labels: [],
      },
    },
    totalRevenueByMonth: {
      data: {
        Jan: 0,
        Feb: 0,
        Mar: 0,
        Apr: 0,
        May: 0,
        Jun: 0,
        Jul: 0,
        Aug: 0,
        Sep: 0,
        Oct: 0,
        Nov: 0,
        Dec: 0,
      },
      widgetData: {
        datasets: [
          {
            label: null,
            data: [],
            backgroundColor: chartJsHelpers.colors,
          },
        ],
        labels: [],
      },
    },
    itemOrderTotals: {
      data: {},
      widgetData: {
        datasets: [
          {
            data: [],
            backgroundColor: chartJsHelpers.colors,
          },
        ],
        labels: [],
      },
    },
    openOrders: [],
  };

  return defaultAnalyticsObject;
};

const analytics = {

  async fetchData(restaurant_id) {
    let analysis = await Analysis.find({ restaurantId: restaurant_id }).exec();
    return analysis;
  },

  async buildData(restaurant_id) {
    const analyticsData = generateAnalyticsObject();

    const orders = await Order.findAll({
      where: {
        RestaurantId: restaurant_id,
      },
      include: [
        {
          model: MenuItem,
          required: false,
        },
        {
          model: Customer,
          required: false,
        },
      ],
    });

    customerDirectory = {};

    await orders.forEach((order) => {
      // If order is not completed, push it to openOrders
      if (!order.completedAt) {
        analyticsData.openOrders.push(order);
      } else {
        updateHelpers.updateTotalRevenue(analyticsData, order);
        updateHelpers.updateTotalRevenueLastNDays(analyticsData, order, 30);
        updateHelpers.updateTotalRevenueLastNDays(analyticsData, order, 60);
        updateHelpers.updateTotalRevenueLastNDays(analyticsData, order, 90);
        updateHelpers.updateTotalRevenueByDayOfWeek(analyticsData, order);


        updateHelpers.updateTotalRevenueByDayOfWeek(analyticsData, order);
        updateHelpers.updateTotalRevenueByMonth(analyticsData, order);
        updateHelpers.updateCustomerDirectory(analyticsData, order, customerDirectory);
        updateHelpers.updateItemOrderTotals(analyticsData, order);
      }
    });

    await buildHelpers.buildAllCustomers(analyticsData, customerDirectory);
    await buildHelpers.buildTopNCustomersByCriteria(analyticsData, customerDirectory, 5, 'totalRevenue');
    await buildHelpers.buildTopNCustomersByCriteria(analyticsData, customerDirectory, 5, 'orders');

    widgetHelpers.buildItemOrderTotals(analyticsData, customerDirectory);
    widgetHelpers.buildTotalRevenueByMonth(analyticsData, customerDirectory);
    widgetHelpers.buildTotalRevenueByDayOfWeek(analyticsData, customerDirectory);

    const analysis = new Analysis({
      analytics: analyticsData,
    });

    Analysis.findOneAndUpdate({
      restaurantId: restaurant_id,
    }, analysis, { upsert: true }, (err, res) => {
      // Deal with the response data/error
      if (err) {
        console.log(err);
      }
    });
  },
};

module.exports = analytics;
