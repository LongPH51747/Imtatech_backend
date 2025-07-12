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
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          totalRevenue: { $sum: "$sub_total_amount" },
        },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          totalRevenue: 1,
        },
      },
      {
        $sort: {
          date: 1,
        },
      },
    ]);
    return result;
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
    return result;
  } catch (error) {
    console.log("Error in statistics.services -> getRevenueByMonth: ", error);
    throw new Error("Có lỗi đã xảy ra khi tính toán doanh thu");
  }
};

exports.getRevenueByQuarter = async (year) => {
  try {
    const result = await Order.aggregate([
      // BƯỚC 1: Lọc ra các đơn hàng đã thành công để tính doanh thu
      // Chỉ tính doanh thu từ các đơn hàng đã giao thành công hoặc đã được nhận.
      {
        $match: {
          status: { $in: ["Giao thành công", "Đã nhận"] },
          createdAt: {
            $gte: new Date(`${year}-01-01T00:00:00.000z`),
            $lte: new Date(`${year + 1}-01-01T00:00:00.000z`),
          },
          // Bạn cũng có thể thêm điều kiện is_Paid: true nếu muốn tính doanh thu thực nhận
          // is_Paid: true
        },
      },

      // BƯỚC 2: Nhóm các đơn hàng theo Năm và Quý
      {
        $group: {
          _id: {
            // Lấy ra năm từ ngày tạo đơn hàng
            year: { $year: "$createdAt" },

            // Xác định quý (quarter) dựa trên tháng
            // Dùng $cond để tạo logic if-then-else
            quarter: {
              $cond: [
                { $lte: [{ $month: "$createdAt" }, 3] }, // Nếu tháng <= 3
                1, // Thì là Quý 1
                {
                  $cond: [
                    { $lte: [{ $month: "$createdAt" }, 6] }, // Nếu tháng <= 6
                    2, // Thì là Quý 2
                    {
                      $cond: [
                        { $lte: [{ $month: "$createdAt" }, 9] }, // Nếu tháng <= 9
                        3, // Thì là Quý 3
                        4, // Ngược lại là Quý 4
                      ],
                    },
                  ],
                },
              ],
            },
          },
          // Tính tổng doanh thu cho mỗi nhóm (quý)
          // Sử dụng total_amount hoặc sub_total_amount tùy theo logic kinh doanh của bạn
          totalRevenue: { $sum: "$sub_total_amount" },

          // Đếm số lượng đơn hàng trong mỗi quý
          orderCount: { $sum: 1 },
        },
      },

      // BƯỚC 3: Định dạng lại kết quả đầu ra cho đẹp và dễ sử dụng
      {
        $project: {
          _id: 0, // Bỏ trường _id không cần thiết
          year: "$_id.year",
          quarter: "$_id.quarter",
          totalRevenue: "$totalRevenue",
          orderCount: "$orderCount",
        },
      },

      // BƯỚC 4: Sắp xếp kết quả theo năm và quý tăng dần để dễ theo dõi
      {
        $sort: {
          year: 1,
          quarter: 1,
        },
      },
    ]);

    return result;
  } catch (error) {
    console.error("Error in getRevenueByQuarter service: ", error);
    throw new Error("Có lỗi xảy ra khi thống kê doanh thu theo quý.");
  }
};

//thống kê tỉ lệ sản phẩm bán ra theo danh mục
exports.getYearlyPercentageOfSales = async () => {
  try {
    const result = await Order.aggregate([
      // B1: Lọc các đơn hàng đã hoàn thành (ĐÚNG)
      {
        $match: {
          status: { $in: ["Giao thành công", "Đã nhận"] },
        },
      },
      // B2: Mở mảng orderItems để xử lý từng sản phẩm (ĐÚNG)
      {
        $unwind: "$orderItems",
      },
      // B4: Nhóm lại để tính tổng số lượng bán ra cho MỖI CATEGORY trong MỖI NĂM
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            // Bây giờ "$orderItems.cate_name" là một ObjectId duy nhất và đúng
            categoryName: "$orderItems.cate_name",
          },
          quantityPerCategory: { $sum: "$orderItems.quantity" },
        },
      },

      // B5: Lookup để lấy tên category.
      // SỬA LỖI: Không cần bước $toObjectId nữa. Lookup trực tiếp.
      // {
      //   $lookup: {
      //     from: "categories", // Tên collection của category
      //     localField: "_id.categoryName",
      //     foreignField: "_id",
      //     as: "categoryDetails",
      //   },
      // },

      // Nếu không tìm thấy category (bị xóa,...), ta sẽ loại bỏ nó để tránh lỗi
      // Dùng $match để chỉ giữ lại những kết quả có categoryDetails không rỗng
      // {
      //   $match: { categoryDetails: { $ne: [] } },
      // },
      // Sau đó unwind để lấy object category ra
      // {
      //   $unwind: "$categoryDetails",
      // },

      // B6: Nhóm lại một lần nữa chỉ theo NĂM để tính tổng của cả năm
      {
        $group: {
          _id: "$_id.year",
          yearlyTotalQuantity: { $sum: "$quantityPerCategory" },
          categoriesData: {
            $push: {
              categoryName: "$_id.categoryName",
              totalQuantitySold: "$quantityPerCategory",
            },
          },
        },
      },

      // B7: Mở mảng categoriesData để tính toán phần trăm cho từng category
      {
        $unwind: "$categoriesData",
      },

      // B8: Định dạng lại kết quả cuối cùng, tính toán phần trăm
      {
        $project: {
          _id: 0,
          year: "$_id",
          yearlyTotalQuantity: 1,
          categoryInfo: {
            categoryName: "$categoriesData.categoryName",
            totalQuantitySold: "$categoriesData.totalQuantitySold",
            salesPercentage: {
              $round: [
                {
                  $multiply: [
                    {
                      $divide: [
                        "$categoriesData.totalQuantitySold",
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

      // B9: Nhóm lại lần cuối theo năm để có cấu trúc như mong muốn
      {
        $group: {
          _id: "$year",
          yearlyTotalQuantity: { $first: "$yearlyTotalQuantity" },
          statistics: { $push: "$categoryInfo" },
        },
      },

      // B10: Định dạng lại và sắp xếp
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
            categoryName: "$orderItems.cate_name",
          },
          quantityPerCategory: { $sum: "$orderItems.quantity" },
        },
      },
      // {
      //   $lookup: {
      //     from: "categories",
      //     localField: "_id.categoryName",
      //     foreignField: "_id",
      //     as: "categoryDetails",
      //   },
      // },
      // {
      //   $unwind: "$categoryDetails",
      // },
      {
        $group: {
          _id: {
            year: "$_id.year",
            month: "$_id.month",
          },
          monthlyTotalQuantity: { $sum: "$quantityPerCategory" },
          categories: {
            $push: {
              categoryName: "$_id.categoryName",
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
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    const orders = await Order.aggregate([
      {
        $match: {
          status: { $in: ["Giao thành công", "Đã nhận"] }, // Trạng thái đơn hàng
          createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }, // Lọc theo ngày
        },
      },
      {
        $unwind: "$orderItems", // Mở rộng orderItems
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
          _id: "$orderItems.cate_name.category_name", // Group theo categoryId
          total_quantity: { $sum: "$orderItems.quantity" }, // Tính tổng số lượng sản phẩm bán ra của tất cả các sản phẩm trong danh mục
        },
      },
    ]);

    // Tính tỉ lệ bán ra
    const salesRatio = orders.map((order) => {
      const categorySale = categoryTotalSales.find(
        (catSale) => catSale._id.toString() === order._id.toString()
      );
      const ratio = categorySale
        ? (order.total_quantity / categorySale.total_quantity) * 100
        : 0;

      return {
        categoryName: order._id,
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

exports.getQuaterPercentOfSales = async (year) => {
  try {
    console.log("year", year);
    const result = await Order.aggregate([
      // --- Giai đoạn 1: Lọc các đơn hàng ---
      {
        $match: {
          status: { $in: ["Giao thành công", "Đã nhận"] },
          createdAt: {
            $gte: new Date(`${year}-01-01T00:00:00.000z`),
            $lte: new Date(`${year + 1}-01-01T00:00:00.000z`),
          },
        },
      },
      // --- Giai đoạn 2: Tách mảng orderItems để xử lý từng sản phẩm ---
      {
        $unwind: "$orderItems",
      },

      // --- Giai đoạn 4: Nhóm theo Quý, Năm và Danh mục để tính tổng số lượng ---
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            quarter: {
              $cond: [
                { $lte: [{ $month: "$createdAt" }, 3] }, // Nếu tháng <= 3
                1, // Thì là Quý 1
                {
                  $cond: [
                    { $lte: [{ $month: "$createdAt" }, 6] }, // Nếu tháng <= 6
                    2, // Thì là Quý 2
                    {
                      $cond: [
                        { $lte: [{ $month: "$createdAt" }, 9] }, // Nếu tháng <= 9
                        3, // Thì là Quý 3
                        4, // Ngược lại là Quý 4
                      ],
                    },
                  ],
                },
              ],
            },
            category: "$orderItems.cate_name",
          },
          // Tính tổng số lượng sản phẩm bán ra cho danh mục này trong quý này
          totalQuantitySold: { $sum: "$orderItems.quantity" },
        },
      },
      // --- Giai đoạn 5: Nhóm lại theo Quý và Năm để tính tổng của cả quý ---
      {
        $group: {
          _id: {
            year: "$_id.year",
            quarter: "$_id.quarter",
          },
          // Tính tổng số lượng bán ra của TẤT CẢ các danh mục trong quý
          totalQuarterlyQuantity: { $sum: "$totalQuantitySold" },
          // Thu thập thông tin chi tiết của từng danh mục vào một mảng
          categoryBreakdown: {
            $push: {
              categoryName: "$_id.category",
              quantity: "$totalQuantitySold",
            },
          },
        },
      },
      // --- Giai đoạn 6: Thêm trường tỷ lệ phần trăm ---,
      {
        $addFields: {
          // Dùng $map để lặp qua mảng categoryBreakdown và tính toán tỷ lệ
          statistics: {
            $map: {
              input: "$categoryBreakdown",
              as: "category",
              in: {
                categoryName: "$$category.categoryName",
                quantitySold: "$$category.quantity",
                percentage: {
                  $round: [
                    // Làm tròn đến 2 chữ số thập phân
                    {
                      $multiply: [
                        {
                          $divide: [
                            "$$category.quantity",
                            "$totalQuarterlyQuantity",
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
        },
      },
      // --- Giai đoạn 7: Định dạng lại kết quả cuối cùng ---
      {
        $project: {
          _id: 0, // Bỏ trường _id mặc định
          year: "$_id.year",
          quarter: "$_id.quarter",
          totalQuarterlyQuantity: 1,
          statistics: 1,
        },
      },

      // --- Giai đoạn 8: Sắp xếp kết quả, mới nhất lên đầu ---
      {
        $sort: {
          year: 1,
          quarter: 1,
        },
      },
    ]);

    return result;
  } catch (error) {
    console.error("Error in getQuaterPercentOfSales service: ", error);
    throw new Error("Có lỗi xảy ra khi thống kê tỉ lệ bán ra theo quý.");
  }
};
