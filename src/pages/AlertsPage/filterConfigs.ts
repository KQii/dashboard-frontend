import { FilterConfig } from "../../components/container/Table";
import {
  PAST_TIME_RANGE_OPTIONS,
  createTimeRangeTransform,
  createDateRangeTransform,
} from "./utils";

export const createAlertRulesFilterConfig = (
  ruleGroups: string[]
): FilterConfig[] => [
  {
    type: "text",
    label: "Name",
    field: "name",
    placeholder: "Search by name...",
  },
  {
    type: "combobox",
    label: "Group",
    field: "groupName",
    placeholder: "Search rule group...",
    options: ruleGroups,
  },
  {
    type: "checkbox",
    label: "Severity",
    field: "severity",
    options: ["critical", "warning", "info"],
  },
  {
    type: "checkbox",
    label: "Status",
    field: "state",
    options: ["firing", "pending", "inactive"],
  },
];

export const activeAlertFilterConfig: FilterConfig[] = [
  {
    type: "text",
    label: "Name",
    field: "name",
    placeholder: "Search by name...",
  },
  {
    type: "checkbox",
    label: "Severity",
    field: "severity",
    options: ["critical", "warning", "info"],
  },
  {
    type: "checkbox",
    label: "Status",
    field: "state",
    options: ["active", "suppressed", "resolved", "unprocessed"],
  },
  {
    type: "timerange",
    label: "Start Time",
    field: "startsAt",
    selectOptions: PAST_TIME_RANGE_OPTIONS,
    transformValue: createTimeRangeTransform("startsAt"),
  },
  {
    type: "timerange",
    label: "Last Update",
    field: "updatedAt",
    selectOptions: PAST_TIME_RANGE_OPTIONS,
    transformValue: createTimeRangeTransform("updatedAt"),
  },
];

export const silenceFilterConfig: FilterConfig[] = [
  {
    type: "text",
    label: "Silence ID",
    field: "id",
    placeholder: "Search by ID...",
  },
  {
    type: "text",
    label: "Created By",
    field: "createdBy",
    placeholder: "Search by creator...",
  },
  {
    type: "checkbox",
    label: "Status",
    field: "state",
    options: ["active", "pending", "expired"],
  },
  {
    type: "daterange",
    label: "Start Time",
    field: "startsAt",
    placeholder: "Select start date range",
    transformValue: createDateRangeTransform("startsAt"),
  },
  {
    type: "daterange",
    label: "End Time",
    field: "endsAt",
    placeholder: "Select end date range",
    transformValue: createDateRangeTransform("endsAt"),
  },
  {
    type: "daterange",
    label: "Last Update",
    field: "updatedAt",
    placeholder: "Select update date range",
    transformValue: createDateRangeTransform("updatedAt"),
  },
];
