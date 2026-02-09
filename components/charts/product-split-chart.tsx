"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ProductType } from "@prisma/client";

interface ProductSplitChartProps {
    data: Array<{
        product: ProductType;
        revenue: number;
    }>;
}

export function ProductSplitChart({ data }: ProductSplitChartProps) {
    // Format product names for display
    const formattedData = data.map((item) => ({
        ...item,
        productName: item.product.charAt(0) + item.product.slice(1).toLowerCase(),
    }));

    return (
        <div className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={formattedData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.3} />

                    <XAxis
                        dataKey="productName"
                        stroke="#71717a"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                    />

                    <YAxis
                        stroke="#71717a"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                    />

                    <Tooltip
                        contentStyle={{
                            backgroundColor: "#18181b",
                            border: "1px solid rgba(255, 255, 255, 0.08)",
                            borderRadius: "8px",
                            padding: "12px",
                        }}
                        labelStyle={{ color: "#a1a1aa", marginBottom: "4px" }}
                        itemStyle={{ color: "#6366f1" }}
                        formatter={(value: number | undefined) => [
                            `${(value ?? 0).toLocaleString("fr-TG")} FCFA`,
                            "Revenue",
                        ]}
                    />

                    <Bar dataKey="revenue" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
