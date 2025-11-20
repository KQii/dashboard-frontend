import { capitalize } from "../utils/capitalize";
import { AlertChannel } from "../types";

const dashboardBackendUrl = import.meta.env.VITE_DASHBOARD_BACKEND_URL;

const descriptionMap: Record<string, Record<string, string>> = {
  email: {
    name: " - Operations Team",
    description: "Sends alerts to ...",
  },
  slack: {
    name: " - ...",
    description: "Posts to ... channel on Slack",
  },
};

export async function fetchChannels(): Promise<AlertChannel[]> {
  try {
    const response = await fetch(
      `${dashboardBackendUrl}/api/alertmanager/channels`
    );

    if (!response.ok) {
      const errorBody = await response.json();
      throw new Error(
        errorBody.message || `HTTP error! status: ${response.status}`
      );
    }

    const result = await response.json();
    const channels = result.data.map((c: Record<string, string>) => {
      const name = capitalize(
        c.type
          .concat(descriptionMap[c.type]["name"])
          .replace(/\.\.\./g, c.sendTo)
      );
      const description = descriptionMap[c.type]["description"].replace(
        /\.\.\./g,
        c.sendTo
      );

      return {
        ...c,
        name,
        description,
      };
    });

    return channels;
  } catch (error) {
    console.error("Error fetching rule groups:", error);
    throw error;
  }
}
