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
import { BarChart3, TrendingUp, Layers } from 'lucide-react'
import { formatDateLabel } from '@/lib/utils'
import type { HistoryDay, LiquidType } from '@/types'
import { LIQUID_META } from '@/types'
import { LIQUID_COLORS } from './shared/constants'

const ReactEChartsCore = dynamic(() => import('echarts-for-react/lib/core'), {
	ssr: false,
})

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

export default function HistoryChart({ data, goal }: HistoryChartProps) {
	const [mode, setMode] = useState<ChartMode>('bar')
	const [showByType, setShowByType] = useState(false)
	const [isDark, setIsDark] = useState(false)
	const router = useRouter()

	useEffect(() => {
		const html = document.documentElement
		setIsDark(html.classList.contains('dark'))
		const observer = new MutationObserver(() => {
			setIsDark(html.classList.contains('dark'))
		})
		observer.observe(html, { attributes: true, attributeFilter: ['class'] })
		return () => observer.disconnect()
	}, [])

	const colors = useMemo(
		() => ({
			primary: '#3b82f6',
			goalLine: isDark ? '#f59e0b' : '#d97706',
			text: isDark ? '#9ca3af' : '#6b7280',
			axisTick: isDark ? '#374151' : '#e5e7eb',
			tooltipBg: isDark ? '#1f2937' : '#ffffff',
			tooltipBorder: isDark ? '#374151' : '#e5e7eb',
			metGoal: '#22c55e',
		}),
		[isDark],
	)

	const labels = useMemo(
		() => data.map((d) => formatDateLabel(d.date).split(',')[0]),
		[data],
	)
	const totals = useMemo(() => data.map((d) => d.total), [data])

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

	const allLiquidTypes = useMemo(() => {
		// Collect all types that appear in the dataset, water-first then by total desc
		const totalsMap = new Map<LiquidType, number>()
		data.forEach((day) =>
			day.byType?.forEach((b) => {
				totalsMap.set(
					b.liquidType,
					(totalsMap.get(b.liquidType) ?? 0) + b.total,
				)
			}),
		)
		return [...totalsMap.entries()]
			.sort((a, b) => {
				if (a[0] === 'water') return -1
				if (b[0] === 'water') return 1
				return b[1] - a[1]
			})
			.map(([t]) => t)
	}, [data])

	// 7-day totals per type for the summary row
	const typeTotals = useMemo(() => {
		const map = new Map<LiquidType, number>()
		data.forEach((day) =>
			day.byType?.forEach((b) =>
				map.set(b.liquidType, (map.get(b.liquidType) ?? 0) + b.total),
			),
		)
		return map
	}, [data])

	const sharedChartBase = useMemo(
		() => ({
			grid: { left: 50, right: 16, top: 16, bottom: 32 },
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
			tooltip: {
				trigger: 'axis' as const,
				backgroundColor: colors.tooltipBg,
				borderColor: colors.tooltipBorder,
				textStyle: { color: colors.text, fontSize: 12 },
			},
		}),
		[labels, colors],
	)

	const option = useMemo<EChartsOption>(() => {
		const goalMarkLine = {
			silent: true,
			symbol: 'none',
			lineStyle: {
				color: colors.goalLine,
				type: 'dashed' as const,
				width: 2,
			},
			label: {
				formatter: `Goal: ${goal} ml`,
				color: colors.goalLine,
				fontSize: 11,
				fontWeight: 600,
				position: 'insideStartTop' as const,
				opacity: 0.5,
			},
			data: [{ yAxis: goal }],
		}

		const tooltipFormatter = (params: any) => {
			const idx = params[0]?.dataIndex
			if (idx == null) return ''
			const day = data[idx]
			const pct = goal > 0 ? Math.round((day.total / goal) * 100) : 0
			const metLabel =
				day.total >= goal
					? `<span style="color:#22c55e;font-weight:600">✓ Goal met</span>`
					: `<span style="color:#f59e0b">${pct}% of goal</span>`
			const lines = [
				`<div style="font-weight:700;margin-bottom:6px;font-size:13px">${formatDateLabel(day.date)}</div>`,
			]
			if (showByType && day.byType?.length) {
				day.byType.forEach((b) => {
					const meta = LIQUID_META[b.liquidType]
					const color = LIQUID_COLORS[b.liquidType]
					const typePct =
						day.total > 0
							? Math.round((b.total / day.total) * 100)
							: 0
					lines.push(
						`<div style="display:flex;align-items:center;gap:6px;margin:3px 0">` +
							`<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${color};flex-shrink:0"></span>` +
							`<span>${meta?.emoji ?? ''} ${meta?.label ?? b.liquidType}</span>` +
							`<span style="margin-left:auto;padding-left:12px;font-weight:600">${b.total} ml</span>` +
							`<span style="color:${colors.text};font-size:11px;min-width:32px;text-align:right">${typePct}%</span>` +
							`</div>`,
					)
				})
				lines.push(
					`<div style="border-top:1px solid ${colors.tooltipBorder};margin-top:6px;padding-top:6px;display:flex;justify-content:space-between;align-items:center">` +
						`<span style="font-weight:600">Total</span>` +
						`<span style="font-weight:700">${day.total} ml &nbsp;${metLabel}</span>` +
						`</div>`,
				)
			} else {
				lines.push(`<div>${day.total} ml &nbsp;${metLabel}</div>`)
			}
			return `<div style="min-width:180px">${lines.join('')}</div>`
		}

		if (mode === 'bar' && showByType) {
			// For each day, find the last type (in allLiquidTypes order) with a non-zero value
			const topTypePerDay = data.map((day) => {
				let top: LiquidType | null = null
				allLiquidTypes.forEach((t) => {
					if (
						(day.byType?.find((b) => b.liquidType === t)?.total ??
							0) > 0
					)
						top = t
				})
				return top
			})

			return {
				...sharedChartBase,
				tooltip: {
					...sharedChartBase.tooltip,
					formatter: tooltipFormatter,
				},
				series: allLiquidTypes.map((type, i) => ({
					name: LIQUID_META[type]?.label ?? type,
					type: 'bar' as const,
					stack: 'total',
					barWidth: '45%',
					data: data.map((day, di) => {
						const value =
							day.byType?.find((b) => b.liquidType === type)
								?.total ?? 0
						return {
							value,
							itemStyle: {
								color: LIQUID_COLORS[type],
								borderRadius:
									topTypePerDay[di] === type
										? [6, 6, 0, 0]
										: [0, 0, 0, 0],
							},
						}
					}),
					animationDuration: 600,
					animationEasing: 'cubicOut',
					...(i === allLiquidTypes.length - 1
						? { markLine: goalMarkLine }
						: {}),
				})),
			}
		}

		if (mode === 'bar') {
			return {
				...sharedChartBase,
				tooltip: {
					...sharedChartBase.tooltip,
					formatter: tooltipFormatter,
				},
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
						markLine: goalMarkLine,
					},
				],
			}
		}

		if (mode === 'line' && showByType) {
			return {
				...sharedChartBase,
				tooltip: {
					...sharedChartBase.tooltip,
					formatter: tooltipFormatter,
				},
				series: allLiquidTypes.map((type, i) => ({
					name: LIQUID_META[type]?.label ?? type,
					type: 'line' as const,
					smooth: true,
					symbol: 'circle',
					symbolSize: 6,
					lineStyle: { width: 2, color: LIQUID_COLORS[type] },
					itemStyle: {
						color: LIQUID_COLORS[type],
						borderWidth: 2,
						borderColor: isDark ? '#111827' : '#ffffff',
					},
					data: data.map(
						(day) =>
							day.byType?.find((b) => b.liquidType === type)
								?.total ?? 0,
					),
					animationDuration: 800,
					animationEasing: 'cubicOut',
					...(i === 0 ? { markLine: goalMarkLine } : {}),
				})),
			}
		}

		return {
			...sharedChartBase,
			tooltip: {
				...sharedChartBase.tooltip,
				formatter: tooltipFormatter,
			},
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
					markLine: goalMarkLine,
				},
			],
		}
	}, [
		mode,
		showByType,
		data,
		totals,
		barColors,
		colors,
		goal,
		isDark,
		allLiquidTypes,
		sharedChartBase,
	])

	const onChartClick = useCallback(
		(params: { dataIndex: number }) => {
			const idx = params.dataIndex
			if (idx != null && data[idx]) {
				router.push(`/history/${data[idx].date}`)
			}
		},
		[data, router],
	)

	const onEvents = useMemo(() => ({ click: onChartClick }), [onChartClick])

	const toggleButton = (
		m: ChartMode,
		label: string,
		Icon: React.ElementType,
	) => (
		<button
			onClick={() => setMode(m)}
			className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
				mode === m
					? 'bg-brand-500 text-white'
					: 'bg-white text-gray-500 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800'
			}`}
			aria-label={label}
		>
			<Icon className="h-3.5 w-3.5" />
			{label}
		</button>
	)

	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between">
				<h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400">
					7-Day Overview
				</h2>
				<div className="flex items-center gap-2">
					<button
						onClick={() => setShowByType((v) => !v)}
						className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
							showByType
								? 'border-brand-200 bg-brand-50 text-brand-600 dark:border-brand-800 dark:bg-brand-950 dark:text-brand-400'
								: 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800'
						}`}
					>
						<Layers className="h-3.5 w-3.5" />
						By Type
					</button>
					<div className="flex overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
						{toggleButton('bar', 'Bar', BarChart3)}
						{toggleButton('line', 'Line', TrendingUp)}
					</div>
				</div>
			</div>

			<ReactEChartsCore
				echarts={echarts}
				option={option}
				style={{ height: showByType ? 290 : 260 }}
				onEvents={onEvents}
				opts={{ renderer: 'canvas' }}
				notMerge
			/>

			{/* 7-day type breakdown summary */}
			{showByType && typeTotals.size > 0 && (
				<div className="flex flex-wrap gap-2 pt-1">
					{allLiquidTypes.map((type) => {
						const total = typeTotals.get(type)
						if (!total) return null
						const meta = LIQUID_META[type]
						return (
							<div
								key={type}
								className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs dark:border-gray-700 dark:bg-gray-800"
							>
								<span
									className="h-2 w-2 rounded-full flex-shrink-0"
									style={{ background: LIQUID_COLORS[type] }}
								/>
								<span>{meta.label}</span>
								<span className="font-semibold text-gray-700 dark:text-gray-300">
									{total >= 1000
										? `${(total / 1000).toFixed(1)}L`
										: `${total} ml`}
								</span>
							</div>
						)
					})}
				</div>
			)}
		</div>
	)
}
