const express = require('express')
const router = express.Router()
const statisticsController = require('./statistics.contronller')

router.get('/getRevenueByDateRange', statisticsController.getRevenueByDateRange)

router.get('/getMonthlyRevenue', statisticsController.getMonthlyRevenue)

router.get('/getYearlyRevenue', statisticsController.getYearlyRevenue)

router.get('/getYearlyPercentageOfSales', statisticsController.getYearlyPercentageOfSales)

router.get('/getDateRangePercentageOfSales', statisticsController.getDateRangePercentageOfSales)

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
 *               type: object
 *               properties: 
 *                 totalQuantitySold: 
 *                   type: number
 *                 year: 
 *                   type: number
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
