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
                    <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" opacity={0.6} />

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
                            backgroundColor: "#ffffff",
                            border: "1px solid #e4e4e7",
                            borderRadius: "8px",
                            padding: "12px",
                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        }}
                        labelStyle={{ color: "#71717a", marginBottom: "4px" }}
                        itemStyle={{ color: "#D4AF37" }}
                        formatter={(value: number | undefined) => [
                            `${(value ?? 0).toLocaleString("fr-TG")} FCFA`,
                            "Revenue",
                        ]}
                    />

                    <Bar dataKey="revenue" fill="#D4AF37" radius={[6, 6, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
