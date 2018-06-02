// Widget helpers functions
// These functions are called after updateHelpers and buildHelpers
// and reformat calculated data in a manner digestable by chart.js
module.exports = {

  buildItemOrderTotals(analytics) {
    for (let key in analytics.itemOrderTotals.data) {
      const item = analytics.itemOrderTotals.data[key];
      analytics.itemOrderTotals.widgetData.datasets[0].data.push(item.orders );
      analytics.itemOrderTotals.widgetData.labels.push(item.name);
    }
  },

  buildTotalRevenueByMonth(analytics) {
    for (let key in analytics.totalRevenueByMonth.data) {
      const month = analytics.totalRevenueByMonth.data[key];
      analytics.totalRevenueByMonth.widgetData.datasets[0].data.push(month);
      analytics.totalRevenueByMonth.widgetData.labels.push(key);
    }
  },

  buildTotalRevenueByDayOfWeek(analytics) {
    for (let key in analytics.totalRevenueByDayOfWeek.data) {
      const day = analytics.totalRevenueByDayOfWeek.data[key];
      analytics.totalRevenueByDayOfWeek.widgetData.datasets[0].data.push(day );
      analytics.totalRevenueByDayOfWeek.widgetData.labels.push(key);
    }
  },
};
