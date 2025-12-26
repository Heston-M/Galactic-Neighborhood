import { useThemeContext } from "@/contexts/ThemeContext";
import { Topic } from "@/types/topic";
import { useEffect, useState } from "react";
import { FlexAlignType, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import ThemeText from "../general/ThemeText";

interface TableProps {
  title?: React.ReactNode;
  topic?: Topic;
  headers: string[];
  rows: string[][];
  rowAlignments?: FlexAlignType[];
  columnWidths: number[];
  wrappableColumns?: boolean[];
  flipTable?: boolean;
  checkerboard?: boolean;
  containerWidth?: number;
  style?: StyleProp<ViewStyle>;
  onDimensionsChange?: (scaleFactor: number, newWidth: number, newHeight: number) => void;
}

export default function Table({ 
  title, 
  topic = "general", 
  headers, 
  rows, 
  rowAlignments = [], 
  columnWidths = [],
  wrappableColumns = [],
  flipTable = false, 
  checkerboard = false, 
  containerWidth = 0,
  style = {},
  onDimensionsChange,
}: TableProps) {
  
  const { getThemeColor } = useThemeContext();
  const backgroundColor = getThemeColor("primary");
  const borderColor = getThemeColor("secondary");
  const shadeColor = getThemeColor("shade", topic);

  const [rowHeights, setRowHeights] = useState<Map<number, number>>(new Map());

  const tableWidth = columnWidths.reduce((sum, width) => sum + width, 0);
  const tableHeight = rowHeights.values().reduce((sum, height) => sum + height, 0) + (title ? 30 : 0);
  const [scaleFactor, setScaleFactor] = useState<number>(1);

  useEffect(() => {
    if (containerWidth > 0 && tableWidth > 0) {
      const newScaleFactor = Math.min(1, containerWidth / tableWidth);
      setScaleFactor(newScaleFactor);
      onDimensionsChange?.(newScaleFactor, newScaleFactor * tableWidth - 4, newScaleFactor * tableHeight);
    }
  }, [containerWidth, tableWidth, tableHeight]);

  const setCellHeight = (rowIndex: number, cellHeight: number) => {
    setRowHeights(prev => {
      const newRowHeight = Math.max(prev.get(rowIndex) ?? 0, cellHeight);
      return new Map(prev).set(rowIndex, newRowHeight);
    });
  }

  const getNthElements = (n: number) => {
    if (n < 0 || n >= headers.length) {
      return [];
    }
    return rows.map((row) => row[n]);
  }

  const column = (items: string[], columnIndex: number, isHeader: boolean = false) => {
    const offset = checkerboard ? columnIndex % 2 : 0;

    const columnWidth = columnWidths[columnIndex] ?? "auto";
    const wrap = wrappableColumns[columnIndex] ? "wrap" : "nowrap";

    return (
      <View key={columnIndex} style={[styles.tableColumn, { width: columnWidth }]}>
        {items.map((item, index) => (
          <View 
            key={columnIndex + "-" + index} 
            style={[
              styles.tableCell, 
              { 
                backgroundColor: (index + offset) % 2 === 0 ? backgroundColor : shadeColor, 
                alignItems: rowAlignments?.[columnIndex],
                height: rowHeights.get(index) ?? undefined
              }]}
            onLayout={(event) => {setCellHeight(index, event.nativeEvent.layout.height);}}
          >
            <ThemeText 
              style={{ fontWeight: flipTable ? (isHeader ? "bold" : "normal") : (index === 0 ? "bold" : "normal"), flexWrap: wrap }}
            >{item}</ThemeText>
          </View>
        ))}
      </View>
    )
  }

  return (
    <View style={[styles.table, { borderColor, transform: [{ scale: scaleFactor }] }, style]}>
      {title && <View style={styles.tableTitle}>{title}</View>}
      {flipTable ? (
        <View style={styles.tableRows}>
          {column(headers, 0, true)}
          {rows.map((row, index) => ( column(row, index + 1) ))}
        </View>
      ) : (
        <View style={styles.tableRows}>
          {headers.map((header, index) => ( column([header, ...getNthElements(index)], index) ))}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  table: {
    borderWidth: 2,
    minWidth: 50,
    minHeight: 30,
  },
  tableTitle: {
    alignItems: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  tableColumn: {
    flexDirection: "column",
    minWidth: 0,
  },
  tableRows: {
    flexDirection: "row",
  },
  tableCell: {
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
})