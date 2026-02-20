type WorkerRow = {
  name: string;
  city: string;
  county: string;
  pfcc: boolean;
  rating: string;
  programType: string;
};

type InitMessage = {
  type: "init";
  rows: WorkerRow[];
};

type FilterMessage = {
  type: "filter";
  requestId: number;
  searchQuery: string;
  pfccEnabled: boolean;
  selectedRatings: string[];
  selectedProgramTypes: string[];
  selectedCity: string;
  selectedCounty: string;
};

type WorkerMessage = InitMessage | FilterMessage;

let rows: WorkerRow[] = [];

function runFilter({
  searchQuery,
  pfccEnabled,
  selectedRatings,
  selectedProgramTypes,
  selectedCity,
  selectedCounty,
}: Omit<FilterMessage, "type" | "requestId">): number[] {
  const hasQuery = searchQuery.length > 0;
  const hasRatings = selectedRatings.length > 0;
  const hasProgramTypes = selectedProgramTypes.length > 0;
  const hasCity = selectedCity.length > 0;
  const hasCounty = selectedCounty.length > 0;

  const results: number[] = [];

  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index];

    if (hasQuery && !row.name.includes(searchQuery)) continue;
    if (hasCity && row.city !== selectedCity) continue;
    if (hasCounty && row.county !== selectedCounty) continue;
    if (pfccEnabled && !row.pfcc) continue;
    if (hasRatings && !selectedRatings.includes(row.rating)) continue;
    if (hasProgramTypes && !selectedProgramTypes.includes(row.programType)) continue;

    results.push(index);
  }

  return results;
}

self.onmessage = (event: MessageEvent<WorkerMessage>) => {
  const message = event.data;

  if (message.type === "init") {
    rows = message.rows;
    self.postMessage({ type: "initialized", count: rows.length });
    return;
  }

  if (message.type === "filter") {
    const indices = runFilter({
      searchQuery: message.searchQuery,
      pfccEnabled: message.pfccEnabled,
      selectedRatings: message.selectedRatings,
      selectedProgramTypes: message.selectedProgramTypes,
      selectedCity: message.selectedCity,
      selectedCounty: message.selectedCounty,
    });

    self.postMessage({
      type: "filtered",
      requestId: message.requestId,
      indices,
    });
  }
};
