import Collapsible from "@/components/general/Collapsible";
import List from "@/components/general/List";
import ThemeText from "@/components/general/ThemeText";
import ThemeView from "@/components/general/ThemeView";
import Note from "@/components/rules/Note";
import Table from "@/components/rules/Table";
import { useNavContext } from "@/contexts/NavContext";
import { JsonPage } from "@/types/page";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

interface PageRendererProps {
  page: JsonPage;
  expandCollapsibles?: boolean;
}

export default function PageRenderer({ page, expandCollapsibles = true }: PageRendererProps) {
  const [containerWidth, setContainerWidth] = useState(0);

  const { doneLoadingPage } = useNavContext();

  useEffect(() => {
    doneLoadingPage();
  }, [page.route]);

  const title = <View style={styles.titleContainer}>
      <ThemeText type="title" topic={page.topic}>{page.title}</ThemeText>
    </View>;

  const sections = () => {
    if (!page.sections) {
      return [];
    }

    const sectionNodes: React.ReactNode[] = [];
    const [tableDimensions, setTableDimensions] = useState<Map<string, { width: number, height: number }>>(new Map());

    let keys = new Map<string, number>();
    let indentNextParagraph = false;

    // Iterate through each section and create the appropriate content for each type of section.
    let content: React.ReactNode[] = [];
    let collapsibleHeader: React.ReactNode | null = null;

    function addSection() {
      const key = `section-${keys.get("section") ?? 0}`;
      keys.set("section", (keys.get("section") ?? 0) + 1);

      if (collapsibleHeader) {
        sectionNodes.push(
          <Collapsible 
            key={key} 
            topic={page.topic} 
            header={collapsibleHeader}
            defaultOpen={expandCollapsibles}
            style={{ width: containerWidth }}
            childrenStyle={{ gap: 10 }}
          >
            {content}
          </Collapsible>
        )
        collapsibleHeader = null;
      } else {
        sectionNodes.push(
          <View 
            key={key} 
            style={styles.sectionContainer}
          >
            {content}
          </View> 
        )
      }
      content = [];
    }

    for (const section of page.sections) {
      const key = `${section.type}-${keys.get(section.type) ?? 0}`;
      keys.set(section.type, (keys.get(section.type) ?? 0) + 1);

      switch (section.type) {
        case "text":
          content.push(<ThemeText key={key} type="default" indent={indentNextParagraph} parseMarkdown={true}>{section.text}</ThemeText>);
          break;
        case "heading":
          if (section.headingLevel === 1) {
            addSection();
            collapsibleHeader = <ThemeText type={"header"} topic={page.topic}>{section.text}</ThemeText>;
          } else {
            content.push(<ThemeText key={key} type={"subheader"} topic={page.topic} style={{ justifyContent: "flex-start" }}>{section.text}</ThemeText>);
          }
          break;
        case "aspects":
          content.push(<View key={key} style={styles.aspectsContainer}>
            {section.aspectsInfo?.map((aspect, index) => <ThemeText 
              key={index}
              type="caption" 
              style={{ fontWeight: "bold" }}
            >
              {aspect.name}: {aspect.value}
            </ThemeText>)}
          </View>);
          break;
        case "list":
          content.push(<List key={key} type={section.listInfo?.listType ?? "bullet"}>{section.listInfo?.listItems?.map((item, index) => <ThemeText key={index} type="default">{item}</ThemeText>)}</List>);
          break;
        case "table":
          content.push(
            <View 
              key={key} 
              style={[
                styles.tableContainer,
                { width: tableDimensions.get(key)?.width ?? undefined, height: tableDimensions.get(key)?.height ?? undefined }
              ]}
            >
              {section.tableInfo ? <Table 
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
                onDimensionsChange={(newWidth, newHeight) => {
                  setTableDimensions(prev => {
                    const newDimensions = new Map(prev);
                    newDimensions.set(key, { width: newWidth, height: newHeight });
                    return newDimensions;
                  });
                }}
              />
              : null}
            </View>
          );
          break;
        case "note":
          content.push(<Note 
            key={key}
            title={<ThemeText type="subheader">{section.noteInfo?.noteTitle}</ThemeText>}
            content={<ThemeText type="default">{section.noteInfo?.noteContent}</ThemeText>}
            topic={page.topic}
          />);
          break;
        default:
          break;
      }
      indentNextParagraph = section.type === "text";
    }
    addSection();
    return sectionNodes;
  };

  return (
    <ThemeView 
      style={styles.container} 
      onLayout={(event) => setContainerWidth(event.nativeEvent.layout.width - 22)}
    >
      {title}
      {sections()}
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
  titleContainer: {
    width: "100%",
    alignItems: "center",
  },
  sectionContainer: {
    justifyContent: "flex-start",
    alignItems: "flex-start",
    gap: 10,
  },
  tableContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  aspectsContainer: {
    justifyContent: "flex-start",
    alignItems: "flex-start",
    gap: 2,
  },
});