import { API_URL } from "./Utils";

/**
 * Creates a new task via API
 */
export const CreateTask = async (taskObj) => {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(taskObj),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! Status: ${response.status}`);
    }
    return data;
  } catch (error) {
    console.error("Error creating task:", error);
    return { success: false, message: error.message || "Failed to create task" };
  }
};

/**
 * Fetches all tasks from the API
 */
export const FetchTask = async () => {
  try {
    const response = await fetch(API_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! Status: ${response.status}`);
    }
    return data;
  } catch (error) {
    console.error("Error Fetching tasks:", error);
    return { success: false, message: error.message || "Failed to fetch tasks", data: [] };
  }
};

/**
 * Deletes a task by ID
 */
export const DeleteTasks = async (id) => {
  const url = `${API_URL}/${id}`;
  try {
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! Status: ${response.status}`);
    }
    return data;
  } catch (error) {
    console.error("Error deleting task:", error);
    return { success: false, message: error.message || "Failed to delete task" };
  }
};

/**
 * Updates a task by ID (completes or edits fields)
 */
export const CompletedTasks = async (id, reqBody) => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reqBody),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! Status: ${response.status}`);
    }
    return data;
  } catch (error) {
    console.error("Error updating task:", error);
    return { success: false, message: error.message || "Failed to update task" };
  }
};
