import React from "react";
import { ColorValue, View } from "react-native";
import Svg, { G, Path } from "react-native-svg";
import * as shape from "d3-shape";

// TIPAGEM CORRETA DAS PROPS
interface DonutProps {
  data: { value: number; color: string }[];
}

export default function DonutChart({ data }: DonutProps) {
  const size = 240;
  const radius = size / 2;
  const innerRadius = 70;

  const pie = shape
    .pie<{ value: number; color: string }>()
    .value((d: { value: any; }) => d.value)
    .sort(null);

  const arcs = pie(data);

  const arcGenerator = shape
    .arc<any>()
    .outerRadius(radius)
    .innerRadius(innerRadius);

  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size}>
        <G transform={`translate(${radius}, ${radius})`}>
          {arcs.map((arc: { data: { color: ColorValue | undefined; }; }, i: React.Key | null | undefined) => (
            <Path
              key={i}
              d={arcGenerator(arc) as string}
              fill={arc.data.color}
            />
          ))}
        </G>
      </Svg>
    </View>
  );
}
