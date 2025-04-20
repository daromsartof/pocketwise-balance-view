import React, { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import {
  Bot,
  Send,
  Sparkles,
  AlertCircle,
  Download,
  MessageSquare,
  TrendingUp,
  ArrowUpDown,
  DollarSign,
} from "lucide-react"
import { useFinance } from "../../context/FinanceContext"
import { TransactionType } from "../../types"
import OpenAI from "openai"
import { TypeAnimation } from "react-type-animation"
import ReactMarkdown from "react-markdown"
import rehypeRaw from "rehype-raw"
import { marked } from "marked"

interface AIInsightsProps {
  dateRange: { startDate: Date; endDate: Date }
}

interface Message {
  id: string
  sender: "user" | "ai"
  content: string
  timestamp: Date
}

interface Insight {
  id: string
  title: string
  content: string
  type: "tip" | "alert" | "trend"
  icon: React.ReactNode
}

interface AnimatedMessage extends Message {
  isTyping?: boolean
}

const AIInsights: React.FC<AIInsightsProps> = ({ dateRange }) => {
  const { transactions, categories } = useFinance()
  const [messages, setMessages] = useState<AnimatedMessage[]>([
    {
      id: "1",
      sender: "ai",
      content:
        "Hello! I'm your finance assistant. I can answer questions about your spending patterns and offer suggestions to optimize your finances. What would you like to know?",
      timestamp: new Date(),
      isTyping: false,
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Initialize OpenAI client
  const openai = new OpenAI({
    apiKey:
      "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", // Store your API key in environment variables
    dangerouslyAllowBrowser: true, // Only for client-side usage
  })

  // Generate insights based on the current data
  const insights = React.useMemo(() => {
    // Filter transactions by date range
    const filteredTransactions = transactions.filter(
      (t) =>
        new Date(t.date) >= dateRange.startDate &&
        new Date(t.date) <= dateRange.endDate
    )

    const expenseTransactions = filteredTransactions.filter(
      (t) => t.category.type === TransactionType.EXPENSE
    )

    const insights: Insight[] = []

    // Find most expensive category
    if (expenseTransactions.length > 0) {
      const categoryExpenses = new Map<string, number>()

      expenseTransactions.forEach((t) => {
        const currentAmount = categoryExpenses.get(t.category.id) || 0
        categoryExpenses.set(t.category.id, currentAmount + t.amount)
      })

      let highestCategoryId = ""
      let highestAmount = 0

      categoryExpenses.forEach((amount, categoryId) => {
        if (amount > highestAmount) {
          highestAmount = amount
          highestCategoryId = categoryId
        }
      })

      const highestCategory = categories.find((c) => c.id === highestCategoryId)

      if (highestCategory) {
        insights.push({
          id: "1",
          title: "Highest Spending Category",
          content: `Your highest expense category for this period is ${
            highestCategory.name
          } at $${highestAmount.toFixed(2)}.`,
          type: "trend",
          icon: <TrendingUp className="h-5 w-5 text-blue-500" />,
        })
      }
    }

    // Check for recurring expenses
    const recurringExpenses = expenseTransactions.filter((t) => t.recurring)
    const recurringTotal = recurringExpenses.reduce(
      (sum, t) => sum + t.amount,
      0
    )

    if (recurringExpenses.length > 0) {
      insights.push({
        id: "2",
        title: "Recurring Expenses",
        content: `You have ${
          recurringExpenses.length
        } recurring expenses totaling $${recurringTotal.toFixed(
          2
        )} in this period.`,
        type: "alert",
        icon: <ArrowUpDown className="h-5 w-5 text-orange-500" />,
      })
    }

    // Potential savings tip
    if (expenseTransactions.length > 5) {
      insights.push({
        id: "3",
        title: "Saving Opportunity",
        content:
          "Consider reviewing your subscriptions and recurring payments to identify potential savings.",
        type: "tip",
        icon: <Sparkles className="h-5 w-5 text-green-500" />,
      })
    }

    return insights
  }, [transactions, categories, dateRange])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  React.useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage: AnimatedMessage = {
      id: Date.now().toString(),
      sender: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)

    // Add a temporary typing indicator message
    const typingIndicatorId = (Date.now() + 1).toString()
    setMessages((prev) => [
      ...prev,
      {
        id: typingIndicatorId,
        sender: "ai",
        content: "",
        timestamp: new Date(),
        isTyping: true,
      },
    ])

    try {
      // Filter transactions by date range
      const filteredTransactions = transactions.filter(
        (t) =>
          new Date(t.date) >= dateRange.startDate &&
          new Date(t.date) <= dateRange.endDate
      )

      // Prepare financial data context for the AI
      const financialContext = {
        dateRange: {
          start: format(dateRange.startDate, "MMM d, yyyy"),
          end: format(dateRange.endDate, "MMM d, yyyy"),
        },
        totalTransactions: filteredTransactions.length,
        categories: categories.map((c) => ({
          id: c.id,
          name: c.name,
          type: c.type,
        })),
        transactions: filteredTransactions.map((t) => ({
          amount: t.amount,
          date: format(new Date(t.date), "yyyy-MM-dd"),
          description: t.description,
          categoryId: t.category.id,
          categoryName: t.category.name,
          type: t.category.type,
          recurring: t.recurring,
        })),
      }

      // Construct conversation history for context
      const conversationHistory = messages.map((msg) => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.content,
      }))

      // Add system message with instructions
      conversationHistory.unshift({
        role: "system",
        content:
          "You are a financial advisor AI assistant. Analyze the user's financial data and provide personalized insights, budget optimization tips, and answer their questions. Be specific and reference actual numbers from their data.",
      })

      // Add user's financial data context and current question
      conversationHistory.push({
        role: "user",
        content: `Here is my financial data: ${JSON.stringify(
          financialContext
        )}\n\nMy question is: ${input}, please answer in a concise manner and medium length sentences`,
      })

      // Call OpenAI API
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini", // or whatever model you prefer

        messages: conversationHistory,
        temperature: 0.7,
        max_tokens: 500,
      })

      const aiResponse =
        completion.choices[0]?.message?.content ||
        "I'm sorry, I couldn't analyze your financial data at this time."

      // Replace typing indicator with actual response
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === typingIndicatorId) {
            return {
              id: typingIndicatorId,
              sender: "ai",
              content: aiResponse,
              timestamp: new Date(),
              isTyping: false,
            }
          }
          return msg
        })
      )
    } catch (error) {
      console.error("Error calling OpenAI API:", error)

      // Replace typing indicator with error message
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === typingIndicatorId) {
            return {
              id: typingIndicatorId,
              sender: "ai",
              content:
                "I'm sorry, I encountered an error while processing your request. Please try again later.",
              timestamp: new Date(),
              isTyping: false,
            }
          }
          return msg
        })
      )

      toast({
        title: "API Error",
        description: "Failed to connect to AI service. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const exportPdf = () => {
    toast({
      title: "Export Started",
      description: "Your financial report is being prepared for download.",
    })

    // In a real implementation, this would generate and download a PDF
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: "Your financial report has been downloaded.",
      })
    }, 2000)
  }

  // Create a component for typing animation
  const MessageContent = ({ message }: { message: AnimatedMessage }) => {
    if (message.sender === "user" || !message.isTyping) {
      return <div className="whitespace-pre-line">{message.content}</div>
    }

    // Return typing animation for AI messages
    return (
      <div className="typing-indicator">
        <span className="dot"></span>
        <span className="dot"></span>
        <span className="dot"></span>
      </div>
    )
  }

  // Add this function to format the message content
  const FormatMarkdownMessage = ({ content }: { content: string }) => {
    return (
      <ReactMarkdown
        rehypePlugins={[rehypeRaw]}
        components={{
          h3: ({ node, ...props }) => (
            <h3
              className="text-base font-bold text-primary-foreground mt-3 mb-2"
              {...props}
            />
          ),
          h2: ({ node, ...props }) => (
            <h2
              className="text-lg font-bold text-primary-foreground mt-4 mb-2"
              {...props}
            />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc pl-5 my-2 space-y-1" {...props} />
          ),
          li: ({ node, children, ...props }) => {
            // Check if content has nested structure
            const content = props.children?.toString() || ""
            if (content.includes("**")) {
              // Handle special formatting for financial items
              return (
                <li className="my-1" {...props}>
                  {children}
                </li>
              )
            }
            return (
              <li className="my-1" {...props}>
                {children}
              </li>
            )
          },
          strong: ({ node, ...props }) => (
            <strong className="font-bold text-accent-foreground" {...props} />
          ),
          p: ({ node, ...props }) => <p className="my-2" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    )
  }

  // Update the TypeAnimation component to show formatted content when typing completes
  const AnimatedMarkdownMessage = ({ content }: { content: string }) => {
    const [isTypingComplete, setIsTypingComplete] = useState(false)

    return (
      <>
        {!isTypingComplete && (
          <TypeAnimation
            sequence={[content, () => setIsTypingComplete(true)]}
            wrapper="div"
            cursor={false}
            repeat={0}
            speed={80}
            style={{
              whiteSpace: "pre-line",
              display: isTypingComplete ? "none" : "block",
            }}
            className="whitespace-pre-line"
          />
        )}
        {isTypingComplete && <FormatMarkdownMessage content={content} />}
      </>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div className="lg:col-span-3">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              AI Finance Assistant
            </CardTitle>
            <CardDescription>
              Ask questions about your finances and get personalized insights
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[400px] px-4">
              <div className="space-y-4 pt-4 pb-6">
                {messages.map((message, i) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender === "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.sender === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      {message.sender === "ai" && (
                        <div className="flex items-center gap-2 mb-1">
                          <Bot className="h-4 w-4" />
                          <span className="text-xs font-medium">
                            Finance Assistant
                          </span>
                        </div>
                      )}

                      {message.sender === "ai" &&
                      !message.isTyping && i == messages.length - 1 &&
                      message.content ? (
                        <AnimatedMarkdownMessage content={message.content} />
                      ) : (
                        <MessageContent message={message} />
                      )}

                      <div className="text-xs opacity-70 mt-1 text-right">
                        {format(message.timestamp, "h:mm a")}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter className="border-t p-4">
            <div className="flex w-full items-center space-x-2">
              <Textarea
                placeholder="Ask a question about your finances..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 min-h-10 resize-none"
              />
              <Button disabled={loading} onClick={handleSendMessage}>
                {loading ? "Thinking..." : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>

      <div className="lg:col-span-2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Smart Insights
            </CardTitle>
            <CardDescription>
              AI-generated insights based on your financial data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[350px]">
              <div className="space-y-4">
                {insights.length > 0 ? (
                  insights.map((insight) => (
                    <Card key={insight.id} className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">{insight.icon}</div>
                        <div>
                          <h3 className="font-medium text-sm">
                            {insight.title}
                          </h3>
                          <p className="text-muted-foreground text-sm mt-1">
                            {insight.content}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                    <AlertCircle className="h-8 w-8 mb-2" />
                    <p>
                      Not enough data for the selected period to generate
                      insights.
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button variant="outline" onClick={exportPdf}>
              <Download className="h-4 w-4 mr-2" />
              Export Insights
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default AIInsights
