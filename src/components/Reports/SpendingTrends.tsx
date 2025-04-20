import React, { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { useFinance } from "../../context/FinanceContext"
import { TransactionType } from "../../types"
import {
  format,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isSameDay,
  isSameWeek,
  isSameMonth,
} from "date-fns"

interface SpendingTrendsProps {
  dateRange: { startDate: Date; endDate: Date }
}

const SpendingTrends: React.FC<SpendingTrendsProps> = ({ dateRange }) => {
  const { transactions } = useFinance()
  const [chartType, setChartType] = useState<"line" | "bar">("line")
  const [timeInterval, setTimeInterval] = useState<
    "daily" | "weekly" | "monthly"
  >("daily")

  // Filter transactions by date range
  const filteredTransactions = transactions.filter(
    (t) =>
      new Date(t.date) >= dateRange.startDate &&
      new Date(t.date) <= dateRange.endDate
  )

  // Prepare data for different time intervals
  const dailyData = useMemo(() => {
    const days = eachDayOfInterval({
      start: dateRange.startDate,
      end: dateRange.endDate,
    })

    return days.map((day) => {
      const dayTransactions = filteredTransactions.filter((t) =>
        isSameDay(t.date, day)
      )

      const income = dayTransactions
        .filter((t) => t.category.type === TransactionType.INCOME)
        .reduce((sum, t) => sum + t.amount, 0)

      const expense = dayTransactions
        .filter((t) => t.category.type === TransactionType.EXPENSE)
        .reduce((sum, t) => sum + t.amount, 0)

      return {
        date: format(day, "MMM dd"),
        income,
        expense,
        net: income - expense,
      }
    })
  }, [filteredTransactions, dateRange])

  const weeklyData = useMemo(() => {
    const weeks = eachWeekOfInterval(
      {
        start: dateRange.startDate,
        end: dateRange.endDate,
      },
      { weekStartsOn: 1 }
    )

    return weeks.map((week) => {
      const weekStart = startOfWeek(week, { weekStartsOn: 1 })
      const weekEnd = endOfWeek(week, { weekStartsOn: 1 })

      const weekTransactions = filteredTransactions.filter(
        (t) => new Date(t.date) >= weekStart && new Date(t.date) <= weekEnd
      )

      const income = weekTransactions
        .filter((t) => t.category.type === TransactionType.INCOME)
        .reduce((sum, t) => sum + t.amount, 0)

      const expense = weekTransactions
        .filter((t) => t.category.type === TransactionType.EXPENSE)
        .reduce((sum, t) => sum + t.amount, 0)

      return {
        date: `${format(weekStart, "MMM dd")} - ${format(weekEnd, "MMM dd")}`,
        income,
        expense,
        net: income - expense,
      }
    })
  }, [filteredTransactions, dateRange])

  const monthlyData = useMemo(() => {
    const months = eachMonthOfInterval({
      start: dateRange.startDate,
      end: dateRange.endDate,
    })

    return months.map((month) => {
      const monthStart = startOfMonth(month)
      const monthEnd = endOfMonth(month)

      const monthTransactions = filteredTransactions.filter(
        (t) => new Date(t.date) >= monthStart && new Date(t.date) <= monthEnd
      )

      const income = monthTransactions
        .filter((t) => t.category.type === TransactionType.INCOME)
        .reduce((sum, t) => sum + t.amount, 0)

      const expense = monthTransactions
        .filter((t) => t.category.type === TransactionType.EXPENSE)
        .reduce((sum, t) => sum + t.amount, 0)

      return {
        date: format(month, "MMM yyyy"),
        income,
        expense,
        net: income - expense,
      }
    })
  }, [filteredTransactions, dateRange])

  // Get the appropriate data based on selected time interval
  const getData = () => {
    switch (timeInterval) {
      case "daily":
        return dailyData
      case "weekly":
        return weeklyData
      case "monthly":
        return monthlyData
      default:
        return dailyData
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <Tabs
            value={chartType}
            onValueChange={(value) => setChartType(value as "line" | "bar")}
          >
            <TabsList>
              <TabsTrigger value="line">Line Chart</TabsTrigger>
              <TabsTrigger value="bar">Bar Chart</TabsTrigger>
            </TabsList>
          </Tabs>

          <Tabs
            value={timeInterval}
            onValueChange={(value) =>
              setTimeInterval(value as "daily" | "weekly" | "monthly")
            }
          >
            <TabsList>
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="h-[400px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "line" ? (
              <LineChart data={getData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => `$${value.toFixed(2)}`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="income"
                  name="Income"
                  stroke="#8BC34A"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="expense"
                  name="Expense"
                  stroke="#FF5252"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="net"
                  name="Net"
                  stroke="#03A9F4"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            ) : (
              <BarChart data={getData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => `$${value.toFixed(2)}`}
                />
                <Legend />
                <Bar dataKey="income" name="Income" fill="#8BC34A" />
                <Bar dataKey="expense" name="Expense" fill="#FF5252" />
                <Bar dataKey="net" name="Net" fill="#03A9F4" />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export default SpendingTrends
