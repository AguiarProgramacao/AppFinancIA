import React from "react";
import { View, Text, StyleSheet } from "react-native";

export interface BarDatum {
  receita: number;
  despesa: number;
  label?: string;
}

interface BarChartProps {
  data: BarDatum[];
  height?: number;
}

export default function BarChart({ data, height = 140 }: BarChartProps) {
  const safeData = data.filter(
    (item) => Number.isFinite(item.receita) && Number.isFinite(item.despesa)
  );

  if (safeData.length === 0) {
    return <Text style={styles.emptyText}>Sem dados para o periodo</Text>;
  }

  const padding = 8;
  const barWidth = 19;
  const barGap = 8;
  const groupWidth = 64;
  const yAxisWidth = 52;
  const tickCount = 4;
  const maxValue = Math.max(
    1,
    ...safeData.flatMap((item) => [item.receita, item.despesa])
  );
  const barAreaHeight = height - padding * 2;
  const tickValues = Array.from({ length: tickCount }, (_, index) => {
    const ratio = (tickCount - 1 - index) / (tickCount - 1);
    return maxValue * ratio;
  });

  const scaleHeight = (value: number) =>
    (Math.max(0, value) / maxValue) * barAreaHeight;

  function formatShortCurrency(value: number) {
    const amount = value / 100;
    if (amount >= 1000) {
      const precision = amount >= 10000 ? 0 : 1;
      const short = (amount / 1000).toFixed(precision).replace(".", ",");
      return `R$ ${short}k`;
    }
    return `R$ ${Math.round(amount).toLocaleString("pt-BR")}`;
  }

  return (
    <View style={styles.container}>
      <View style={[styles.chartWrap, { height }]}>
        <View style={[styles.yAxis, { height, width: yAxisWidth, paddingVertical: padding }]}>
          {tickValues.map((tick, index) => (
            <Text key={`tick-${index}`} style={styles.yAxisLabel}>
              {formatShortCurrency(tick)}
            </Text>
          ))}
        </View>

        <View style={[styles.barsArea, { height }]}>
          {tickValues.map((_, index) => (
            <View
              key={`grid-${index}`}
              style={[
                styles.gridLine,
                { top: padding + (barAreaHeight / (tickCount - 1)) * index },
              ]}
            />
          ))}

          <View style={[styles.row, { height }]}>
            {safeData.map((item, index) => {
              const receitaHeight = Math.max(2, scaleHeight(item.receita));
              const despesaHeight = Math.max(2, scaleHeight(item.despesa));
              const leftOffset = (groupWidth - (barWidth * 2 + barGap)) / 2;
              const isLast = index === safeData.length - 1;

              return (
                <View
                  key={`${item.label ?? "bar"}-${index}`}
                  style={[styles.barWrap, !isLast && styles.barGap]}
                >
                  <View style={[styles.barArea, { height, width: groupWidth }]}>
                    <View
                      style={[
                        styles.bar,
                        styles.barReceita,
                        {
                          height: receitaHeight,
                          width: barWidth,
                          left: leftOffset,
                          bottom: padding,
                        },
                      ]}
                    />
                    <View
                      style={[
                        styles.bar,
                        styles.barDespesa,
                        {
                          height: despesaHeight,
                          width: barWidth,
                          left: leftOffset + barWidth + barGap,
                          bottom: padding,
                        },
                      ]}
                    />
                  </View>
                  {!!item.label && <Text style={styles.label}>{item.label}</Text>}
                </View>
              );
            })}
          </View>
        </View>
      </View>

      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.barReceita]} />
          <Text style={styles.legendText}>Receitas</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.barDespesa]} />
          <Text style={styles.legendText}>Despesas</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "stretch",
    width: "100%",
  },
  chartWrap: {
    flexDirection: "row",
    width: "100%",
  },
  yAxis: {
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingRight: 6,
  },
  yAxisLabel: {
    fontSize: 10,
    color: "#9CA3AF",
  },
  barsArea: {
    flex: 1,
    position: "relative",
  },
  gridLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "#EEF2F7",
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  barWrap: {
    width: 64,
    alignItems: "center",
  },
  barGap: {
    marginRight: 8,
  },
  barArea: {
    position: "relative",
  },
  bar: {
    position: "absolute",
    borderRadius: 3,
  },
  barReceita: {
    backgroundColor: "#22C55E",
  },
  barDespesa: {
    backgroundColor: "#EF4444",
  },
  label: {
    marginTop: 6,
    fontSize: 11,
    color: "#6B7280",
  },
  legendRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 6,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  legendText: {
    fontSize: 11,
    color: "#6B7280",
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
    marginTop: 10,
  },
});
