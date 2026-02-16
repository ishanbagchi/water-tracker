'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import * as echarts from 'echarts/core'
import { BarChart, LineChart } from 'echarts/charts'
import {
	GridComponent,
	TooltipComponent,
	MarkLineComponent,
	LegendComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { EChartsOption } from 'echarts'
import { BarChart3, TrendingUp } from 'lucide-react'
import { formatDateLabel } from '@/lib/utils'
import type { HistoryDay } from '@/types'

// Dynamically import ReactECharts with SSR disabled – ECharts requires the DOM
const ReactEChartsCore = dynamic(() => import('echarts-for-react/lib/core'), {
	ssr: false,
})

// Register only the ECharts modules we need (tree-shakeable)
echarts.use([
	BarChart,
	LineChart,
	GridComponent,
	TooltipComponent,
	MarkLineComponent,
	LegendComponent,
	CanvasRenderer,
])

type ChartMode = 'bar' | 'line'

interface HistoryChartProps {
	data: HistoryDay[]
	goal: number
}

/**
 * 7-day history chart powered by ECharts.
 * Supports bar / line toggle, dark mode, goal marker line,
 * and click-to-navigate to day detail pages.
 */
export default function HistoryChart({ data, goal }: HistoryChartProps) {
	const [mode, setMode] = useState<ChartMode>('bar')
	const [isDark, setIsDark] = useState(false)
	const router = useRouter()

	// Observe the <html> element's class list for dark mode changes
	useEffect(() => {
		const html = document.documentElement
		setIsDark(html.classList.contains('dark'))

		const observer = new MutationObserver(() => {
			setIsDark(html.classList.contains('dark'))
		})
		observer.observe(html, { attributes: true, attributeFilter: ['class'] })
		return () => observer.disconnect()
	}, [])

	// ── Palette ──
	const colors = useMemo(
		() => ({
			primary: '#3b82f6', // brand-500
			primaryLight: isDark
				? 'rgba(59,130,246,0.25)'
				: 'rgba(59,130,246,0.15)',
			goalLine: isDark ? '#f59e0b' : '#d97706', // amber
			text: isDark ? '#9ca3af' : '#6b7280',
			axisTick: isDark ? '#374151' : '#e5e7eb',
			tooltipBg: isDark ? '#1f2937' : '#ffffff',
			tooltipBorder: isDark ? '#374151' : '#e5e7eb',
			metGoal: '#22c55e', // green-500
			belowGoal: isDark ? '#60a5fa' : '#3b82f6',
		}),
		[isDark],
	)

	// ── Dates & labels ──
	const labels = useMemo(
		() => data.map((d) => formatDateLabel(d.date).split(',')[0]),
		[data],
	)
	const totals = useMemo(() => data.map((d) => d.total), [data])

	// ── Per-bar colour (green if met goal) ──
	const barColors = useMemo(
		() =>
			data.map((d) =>
				d.total >= goal
					? new echarts.graphic.LinearGradient(0, 0, 0, 1, [
							{ offset: 0, color: '#4ade80' },
							{ offset: 1, color: '#22c55e' },
						])
					: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
							{ offset: 0, color: '#60a5fa' },
							{ offset: 1, color: '#3b82f6' },
						]),
			),
		[data, goal],
	)

	// ── Build ECharts option ──
	const option = useMemo<EChartsOption>(() => {
		const shared = {
			tooltip: {
				trigger: 'axis' as const,
				backgroundColor: colors.tooltipBg,
				borderColor: colors.tooltipBorder,
				textStyle: { color: colors.text, fontSize: 12 },
				formatter: (params: any) => {
					const p = Array.isArray(params) ? params[0] : params
					const idx = p.dataIndex as number
					const day = data[idx]
					const pct =
						goal > 0 ? Math.round((day.total / goal) * 100) : 0
					const metLabel =
						day.total >= goal
							? '<span style="color:#22c55e">✓ Goal met</span>'
							: `<span style="color:#f59e0b">${pct}% of goal</span>`
					return `
						<div style="font-weight:600;margin-bottom:4px">${formatDateLabel(day.date)}</div>
						<div>${day.total} ml &nbsp;${metLabel}</div>
					`
				},
			},
			grid: {
				left: 50,
				right: 16,
				top: 16,
				bottom: 32,
			},
			xAxis: {
				type: 'category' as const,
				data: labels,
				axisLine: { show: false },
				axisTick: { show: false },
				axisLabel: {
					color: colors.text,
					fontSize: 11,
					fontWeight: 500,
				},
			},
			yAxis: {
				type: 'value' as const,
				splitLine: {
					lineStyle: {
						color: colors.axisTick,
						type: 'dashed' as const,
					},
				},
				axisLabel: {
					color: colors.text,
					fontSize: 11,
					formatter: (v: number) =>
						v >= 1000 ? `${v / 1000}L` : `${v}`,
				},
			},
		}

		if (mode === 'bar') {
			return {
				...shared,
				series: [
					{
						type: 'bar',
						data: totals.map((v, i) => ({
							value: v,
							itemStyle: { color: barColors[i] },
						})),
						barWidth: '45%',
						itemStyle: { borderRadius: [6, 6, 0, 0] },
						animationDuration: 600,
						animationEasing: 'cubicOut',
						markLine: {
							silent: true,
							symbol: 'none',
							lineStyle: {
								color: colors.goalLine,
								type: 'dashed',
								width: 2,
							},
							label: {
								formatter: `Goal: ${goal} ml`,
								color: colors.goalLine,
								fontSize: 11,
								fontWeight: 600,
								position: 'insideStartTop',
								opacity: 0.5,
							},
							data: [{ yAxis: goal }],
						},
					},
				],
			}
		}

		// Line mode
		return {
			...shared,
			series: [
				{
					type: 'line',
					data: totals,
					smooth: true,
					symbol: 'circle',
					symbolSize: 8,
					lineStyle: { width: 3, color: colors.primary },
					itemStyle: {
						color: colors.primary,
						borderWidth: 2,
						borderColor: isDark ? '#111827' : '#ffffff',
					},
					areaStyle: {
						color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
							{ offset: 0, color: 'rgba(59,130,246,0.35)' },
							{ offset: 1, color: 'rgba(59,130,246,0.02)' },
						]),
					},
					animationDuration: 800,
					animationEasing: 'cubicOut',
					markLine: {
						silent: true,
						symbol: 'none',
						lineStyle: {
							color: colors.goalLine,
							type: 'dashed',
							width: 2,
						},
						label: {
							formatter: `Goal: ${goal} ml`,
							color: colors.goalLine,
							fontSize: 11,
							fontWeight: 600,
							position: 'insideStartTop',
							opacity: 0.5,
						},
						data: [{ yAxis: goal }],
					},
				},
			],
		}
	}, [mode, data, totals, labels, barColors, colors, goal, isDark])

	// ── Click handler → navigate to day detail page ──
	const onChartClick = useCallback(
		(params: any) => {
			const idx = params.dataIndex as number
			if (idx != null && data[idx]) {
				router.push(`/history/${data[idx].date}`)
			}
		},
		[data, router],
	)

	const onEvents = useMemo(() => ({ click: onChartClick }), [onChartClick])

	return (
		<div className="space-y-3">
			{/* Toggle buttons */}
			<div className="flex items-center justify-between">
				<h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400">
					7-Day Overview
				</h2>
				<div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
					<button
						onClick={() => setMode('bar')}
						className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
							mode === 'bar'
								? 'bg-brand-500 text-white'
								: 'bg-white text-gray-500 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800'
						}`}
						aria-label="Bar chart"
					>
						<BarChart3 className="h-3.5 w-3.5" />
						Bar
					</button>
					<button
						onClick={() => setMode('line')}
						className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
							mode === 'line'
								? 'bg-brand-500 text-white'
								: 'bg-white text-gray-500 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800'
						}`}
						aria-label="Line chart"
					>
						<TrendingUp className="h-3.5 w-3.5" />
						Line
					</button>
				</div>
			</div>

			{/* Chart */}
			<ReactEChartsCore
				echarts={echarts}
				option={option}
				style={{ height: 260 }}
				onEvents={onEvents}
				opts={{ renderer: 'canvas' }}
				notMerge
			/>
		</div>
	)
}
