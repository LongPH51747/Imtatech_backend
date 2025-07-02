const Order = require("../order/order.model");

/**
 * Tính tổng doanh thu từ các đơn hàng đã hoàn thành trong một khoảng thời gian.
 * @param {Date} startDate - Ngày bắt đầu
 * @param {Date} endDate - Ngày kết thúc
 * @returns {Promise<number>} - Trả về tổng doanh thu.
 */

exports.getRevenueByDateRange = async (startDate, endDate) => {
  try {
    // endDate.setDate(endDate.getDate() + 1);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    const result = await Order.aggregate([
      {
        $match: {
          status: { $in: ["Giao thành công", "Đã nhận"] },
          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          totalRevenue: { $sum: "$sub_total_amount" },
        },
      },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$_id.month",
          day: "$_id.day",
          totalRevenue: 1,
        },
      },
      {
        $sort: {
          year: 1,
          month: 1,
          day: 1,
        },
      },
    ]);
    if (result.length > 0) {
      return result;
    }
    return 0;
  } catch (error) {
    console.log(
      "Error in statistics.services -> getRevenueByDateRange: ",
      error
    );
    throw new Error("Có lỗi đã xảy ra khi tính toán doanh thu");
  }
};

exports.getMonthlyRevenue = async (year) => {
  try {
    const result = await Order.aggregate([
      //B1: Tìm các đơn hàng theo năm có status là Giao thành công hoặc đã nhận
      {
        $match: {
          status: { $in: ["Giao thành công", "Đã nhận"] },
          createdAt: {
            $gte: new Date(`${year}-01-01T00:00:00.000z`),
            $lt: new Date(`${year + 1}-01-01T00:00:00.000z`),
          },
        },
      },
      //B2: Nhóm các đơn hàng theo năm và tháng
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          totalRevenue: { $sum: "$sub_total_amount" },
        },
      },
      //B3: Định dạng lại output
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$_id.month",
          totalRevenue: 1,
        },
      },
      //B4: Sắp xếp kết quả theo thời gian
      {
        $sort: {
          year: 1,
          month: 1,
        },
      },
    ]);

    const yearlyRevenue = await Order.aggregate([
      {
        $match: {
          status: { $in: ["Giao thành công", "Đã nhận"] },
          createdAt: {
            $gte: new Date(`${year}-01-01T00:00:00.000z`),
            $lt: new Date(`${year + 1}-01-01T00:00:00.000z`),
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
          },
          totalRevenue: { $sum: "$sub_total_amount" },
        },
      },
    ]);

    if (yearlyRevenue.length > 0 || result.length > 0) {
      return { yearlyRevenue: yearlyRevenue[0]?.totalRevenue || 0, result };
    }
    return 0;
  } catch (error) {
    console.log("Error in statistics.services -> getRevenueByMonth: ", error);
    throw new Error("Có lỗi đã xảy ra khi tính toán doanh thu");
  }
};

exports.getYearlyRevenue = async () => {
  try {
    const result = await Order.aggregate([
      //B1: Tìm các đơn hàng theo năm có status là Giao thành công hoặc đã nhận
      {
        $match: {
          status: { $in: ["Giao thành công", "Đã nhận"] },
        },
      },
      //B2: Nhóm các đơn hàng theo năm
      {
        $group: {
          _id: {
            $year: "$createdAt",
          },
          totalRevenue: { $sum: "$sub_total_amount" },
        },
      },
      //B3: Định dạng lại output
      {
        $project: {
          _id: 0,
          year: "$_id",
          totalRevenue: 1,
        },
      },
      //B4: Sắp xếp kết quả theo thời gian
      {
        $sort: {
          year: 1,
        },
      },
    ]);
    if (result.length > 0) {
      return result;
    }
    return 0;
  } catch (error) {
    console.log("Error in statistics.services -> getRevenueByMonth: ", error);
    throw new Error("Có lỗi đã xảy ra khi tính toán doanh thu");
  }
};

exports.getYearlyPercentageOfSales = async () => {
  try {
    const result = await Order.aggregate([
      //B1: Tìm các đơn hàng theo năm có status là Giao thành công hoặc đã nhận
      {
        $match: {
          status: { $in: ["Giao thành công", "Đã nhận"] },
        },
      },
      //B2: Mở mảng order item
      {
        $unwind: "$orderItems",
      },
      //B3: Nhóm id_cate
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            categoryId: "$orderItems.cate_name",
          },
          quantityPerCategory: { $sum: "$orderItems.quantity" },
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "_id.categoryId",
          foreignField: "_id",
          as: "categoryDetails",
        },
      },
      { $unwind: "$categoryDetails" },
      {
        $group: {
          _id: "$_id.year",
          yearlyTotalQuantity: { $sum: "$quantityPerCategory" },
          categories: {
            $push: {
              categoryId: "$_id.categoryId",
              categoryName: "$categoryDetails.name",
              totalQuantitySold: "$quantityPerCategory",
            },
          },
        },
      },
      { $unwind: "$categories" },
      {
        $project: {
          _id: 0,
          year: "$_id",
          yearlyTotalQuantity: 1,
          categoryInfo: {
            categoryId: "$categories.categoryId",
            categoryName: "$categories.categoryName",
            totalQuantitySold: "$categories.totalQuantitySold",
            salesPercentage: {
              $round: [
                {
                  $multiply: [
                    {
                      $divide: [
                        "$categories.totalQuantitySold",
                        "$yearlyTotalQuantity",
                      ],
                    },
                    100,
                  ],
                },
                2,
              ],
            },
          },
        },
      },
      {
        $group: {
          _id: "$year",
          yearlyTotalQuantity: { $first: "$yearlyTotalQuantity" },
          statistics: { $push: "$categoryInfo" },
        },
      },
      {
        $project: {
          _id: 0,
          year: "$_id",
          yearlyTotalQuantity: 1,
          statistics: 1,
        },
      },
      { $sort: { year: 1 } },
    ]);

    return result;
  } catch (error) {
    console.log(
      "Error in statistics.services -> getYearlyPercentageOfSales: ",
      error
    );
    throw new Error("Có lỗi đã xảy ra khi tính toán tỉ lệ bán ra");
  }
};

exports.getMonthlyPercentageOfSales = async (year) => {
  try {
    const result = await Order.aggregate([
      {
        $match: {
          status: { $in: ["Giao thành công", "Đã nhận"] },
          createdAt: {
            $gte: new Date(`${year}-01-01T00:00:00.000z`),
            $lt: new Date(`${year + 1}-01-01T00:00:00.000z`),
          },
        },
      },
      { $unwind: "$orderItems" },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            categoryId: "$orderItems.cate_name",
          },
          quantityPerCategory: { $sum: "$orderItems.quantity" },
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "_id.categoryId",
          foreignField: "_id",
          as: "categoryDetail",
        },
      },
      {
        $unwind: "$categoryDetail",
      },
      {
        $group: {
          _id: {
            year: "$_id.year",
            month: "$_id.month",
          },
          monthlyTotalQuantity: { $sum: "$quantityPerCategory" },
          categories: {
            $push: {
              categoryId: "$_id.categoryId",
              categoryName: "$categoryDetail.name",
              totalQuantitySold: "$quantityPerCategory",
            },
          },
        },
      },
      { $unwind: "$categories" },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$_id.month",
          monthlyTotalQuantity: 1,
          categoryInfo: {
            categoryId: "$categories.categoryId",
            categoryName: "$categories.categoryName",
            totalQuantitySold: "$categories.totalQuantitySold",
            salesPercentage: {
              $round: [
                {
                  $multiply: [
                    {
                      $divide: [
                        "$categories.totalQuantitySold",
                        "$monthlyTotalQuantity",
                      ],
                    },
                    100,
                  ],
                },
                2,
              ],
            },
          },
        },
      },
      {
        $group: {
          _id: {
            year: "$year",
            month: "$month",
          },
          monthlyTotalQuantity: { $first: "$monthlyTotalQuantity" },
          statistics: { $push: "$categoryInfo" },
        },
      },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$_id.month",
          monthlyTotalQuantity: 1,
          statistics: 1,
        },
      },
      { $sort: { year: 1, month: 1 } },
    ]);

    return result;
  } catch (error) {
    console.log(
      "Error in statistics.services -> getMonthlyPercentageOfSales: ",
      error
    );
    throw new Error("Có lỗi đã xảy ra khi tính toán tỉ lệ bán ra");
  }
};

exports.getDateRangePercentageOfSales = async (startDate, endDate) => {
  try {
    startDate.setHours(0,0,0,0)
    endDate.setHours(23,59,59,999)
     const orders = await Order.aggregate([
      {
        $match: {
          status: { $in: ["Giao thành công", "Đã giao"] }, // Trạng thái đơn hàng
          orderDate: { $gte: new Date(startDate), $lte: new Date(endDate) }, // Lọc theo ngày
        },
      },
      {
        $unwind: "$orderItem", // Mở rộng orderItems
      },
      {
        $group: {
          _id: "$orderItems.cate_name", // Group theo categoryId
          total_quantity: { $sum: "$orderItems.quantity" }, // Tính tổng số lượng sản phẩm bán ra theo từng danh mục
        },
      },
    ]);

    // Nếu không có đơn hàng nào thì trả về 0
    if (orders.length === 0) {
      return "Không có đơn hàng nào trong khoảng thời gian này";
    }

    // Truy vấn tổng số lượng sản phẩm bán ra trong danh mục (tất cả sản phẩm trong danh mục)
    const categoryTotalSales = await Order.aggregate([
      {
        $match: {
          status: { $in: ["Giao thành công", "Đã giao"] }, // Trạng thái đơn hàng
        },
      },
      {
        $unwind: "$orderItems", // Mở rộng orderItems
      },
      {
        $group: {
          _id: "$orderItems.cate_name", // Group theo categoryId
          total_quantity: { $sum: "$orderItems.quantity" }, // Tính tổng số lượng sản phẩm bán ra của tất cả các sản phẩm trong danh mục
        },
      },
    ]);

    // Tính tỉ lệ bán ra
    const salesRatio = orders.map(order => {
      const categorySale = categoryTotalSales.find(
        catSale => catSale._id.toString() === order._id.toString()
      );
      const ratio = categorySale
        ? (order.total_quantity / categorySale.total_quantity) * 100
        : 0;

      return {
        categoryId: order._id,
        salesRatio: ratio,
      };
    });

    return salesRatio;
  } catch (error) {
    console.log(
      "Error in statistics.services -> getDateRangePercentageOfSales: ",
      error
    );
    error.statuscode = 500;
    throw new Error("Lỗi trong quá trình tính toán tỉ lệ bán ra mỗi ngày");
  }
};
