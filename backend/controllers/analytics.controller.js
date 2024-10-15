import prisma from "../config/prisma.js";

export const getAnalyticsData = async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalProducts = await prisma.product.count();

    const orders = await prisma.order.findMany({
      select: {
        items: true,
      },
    });

    const salesData = orders.reduce(
      (acc, order) => {
        const items = order.items;
        const totalAmount = items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );

        return {
          totalSales: acc.totalSales + 1,
          totalRevenue: acc.totalRevenue + totalAmount,
        };
      },
      { totalSales: 0, totalRevenue: 0 }
    );

    const { totalSales, totalRevenue } = salesData;

    return {
      totalUsers,
      totalProducts,
      totalSales,
      totalRevenue,
    };
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const getDailySalesData = async (startDate, endDate) => {
  try {
    const dailySalesData = await prisma.$queryRaw`
      SELECT
        DATE("createdAt") AS date,
        COUNT(*) AS sales,
        SUM((item->>'price')::numeric * (item->>'quantity')::integer) AS revenue
      FROM
        "Order",
        jsonb_array_elements(items) AS item
      WHERE
        "createdAt" >= ${startDate} AND "createdAt" <= ${endDate}
      GROUP BY
        DATE("createdAt")
      ORDER BY
        DATE("createdAt");
    `;

    dailySalesData.forEach((item) => {
      item.sales = item.sales.toString();
      item.date = item.date.toISOString().slice(0, 10);
    });

    const dateArray = getDatesInRange(startDate, endDate);

    return dateArray.map((date) => {
      const foundData = dailySalesData.find((item) => item.date === date);
      return {
        date,
        sales: foundData?.sales || 0,
        revenue: parseFloat(foundData?.revenue) || 0,
      };
    });
  } catch (error) {
    throw error;
  }
};

function getDatesInRange(startDate, endDate) {
  const dates = [];
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    dates.push(currentDate.toISOString().split("T")[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
}
