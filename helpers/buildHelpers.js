// Require dependencies
const moment = require('moment');

module.exports = {
  async buildAllCustomers(analytics, customers) {
    for (const key in customers) {
      const completed = moment(customers[key].lastOrderDate);
      const now = moment(Date.now());
      const diffInDays = now.diff(completed, 'days');

      analytics.totalCustomers++;

      if (diffInDays <= 30) {
        analytics.totalCustomersLast30Days++;
      }

      if (diffInDays <= 60) {
        analytics.totalCustomersLast60Days++;
      }

      if (diffInDays <= 90) {
        analytics.totalCustomersLast90Days++;
      }

      const customer = Object.assign({}, customers[key], {
        userName: key,
      });
      analytics.allCustomers.push(customer);
    }

    analytics.allCustomers.sort((a, b) => {
      const nameA = a.userName.toLowerCase();
      const nameB = b.userName.toLowerCase();
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }

      // names must be equal
      return 0;
    });
  },

  async buildTopNCustomersByCriteria(analytics, customers, numCustomers, criteria) {
    const capitalized = criteria.charAt(0).toUpperCase() + criteria.slice(1);
    const result = analytics.allCustomers
      .sort((a, b) => {
        if (a[criteria] < b[criteria]) {
          return 1;
        }
        if (a[criteria] > b[criteria]) {
          return -1;
        }

        // names must be equal
        return 0;
      });

    analytics[`top${numCustomers}CustomersBy${capitalized}`] = result.slice(0, numCustomers);
  },
};
