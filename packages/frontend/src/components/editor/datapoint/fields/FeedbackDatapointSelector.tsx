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
  // Function to generate label for a datapoint.
  const getLabel = (dp: DataPoint) => {
    const areas = "[" + dp.areas?.join(", ") + "]";
    return (
      areas +
      " Address " +
      dp.address +
      " - " +
      (dp.name?.length !== 0 ? dp.name : "Unnamed")
    );
  };

  // Get the currently selected feedback datapoint.
  const getCurrentFeedbackDatapoint = () => {
    if (!datapoint.feedbackDataPoint) return undefined;
    return datapoints?.find((dp) => dp.id === datapoint.feedbackDataPoint);
  };

  // Collection of datapoints for selection.
  const datapointCollection = createListCollection({
    items:
      datapoints
        ?.filter((dp) => dp.id !== datapoint.id)
        .filter((dp) => dp.type === datapoint.type)
        .map((dp) => ({ value: dp.id, label: getLabel(dp) })) || [],
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
        onValueChange={(e) => handleSelect(e.value[0])}
      >
        <Combobox.Label>Feedback Datapoint</Combobox.Label>
        <Combobox.Control>
          <Combobox.Input
            placeholder="Type to search"
            defaultValue={
              getCurrentFeedbackDatapoint() !== undefined
                ? getLabel(getCurrentFeedbackDatapoint()!)
                : ""
            }
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
