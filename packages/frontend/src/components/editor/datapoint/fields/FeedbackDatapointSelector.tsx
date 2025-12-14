import type { DataPoint } from "@/types/DataPoint";
import {
  Combobox,
  createListCollection,
  Field,
  useFilter,
  useListCollection,
} from "@chakra-ui/react";

interface Props {
  datapoint: DataPoint;
  datapoints?: DataPoint[];
  onSelect: (newDatapoint: DataPoint) => void;
}

const FeedbackDatapointSelector = ({
  datapoint,
  datapoints,
  onSelect,
}: Props) => {
  // Collection of datapoints for selection.
  const datapointCollection = createListCollection({
    items: datapoints?.map((dp) => ({ value: dp.id, label: dp.name })) || [],
  });

  // Filter out the current datapoint from the list.
  const { contains } = useFilter({ sensitivity: "base" });
  const { collection, filter } = useListCollection({
    initialItems: datapointCollection.items,
    filter: contains,
  });

  // Handle selection of feedback datapoint.
  const handleSelect = (selectedId: string) => {
    // Create new datapoint with updated feedback datapoint.
    const newDatapoint: DataPoint = {
      ...datapoint,
      feedbackDataPoint: selectedId || undefined,
    };

    // Notify parent component.
    onSelect(newDatapoint);
  };

  return (
    <Field.Root>
      <Combobox.Root
        collection={collection}
        onInputValueChange={(e) => filter(e.inputValue)}
        onSelect={(e) => handleSelect(e.itemValue)}
      >
        <Combobox.Label>Feedback Datapoint</Combobox.Label>
        <Combobox.Control>
          <Combobox.Input
            placeholder="Type to search"
            value={datapoint.feedbackDataPoint}
          />
          <Combobox.IndicatorGroup>
            <Combobox.ClearTrigger />
            <Combobox.Trigger />
          </Combobox.IndicatorGroup>
        </Combobox.Control>
        <Combobox.Positioner>
          <Combobox.Content>
            <Combobox.Empty>No datapoints found</Combobox.Empty>
            {collection.items.map((item) => (
              <Combobox.Item item={item} key={item.value}>
                {item.label}
                <Combobox.ItemIndicator />
              </Combobox.Item>
            ))}
          </Combobox.Content>
        </Combobox.Positioner>
      </Combobox.Root>
    </Field.Root>
  );
};

export default FeedbackDatapointSelector;
