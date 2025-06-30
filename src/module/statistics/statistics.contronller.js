const statisticsServices = require("./statistics.services");

exports.getRevenueByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "startDate and endDate query parameters are required.",
      });
    }

    const revenue = await statisticsServices.getRevenueByDateRange(
      new Date(startDate),
      new Date(endDate)
    );

    return res.status(200).json(revenue);
  } catch (error) {
    res.status(500).json({ message: "Faile to get revenue" });
  }
};

exports.getMonthlyRevenue = async (req, res) => {
  try {
    const year = parseInt(req.query.year);
    if (!year) {
      return res.status(400).json({
        success: false,
        message: "year query parameters are required.",
      });
    }
    console.log("year: ", year);

    const revenue = await statisticsServices.getMonthlyRevenue(year);
    console.log("Revenue: ", revenue);

    return res.status(200).json(revenue);
  } catch (error) {
    res.status(500).json({ message: "Failed to get statistics revenue month" });
  }
};

exports.getYearlyRevenue = async (req, res) => {
  try {
    const revenue = await statisticsServices.getYearlyRevenue();
    console.log("Revenue: ", revenue);

    return res.status(200).json(revenue);
  } catch (error) {
    res.status(500).json({ message: "Failed to get statistics revenue year" });
  }
};

exports.getYearlyPercentageOfSales = async (req, res) => {
  try {
    const percentageOfSales =
      await statisticsServices.getYearlyPercentageOfSales();
    if (!percentageOfSales) {
      return res.status(404).json({ message: "Cannot found" });
    }
    return res.status(200).json(percentageOfSales);
  } catch (error) {
    res.status(500).json({ message: "Failed to getYearlyPercentageOfSales" });
  }
};

exports.getDateRangePercentageOfSales = async (req, res) => {
  try {
    const { startDate } = req.query;
    const { endDate } = req.query;
    const getDateRangePercentageOfSales =
      await statisticsServices.getDateRangePercentageOfSales(
        new Date(startDate),
        new Date(endDate)
      );
    if (!getDateRangePercentageOfSales) {
      return res.status(404).json({ message: "Cannot found" });
    }
    return res.status(200).json(getDateRangePercentageOfSales);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to getDateRangePercentageOfSales" });
  }
};
