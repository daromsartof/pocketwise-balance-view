import React, { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"
import { useFinance } from "../../context/FinanceContext"
import { TransactionType } from "../../types"

interface CategoryBreakdownProps {
  dateRange: { startDate: Date; endDate: Date }
}

const CategoryBreakdown: React.FC<CategoryBreakdownProps> = ({ dateRange }) => {
  const { transactions, categories } = useFinance()

  // Filter transactions by date range and type
  const expenseTransactions = transactions.filter(
    (t) =>
      new Date(t.date) >= dateRange.startDate &&
      new Date(t.date) <= dateRange.endDate &&
      t.category.type.toLowerCase() === TransactionType.EXPENSE
  )

  const incomeTransactions = transactions.filter(
    (t) =>
      new Date(t.date) >= dateRange.startDate &&
      new Date(t.date) <= dateRange.endDate &&
      t.category.type.toLowerCase() === TransactionType.INCOME
  )

  // Group expenses by category
  const expenseData = useMemo(() => {
    const categoryMap = new Map()

    expenseTransactions.forEach((transaction) => {
      const { category, amount } = transaction
      const current = categoryMap.get(category.id) || 0
      categoryMap.set(category.id, current + amount)
    })

    const totalExpense = expenseTransactions.reduce(
      (sum, t) => sum + t.amount,
      0
    )

    return Array.from(categoryMap.entries())
      .map(([categoryId, amount]) => {
        const category = categories.find((c) => c.id === categoryId)
        const percentage =
          totalExpense > 0 ? ((amount as number) / totalExpense) * 100 : 0

        return {
          id: categoryId,
          name: category?.name || "Unknown",
          value: amount,
          color: category?.color || "#ccc",
          percentage: percentage.toFixed(1),
        }
      })
      .sort((a, b) => (b.value as number) - (a.value as number))
  }, [expenseTransactions, categories])

  // Group income by category
  const incomeData = useMemo(() => {
    const categoryMap = new Map()

    incomeTransactions.forEach((transaction) => {
      const { category, amount } = transaction
      const current = categoryMap.get(category.id) || 0
      categoryMap.set(category.id, current + amount)
    })

    const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0)

    return Array.from(categoryMap.entries())
      .map(([categoryId, amount]) => {
        const category = categories.find((c) => c.id === categoryId)
        const percentage =
          totalIncome > 0 ? ((amount as number) / totalIncome) * 100 : 0

        return {
          id: categoryId,
          name: category?.name || "Unknown",
          value: amount,
          color: category?.color || "#ccc",
          percentage: percentage.toFixed(1),
        }
      })
      .sort((a, b) => (b.value as number) - (a.value as number))
  }, [incomeTransactions, categories])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Category Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="expenses">
          <TabsList className="mb-6">
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="income">Income</TabsTrigger>
          </TabsList>

          <TabsContent value="expenses" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartDisplay title="Expense Distribution" data={expenseData} />

              <CategoryTable
                title="Top Expense Categories"
                data={expenseData}
                isExpense={true}
              />
            </div>
          </TabsContent>

          <TabsContent value="income" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartDisplay title="Income Sources" data={incomeData} />

              <CategoryTable
                title="Top Income Categories"
                data={incomeData}
                isExpense={false}
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

interface ChartDisplayProps {
  title: string
  data: any[]
}

const ChartDisplay: React.FC<ChartDisplayProps> = ({ title, data }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pie">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="pie" className="flex-1">
              Pie Chart
            </TabsTrigger>
            <TabsTrigger value="bar" className="flex-1">
              Bar Chart
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pie">
            <div className="h-[300px]">
              {data.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percentage }) =>
                        `${name}: ${percentage}%`
                      }
                    >
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any) => {
                        return typeof value === "number"
                          ? `$${value.toFixed(2)}`
                          : value
                      }}
                      labelFormatter={(name) => `Category: ${name}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No data for the selected period
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="bar">
            <div className="h-[300px]">
              {data.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      type="number"
                      tickFormatter={(value) => `$${value}`}
                    />
                    <YAxis type="category" dataKey="name" />
                    <Tooltip
                      formatter={(value: any) => {
                        return typeof value === "number"
                          ? `$${value.toFixed(2)}`
                          : value
                      }}
                    />
                    <Bar dataKey="value">
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No data for the selected period
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

interface CategoryTableProps {
  title: string
  data: any[]
  isExpense: boolean
}

const CategoryTable: React.FC<CategoryTableProps> = ({
  title,
  data,
  isExpense,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <div className="space-y-4">
            {data.map((item, index) => (
              <div key={item.id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-medium">{item.name}</span>
                </div>
                <div className="text-right">
                  <div
                    className={`font-bold ${
                      isExpense ? "text-red-500" : "text-green-500"
                    }`}
                  >
                    ${item.value.toFixed(2)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {item.percentage}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            No data for the selected period
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default CategoryBreakdown
