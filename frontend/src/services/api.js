import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error);
    throw error;
  }
);

export const todoAPI = {
  getTodos: async () => {
    try {
      const response = await api.get("/todos");
      return {
        ...response,
        data: Array.isArray(response.data) ? response.data : [],
      };
    } catch (error) {
      console.error("Error fetching todos:", error);
      throw error;
    }
  },

  createTodo: async (body) => {
    try {
      const response = await api.post("/todos", { body });
      return response;
    } catch (error) {
      console.error("Error creating todo:", error);
      throw error;
    }
  },

  updateTodo: async (id) => {
    try {
      const response = await api.put(`/todos/${id}`);
      return response;
    } catch (error) {
      console.error("Error updating todo:", error);
      throw error;
    }
  },

  deleteTodo: async (id) => {
    try {
      const response = await api.delete(`/todos/${id}`);
      return response;
    } catch (error) {
      console.error("Error deleting todo:", error);
      throw error;
    }
  },
};
