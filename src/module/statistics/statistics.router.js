const express = require('express')
const router = express.Router()
const statisticsController = require('./statistics.contronller')

router.get('/getRevenueByDateRange', statisticsController.getRevenueByDateRange)

router.get('/getMonthlyRevenue', statisticsController.getMonthlyRevenue)

router.get('/getYearlyRevenue', statisticsController.getYearlyRevenue)

router.get('/getYearlyPercentageOfSales', statisticsController.getYearlyPercentageOfSales)

router.get('/getDateRangePercentageOfSales', statisticsController.getDateRangePercentageOfSales)

router.get('/getMonthlyPercentageOfSales', statisticsController.getMonthPercentageOfSales)

router.get('/getQuarterlyRevenue', statisticsController.getQuarterlyRevenue);

router.get('/getQuaterPercentOfSales', statisticsController.getQuaterPercentOfSales);

module.exports = router

/**
 * @swagger
 * tags:
 *   - name: Statistic
 *     description: API thống kê doanh thu
 */

/**
 * @swagger
 * /api/statistics/getRevenueByDateRange:
 *   get:
 *     summary: Thống kê doanh thu theo ngày tùy chọn
 *     tags: [Statistic]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *         description: ngày bắt đầu
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *         description: ngày kết thúc
 *     responses:
 *       200:
 *         description: Thống kê doanh thu theo ngày tùy chọn tương ứng
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties: 
 *                 totalRevenue: 
 *                   type: number
 *                 year: 
 *                   type: number
 *                 month: 
 *                   type: number
 *                 day: 
 *                   type: number
 *       400:
 *         description: Dữ liệu gửi lên không hợp lệ
 */

/**
 * @swagger
 * /api/statistics/getMonthlyRevenue:
 *   get:
 *     summary: Thống kê doanh thu theo tháng
 *     tags: [Statistic]
 *     parameters:
 *       - in: query
 *         name: year
 *         required: true
 *         schema:
 *           type: number
 *         description: Năm
 *     responses:
 *       200:
 *         description: Thống kê doanh thu theo tháng tương ứng
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties: 
 *                 totalRevenue: 
 *                   type: number
 *                 year: 
 *                   type: number
 *                 month: 
 *                   type: number
 *       400:
 *         description: Dữ liệu gửi lên không hợp lệ
 */

/**
 * @swagger
 * /api/statistics/getYearlyRevenue:
 *   get:
 *     summary: Thống kê doanh thu theo năm
 *     tags: [Statistic]
 *     responses:
 *       200:
 *         description: Thống kê doanh thu theo năm tương ứng
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties: 
 *                 totalRevenue: 
 *                   type: number
 *                 year: 
 *                   type: number
 *       400:
 *         description: Dữ liệu gửi lên không hợp lệ
 */

/**
 * @swagger
 * /api/statistics/getQuarterlyRevenue:
 *   get:
 *     summary: Thống kê doanh thu theo quý
 *     tags: [Statistic]
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: string
 *         description: năm
 *     responses:
 *       200:
 *         description: Thống kê doanh thu theo quý
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: 
 *                 properties: 
 *                   year: 
 *                     type: string
 *                   quarter: 
 *                     type: number
 *                   totalRevenue:
 *                     type: number
 *                   orderCount: 
 *                     type: number
 *       400:
 *         description: Dữ liệu gửi lên không hợp lệ
 */

/**
 * @swagger
 * /api/statistics/getYearlyPercentageOfSales:
 *   get:
 *     summary: Thống kê tỉ lệ sản phẩm bán ra theo năm
 *     tags: [Statistic]
 *     responses:
 *       200:
 *         description: Thống kê tỉ lệ sản phẩm bán ra theo năm tương ứng
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 properties: 
 *                   totalQuantitySold: 
 *                     type: number
 *                     description: tổng số sản phẩm bán ra theo danh mục của một năm
 *                   statistics: 
 *                     type: array
 *                     items:
 *                       properties:
 *                         categoryName: 
 *                           type: string
 *                           description: tên danh mục
 *                         totalQuantitySold: 
 *                           type: number
 *                           description: tổng số sản phẩm bán ra theo danh mục
 *                         salesPercentage: 
 *                           type: number
 *                           description: tỉ lệ % bán ra
 *                   year: 
 *                     type: number
 *       400:
 *         description: Dữ liệu gửi lên không hợp lệ
*/

/**
 * @swagger
 * /api/statistics/getDateRangePercentageOfSales:
 *   get:
 *     summary: Thống kê doanh thu theo ngày tùy chọn
 *     tags: [Statistic]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *         description: ngày bắt đầu
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *         description: ngày kết thúc
 *     responses:
 *       200:
 *         description: Thống kê tỉ lệ bán ra theo ngày tùy chọn tương ứng
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties: 
 *                 totalRevenue: 
 *                   type: number
 *                 year: 
 *                   type: number
 *                 month: 
 *                   type: number
 *                 day: 
 *                   type: number
 *       400:
 *         description: Dữ liệu gửi lên không hợp lệ
*/

/**
 * @swagger
 * /api/statistics/getMonthlyPercentageOfSales:
 *   get:
 *     summary: Thống kê tỉ lệ bán ra theo tháng
 *     tags: [Statistic]
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: string
 *         description: năm
 *     responses:
 *       200:
 *         description: Thống kê tỉ lệ bán ra theo tháng
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 properties: 
 *                   monthlyTotalQuantity:
 *                     type: number
 *                     description: tổng số sản phẩm bán ra theo danh mục của một tháng
 *                     example: 12
 *                   statistics: 
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         categoryName: 
 *                           type: string
 *                           description: tên danh mục
 *                           example: áo sơ mi
 *                         totalQuantitySold: 
 *                           type: number
 *                           description: tổng số sản phẩm bán ra theo danh mục
 *                           example: 5
 *                         salesPercentage: 
 *                           type: number
 *                           description: tỉ lệ % bán ra
 *                           example: 20
 *                   year: 
 *                     type: number
 *                   month: 
 *                     type: number
 *       400:
 *         description: Dữ liệu gửi lên không hợp lệ
*/

/**
 * @swagger
 * /api/statistics/getQuaterPercentOfSales:
 *   get:
 *     summary: Thống kê tỉ lệ sản phẩm bán ra theo quý
 *     tags: [Statistic]
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: string
 *         description: năm
 *     responses:
 *       200:
 *         description: Thống kê tỉ lệ sản phẩm bán ra theo quý
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: 
 *                 properties: 
 *                   year: 
 *                     type: string
 *                   quarter: 
 *                     type: number
 *                   totalRevenue:
 *                     type: number
 *                   orderCount: 
 *                     type: number
 *       400:
 *         description: Dữ liệu gửi lên không hợp lệ
 */
