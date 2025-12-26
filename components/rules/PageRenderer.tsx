import List from "@/components/general/List";
import ThemeText from "@/components/general/ThemeText";
import ThemeView from "@/components/general/ThemeView";
import Note from "@/components/rules/Note";
import Table from "@/components/rules/Table";
import { JsonPage } from "@/types/page";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

interface PageRendererProps {
  page: JsonPage;
}

export default function PageRenderer({ page }: PageRendererProps) {
  const sectionNodes: React.ReactNode[] = [];
  let content: React.ReactNode = null;

  if (!page.sections) {
    return null;
  }

  const [containerWidth, setContainerWidth] = useState(0);
  const [tableScaleFactors, setTableScaleFactors] = useState<Map<string, number>>(new Map());
  const [tableDimensions, setTableDimensions] = useState<Map<string, { width: number, height: number }>>(new Map());

  let keys = new Map<string, number>();

  for (const section of page.sections) {
    const key = `${section.type}-${keys.get(section.type) ?? 0}`;
    keys.set(section.type, (keys.get(section.type) ?? 0) + 1);

    switch (section.type) {
      case "text":
        content = <ThemeText type="default">{section.text}</ThemeText>;
        break;
      case "heading":
        content = <ThemeText type={section.headingLevel === 1 ? "header" : "subheader"} topic={page.topic}>{section.text}</ThemeText>;
        break;
      case "aspects":
        content = <View style={styles.aspectsContainer}>
          {section.aspects?.map((aspect, index) => <ThemeText 
            key={index}
            type="caption" 
            style={{ fontWeight: "bold" }}
          >
            {aspect.name}: {aspect.value}
          </ThemeText>)}
        </View>;
        break;
      case "list":
        content = <List type={section.listType}>{section.listItems?.map((item, index) => <ThemeText key={index} type="default">{item}</ThemeText>)}</List>;
        break;
      case "table":
        content = section.tableInfo ? <Table 
          title={section.tableInfo.title ? <ThemeText type="subheader" topic={page.topic}>{section.tableInfo.title}</ThemeText> : undefined} 
          topic={page.topic}
          headers={section.tableInfo.isDamageTable ? [section.tableInfo.damageTableOutput ?? "", "Die Roll"] : section.tableInfo.headers ?? []} 
          rows={section.tableInfo.rows ?? []} 
          rowAlignments={section.tableInfo.columnAlignments ?? []}
          columnWidths={section.tableInfo.columnWidths ?? []}
          wrappableColumns={section.tableInfo.wrappableColumns ?? []}
          flipTable={section.tableInfo.isDamageTable ? true : section.tableInfo.flipTable ?? false}
          checkerboard={section.tableInfo.isDamageTable ? true : section.tableInfo.checkerboard ?? false}
          containerWidth={containerWidth}
          onDimensionsChange={(scaleFactor, newWidth, newHeight) => {
            setTableScaleFactors(prev => {
              const newScaleFactors = new Map(prev);
              newScaleFactors.set(key, scaleFactor);
              return newScaleFactors;
            });
            setTableDimensions(prev => {
              const newDimensions = new Map(prev);
              newDimensions.set(key, { width: newWidth, height: newHeight });
              return newDimensions;
            });
          }}
        />
        : null;
        break;
      case "note":
        content = <Note 
          title={<ThemeText type="subheader">{section.noteTitle}</ThemeText>}
          content={<ThemeText type="default">{section.noteContent}</ThemeText>}
          topic={page.topic}
        />;
        break;
      default:
        break;
    }
    sectionNodes.push( 
      <View 
        key={key} 
        style={[
          section.type === "table" ? styles.tableContainer : styles.sectionContainer,
          { width: tableDimensions.get(key)?.width ?? undefined, height: tableDimensions.get(key)?.height ?? undefined }
        ]}
      >
        {content}
      </View> 
    );
  }
  return (
    <ThemeView 
      style={styles.container} 
      onLayout={(event) => setContainerWidth(event.nativeEvent.layout.width - 20)}
    >
      {sectionNodes}
    </ThemeView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    width: "100%",
    alignItems: "flex-start",
    gap: 10,
  },
  sectionContainer: {
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  tableContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 2,
  },
  aspectsContainer: {
    justifyContent: "flex-start",
    alignItems: "flex-start",
    gap: 2,
  },
});