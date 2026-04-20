"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ExpenseCategory } from "@/app/generated/prisma/enums";

interface ExpenseDistributionChartProps {
    data: Array<{
        category: ExpenseCategory;
        amount: number;
    }>;
}

export function ExpenseDistributionChart({ data }: ExpenseDistributionChartProps) {
    const formattedData = data.map((item) => ({
        ...item,
        categoryName: item.category.charAt(0) + item.category.slice(1).toLowerCase().replace("_", " "),
    }));

    return (
        <div className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={formattedData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" opacity={0.6} />

                    <XAxis
                        dataKey="categoryName"
                        stroke="#71717a"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                    />

                    <YAxis
                        stroke="#71717a"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                    />

                    <Tooltip
                        contentStyle={{
                            backgroundColor: "#ffffff",
                            border: "1px solid #e4e4e7",
                            borderRadius: "8px",
                            padding: "12px",
                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        }}
                        labelStyle={{ color: "#71717a", marginBottom: "4px" }}
                        itemStyle={{ color: "#f43f5e" }}
                        formatter={(value: number | undefined) => [
                            `${(value || 0).toLocaleString("en-US")} FCFA`,
                            "Cost",
                        ]}
                    />

                    <Bar dataKey="amount" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
