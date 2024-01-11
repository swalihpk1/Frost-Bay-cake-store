const Orders = require("../models/ordersModel")

// -------Dashboards------
const dashboard = async (req, res) => {
    try {
        const adminEmail = process.env.ADMIN_EMAIL.trim();
        const adminName = process.env.ADMIN_NAME.trim();

         // -----------------------Payment method percentages------------------
         const paymentMethodPercentagePipeline = [
            {
                $group: {
                    _id: {
                        $cond: {
                            if: { $eq: ["$paymentMethod", "razorpay"] },
                            then: "onlinePayment",
                            else: "$paymentMethod",
                        },
                    },
                    count: { $sum: 1 },
                },
            },
            {
                $project: {
                    _id: 0,
                    paymentMethod: "$_id",
                    count: 1,
                },
            },
        ];
        
        const paymentMethodPercentageResult = await Orders.aggregate(paymentMethodPercentagePipeline).exec();
        const totalOrders = paymentMethodPercentageResult.reduce((total, method) => total + method.count, 0);
        
        const paymentMethodPercentages = paymentMethodPercentageResult.map((method) => ({
            [method.paymentMethod]: ((method.count / totalOrders) * 100).toFixed(2),
        }));
        
        const allPaymentMethods = ["cashOnDelivery", "wallet", "onlinePayment"]; 
        const PaymentMethodPercentages = allPaymentMethods.map((method) => ({
            [method]: (paymentMethodPercentages.find((item) => item[method]) || { [method]: '0.00' })[method],
        }));
        
        console.log(PaymentMethodPercentages);




        // -----------------------Total Sales Amount------------------
        const totalDeliveredAmountPipeline = [
            {
                $match: {
                    "orderedProducts.status": "Delivered"
                }
            },
            {
                $group: {
                    _id: null,
                    totalDeliveredAmount: { $sum: "$totalAmount" }
                }
            }
        ];
        
        const totalDeliveredAmountResult = await Orders.aggregate(totalDeliveredAmountPipeline).exec();
        const totalDeliveredAmount = totalDeliveredAmountResult.length > 0 ? totalDeliveredAmountResult[0].totalDeliveredAmount : 0;
        
        console.log("Total Delivered Amount:", totalDeliveredAmount);




        const latestPlacedOrdersPipeline = [
            {
                $match: {
                    "orderedProducts.status": "Placed"
                }
            },
            {
                $sort: {
                    "createdAt": -1
                }
            },
          
        ];
        
        const latestPlacedOrders = await Orders.aggregate(latestPlacedOrdersPipeline).exec();
        
        console.log("Latest Placed Orders:", latestPlacedOrders);

        res.render('dashboard', {
            adminName: adminName,
            adminEmail: adminEmail,
            currentPath: "/admin/dashboard",
            PaymentMethodPercentages,
            totalDeliveredAmount,
            latestPlacedOrders
        });

    } catch (error) {
        console.log(error.message);
    }
}

const graphDetails = async (req, res) => {
    try {

        // -----------------------------------Monthly Income----------------------------
        const monthlySalesPipeline = [
            {
                $match: {
                    createdAt: {
                        $gte: new Date(new Date().getFullYear(), 0, 1),
                        $lt: new Date(new Date().getFullYear() + 1, 0, 1),
                    },
                },
            },
            {
                $unwind: "$orderedProducts",
            },
            {
                $match: {
                    "orderedProducts.status": "Delivered",
                },
            },
            {
                $group: {
                    _id: { month: { $month: '$createdAt' } },
                    totalAmount: { $sum: '$orderedProducts.productDetails.price' },
                    count: { $sum: 1 },
                },
            },
            {
                $project: {
                    _id: 0,
                    month: '$_id.month',
                    totalAmount: 1,
                    count: 1,
                },
            },
        ];

        const monthlySalesResult = await Orders.aggregate(monthlySalesPipeline).exec();

        // Prepare the output with all months
        const monthlySales = Array.from({ length: 12 }, (_, index) => {
            const monthData = monthlySalesResult.find((data) => data.month === index + 1);
            return {
                month: index + 1,
                total: monthData ? monthData.totalAmount : 0,
                count: monthData ? monthData.count : 0,
            };
        });

        console.log(monthlySales);


        // ------------------------------------Monthly Orders--------------------------------
        const monthlyOrdersPipeline = [
            {
                $match: {
                    createdAt: {
                        $gte: new Date(new Date().getFullYear(), 0, 1),
                        $lt: new Date(new Date().getFullYear() + 1, 0, 1),
                    },
                },
            },
            {
                $group: {
                    _id: { month: { $month: "$createdAt" } },
                    totalOrders: { $sum: 1 },
                },
            },
            {
                $project: {
                    _id: 0,
                    totalOrders: 1,
                    month: "$_id.month",
                },
            },
            {
                $group: {
                    _id: null,
                    monthlyOrdersDetails: { $push: "$$ROOT" },
                },
            },
            {
                $project: {
                    _id: 0,
                    monthlyOrdersDetails: 1,
                },
            },
        ];

        const monthlyOrdersResults = await Orders.aggregate(monthlyOrdersPipeline).exec();

        const monthlyOrders = Array.from({ length: 12 }, (_, index) => {
            const monthData = monthlyOrdersResults.length > 0 ? monthlyOrdersResults[0].monthlyOrdersDetails.find(data => data.month === index + 1) : null;
            return {
                month: index + 1,
                totalOrders: monthData ? monthData.totalOrders : 0,
            };
        });

        console.log(monthlyOrders);


        // ------------------------------------Yearly Sales------------------------------
        const yearlySalesPipeline = [
            {
                $match: {
                    createdAt: {
                        $gte: new Date("2016-01-01"), // Start date for the records you want
                        $lt: new Date(new Date().getFullYear() + 1, 0, 1),
                    },
                },
            },
            {
                $unwind: "$orderedProducts",
            },
            {
                $match: {
                    "orderedProducts.status": "Delivered",
                },
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                    },
                    totalAmount: { $sum: "$orderedProducts.productDetails.price" },
                    count: { $sum: 1 },
                },
            },
            {
                $project: {
                    _id: 0,
                    year: "$_id.year",
                    totalAmount: 1,
                    count: 1,
                },
            },
        ];

        const yearlySalesResult = await Orders.aggregate(yearlySalesPipeline).exec();

        // Prepare the output with all years
        const yearlySales = Array.from({ length: new Date().getFullYear() - 2016 + 1 }, (_, index) => {
            const yearData = yearlySalesResult.find((data) => data.year === 2016 + index);
            return {
                year: 2016 + index,
                total: yearData ? yearData.totalAmount : 0,
                count: yearData ? yearData.count : 0,
            };
        });

        console.log(yearlySales);





        // -----------------------------------------Yearly Orders------------------------------------
        const yearlyOrdersPipeline = [
            {
                $match: {
                    createdAt: {
                        $gte: new Date("2016-01-01"), // Start date for the records you want
                        $lt: new Date(new Date().getFullYear() + 1, 0, 1),
                    },
                },
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                    },
                    totalOrders: { $sum: 1 },
                },
            },
            {
                $project: {
                    _id: 0,
                    year: "$_id.year",
                    totalOrders: 1,
                },
            },
        ];

        const yearlyOrdersResult = await Orders.aggregate(yearlyOrdersPipeline).exec();

        // Prepare the output with all years
        const yearlyOrders = Array.from({ length: new Date().getFullYear() - 2016 + 1 }, (_, index) => {
            const yearData = yearlyOrdersResult.find((data) => data.year === 2016 + index);
            return {
                year: 2016 + index,
                totalOrders: yearData ? yearData.totalOrders : 0,
            };
        });

        console.log(yearlyOrders);


        // ---------------------Weekly Sales--------------------
        const weeklySalesPipeline = [
            {
                $match: {
                    createdAt: {
                        $gte: new Date("2016-01-01"), // Start date for the records you want
                        $lt: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 1),
                    },
                },
            },
            {
                $unwind: "$orderedProducts",
            },
            {
                $match: {
                    "orderedProducts.status": "Delivered",
                },
            },
            {
                $group: {
                    _id: {
                        dayOfWeek: { $dayOfWeek: "$createdAt" },
                    },
                    totalAmount: { $sum: "$orderedProducts.productDetails.price" },
                    count: { $sum: 1 },
                },
            },
            {
                $project: {
                    _id: 0,
                    dayOfWeek: "$_id.dayOfWeek",
                    totalAmount: 1,
                    count: 1,
                },
            },
            {
                $sort: {
                    dayOfWeek: 1,
                },
            },
        ];

        const weeklySalesResult = await Orders.aggregate(weeklySalesPipeline).exec();

        // Prepare the output with all days of the week
        const weeklySales = Array.from({ length: 7 }, (_, index) => {
            const dayData = weeklySalesResult.find((data) => data.dayOfWeek === (index + 1));
            return {
                dayOfWeek: index + 1, // Adjust day index as needed
                total: dayData ? dayData.totalAmount : 0,
                count: dayData ? dayData.count : 0,
            };
        });

        console.log(weeklySales);



        const weeklyOrdersPipeline = [
            {
                $match: {
                    createdAt: {
                        $gte: new Date("2016-01-01"),
                        $lt: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 1),
                    },
                },
            },
            {
                $group: {
                    _id: {
                        dayOfWeek: { $dayOfWeek: "$createdAt" },
                    },
                    totalOrders: { $sum: 1 },
                },
            },
            {
                $project: {
                    _id: 0,
                    dayOfWeek: "$_id.dayOfWeek",
                    totalOrders: 1,
                },
            },
            {
                $sort: {
                    dayOfWeek: 1,
                },
            },
        ];

        const weeklyOrdersResult = await Orders.aggregate(weeklyOrdersPipeline).exec();

        const weeklyOrders = Array.from({ length: 7 }, (_, index) => {
            const dayData = weeklyOrdersResult.find((data) => data.dayOfWeek === (index + 1));
            return {
                dayOfWeek: index + 1,
                totalOrders: dayData ? dayData.totalOrders : 0,
            };
        });

        console.log(weeklyOrders);

        res.json({
            monthlyOrders,
            monthlySales,
            yearlyOrders,
            yearlySales,
            weeklyOrders,
            weeklySales,
        });

    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    dashboard,
    graphDetails
}
